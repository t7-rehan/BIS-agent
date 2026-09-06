"""Idempotent seed pipeline importing Phase 2 JSON datasets into SQLite."""

import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine, init_db
from app.db.models import (
    CertificationScheme,
    GeneralKnowledge,
    Laboratory,
    Product,
    ProductAlias,
    QCO,
    Standard,
)

logger = logging.getLogger("bis_seed")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def find_data_dir() -> Path:
    """Dynamically locate the rag/data directory relative to project root."""
    # Try relative to this file: backend/app/db/seed.py -> repo_root / rag / data
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    candidate = repo_root / "rag" / "data"
    if candidate.exists():
        return candidate

    # Fallback to current working directory
    cwd_candidate = Path.cwd() / "rag" / "data"
    if cwd_candidate.exists():
        return cwd_candidate

    cwd_parent_candidate = Path.cwd().parent / "rag" / "data"
    if cwd_parent_candidate.exists():
        return cwd_parent_candidate

    raise FileNotFoundError(f"Could not locate 'rag/data' directory. Checked: {candidate}, {cwd_candidate}")


def load_json(filepath: Path) -> List[Dict[str, Any]]:
    """Read and parse a JSON dataset file."""
    if not filepath.exists():
        raise FileNotFoundError(f"Required JSON dataset missing: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_database(
    db: Session,
    data_dir: Optional[Path] = None,
    init_tables: bool = True,
) -> Dict[str, int]:
    """Import all Phase 2 curated JSON records into the database idempotently.

    Args:
        db: Active SQLAlchemy session.
        data_dir: Path to rag/data directory (resolved automatically if None).
        init_tables: Whether to create database tables if they do not exist.

    Returns:
        Dict[str, int]: Summary count of seeded records per entity type.
    """
    if init_tables:
        init_db()

    target_dir = data_dir or find_data_dir()
    logger.info("Seeding database using source datasets from: %s", target_dir)

    # 1. Load raw JSON files
    raw_standards = load_json(target_dir / "standards.json")
    raw_products = load_json(target_dir / "products.json")
    raw_qcos = load_json(target_dir / "qcos.json")
    raw_schemes = load_json(target_dir / "certification_schemes.json")
    raw_labs = load_json(target_dir / "laboratories.json")
    raw_gk = load_json(target_dir / "general_knowledge.json")

    # 2. Seed Standards first (foundation for all relational links)
    standards_by_is: Dict[str, Standard] = {}
    for item in raw_standards:
        std = db.get(Standard, item["id"])
        if not std:
            std = Standard(id=item["id"])
            db.add(std)

        std.is_number = item["is_number"].strip()
        std.title = item["title"]
        std.product_category = item["product_category"]
        std.description = item["description"]
        std.technical_department = item["technical_department"]
        std.status = item["status"]
        std.source_url = item["source_url"]
        std.source_title = item.get("source_title")
        std.retrieved_at = item.get("retrieved_at")

        standards_by_is[std.is_number] = std

    db.flush()
    logger.info("  Seeded %d standards.", len(raw_standards))

    # 3. Seed QCOs and link to Standards
    qcos_by_id: Dict[str, QCO] = {}
    for item in raw_qcos:
        qco = db.get(QCO, item["id"])
        if not qco:
            qco = QCO(id=item["id"])
            db.add(qco)

        qco.qco_name = item["qco_name"]
        qco.product = item["product"]
        qco.issuing_ministry = item["issuing_ministry"]
        qco.mandatory = item["mandatory"]
        qco.enforcement_date = item["enforcement_date"]
        qco.amendments = item["amendments"]
        qco.source_url = item["source_url"]
        qco.retrieved_at = item.get("retrieved_at")

        # Map many-to-many standards
        qco_stds = []
        for is_no in item.get("is_numbers", []):
            clean_is = is_no.strip()
            if clean_is in standards_by_is:
                qco_stds.append(standards_by_is[clean_is])
            else:
                logger.warning("QCO %s references unknown is_number: '%s'", item["id"], clean_is)
        qco.standards = qco_stds
        qcos_by_id[qco.id] = qco

    db.flush()
    logger.info("  Seeded %d QCOs.", len(raw_qcos))

    # 4. Seed Certification Schemes and link to Standards
    schemes_by_id: Dict[str, CertificationScheme] = {}
    for item in raw_schemes:
        scheme = db.get(CertificationScheme, item["id"])
        if not scheme:
            scheme = CertificationScheme(id=item["id"])
            db.add(scheme)

        scheme.scheme_name = item["scheme_name"]
        scheme.product = item["product"]
        scheme.certification_type = item["certification_type"]
        scheme.mandatory = item["mandatory"]
        scheme.source_url = item["source_url"]

        # Map many-to-many standards
        scheme_stds = []
        for is_no in item.get("is_numbers", []):
            clean_is = is_no.strip()
            if clean_is in standards_by_is:
                scheme_stds.append(standards_by_is[clean_is])
            else:
                logger.warning("Scheme %s references unknown is_number: '%s'", item["id"], clean_is)
        scheme.standards = scheme_stds
        schemes_by_id[scheme.id] = scheme

    db.flush()
    logger.info("  Seeded %d certification schemes.", len(raw_schemes))

    # 5. Seed Products and link to Standards, QCOs, Schemes, and Aliases
    for item in raw_products:
        prod = db.get(Product, item["id"])
        if not prod:
            prod = Product(id=item["id"])
            db.add(prod)

        prod.product_name = item["product_name"]
        prod.category = item["category"]
        prod.source_url = item["source_url"]

        # Re-sync aliases cleanly
        prod.aliases.clear()
        for alias_str in item.get("aliases", []):
            clean_alias = alias_str.strip()
            if clean_alias:
                prod.aliases.append(ProductAlias(alias=clean_alias))

        # Map standards
        prod_stds = []
        for is_no in item.get("applicable_is_numbers", []):
            clean_is = is_no.strip()
            if clean_is in standards_by_is:
                prod_stds.append(standards_by_is[clean_is])
            else:
                logger.warning("Product %s references unknown is_number: '%s'", item["id"], clean_is)
        prod.standards = prod_stds

        # Map QCOs
        prod_qcos = []
        for qco_id in item.get("qco_ids", []):
            if qco_id in qcos_by_id:
                prod_qcos.append(qcos_by_id[qco_id])
            else:
                logger.warning("Product %s references unknown qco_id: '%s'", item["id"], qco_id)
        prod.qcos = prod_qcos

        # Map Certification Schemes
        prod_schemes = []
        for sch_id in item.get("certification_scheme_ids", []):
            if sch_id in schemes_by_id:
                prod_schemes.append(schemes_by_id[sch_id])
            else:
                logger.warning("Product %s references unknown scheme_id: '%s'", item["id"], sch_id)
        prod.certification_schemes = prod_schemes

    db.flush()
    logger.info("  Seeded %d products.", len(raw_products))

    # 6. Seed Laboratories and link to Standards
    for item in raw_labs:
        lab = db.get(Laboratory, item["id"])
        if not lab:
            lab = Laboratory(id=item["id"])
            db.add(lab)

        lab.laboratory_name = item["laboratory_name"]
        lab.lab_code = item["lab_code"]
        lab.location = item["location"]
        lab.state = item["state"]
        lab.testing_scope = item.get("testing_scope", [])
        lab.validity = item["validity"]
        lab.source_url = item["source_url"]

        # Map standards
        lab_stds = []
        for is_no in item.get("applicable_is_numbers", []):
            clean_is = is_no.strip()
            if clean_is in standards_by_is:
                lab_stds.append(standards_by_is[clean_is])
            else:
                logger.warning("Lab %s references unknown is_number: '%s'", item["id"], clean_is)
        lab.standards = lab_stds

    db.flush()
    logger.info("  Seeded %d laboratories.", len(raw_labs))

    # 7. Seed General Knowledge articles
    for item in raw_gk:
        gk = db.get(GeneralKnowledge, item["id"])
        if not gk:
            gk = GeneralKnowledge(id=item["id"])
            db.add(gk)

        gk.topic = item["topic"]
        gk.title = item["title"]
        gk.text = item["text"]
        gk.source_url = item["source_url"]
        gk.source_type = item["source_type"]
        gk.retrieved_at = item.get("retrieved_at")

    db.commit()
    logger.info("  Seeded %d general knowledge articles.", len(raw_gk))

    summary = {
        "standards": len(raw_standards),
        "products": len(raw_products),
        "qcos": len(raw_qcos),
        "certification_schemes": len(raw_schemes),
        "laboratories": len(raw_labs),
        "general_knowledge": len(raw_gk),
    }
    logger.info("Database seeding successfully completed with counts: %s", summary)
    return summary


def run_seed_cli() -> None:
    """CLI entrypoint to execute database seeding."""
    init_db()
    with SessionLocal() as db:
        try:
            summary = seed_database(db)
            print("\n==========================================")
            print("DATABASE SEED COMPLETED SUCCESSFULLY")
            print("==========================================")
            for entity, count in summary.items():
                print(f"{entity.replace('_', ' ').title():<25}: {count}")
            print("==========================================\n")
        except Exception as e:
            db.rollback()
            logger.exception("Database seeding failed: %s", e)
            sys.exit(1)


if __name__ == "__main__":
    run_seed_cli()
