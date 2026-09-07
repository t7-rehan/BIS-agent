"""CLI and programmatic indexing pipeline for BIS curated knowledge into ChromaDB."""

import argparse
import json
import logging
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Ensure backend and repo root are in sys.path
_repo_root = Path(__file__).resolve().parent.parent
_backend_dir = _repo_root / "backend"
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))

from app.core.config import settings
from rag.chunking.chunker import TextChunk, chunk_text
from rag.vector_store.chroma_store import ChromaStore

logger = logging.getLogger("bis_index")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def find_data_dir() -> Path:
    """Dynamically locate rag/data directory relative to repo root or cwd."""
    repo_root = Path(__file__).resolve().parent.parent
    candidate = repo_root / "rag" / "data"
    if candidate.exists():
        return candidate

    cwd_candidate = Path.cwd() / "rag" / "data"
    if cwd_candidate.exists():
        return cwd_candidate

    parent_candidate = Path.cwd().parent / "rag" / "data"
    if parent_candidate.exists():
        return parent_candidate

    raise FileNotFoundError(f"Could not locate 'rag/data' directory. Checked: {candidate}, {cwd_candidate}")


def load_json(filepath: Path) -> List[Dict[str, Any]]:
    """Load JSON data file."""
    if not filepath.exists():
        raise FileNotFoundError(f"Missing data file: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def prepare_chunks(data_dir: Path) -> Tuple[List[TextChunk], Dict[str, int]]:
    """Transform all curated BIS JSON documents into structured TextChunks.

    Field names in the JSON files:
    - general_knowledge: id, topic, title, text, source_url, source_type, retrieved_at
    - standards: id, is_number, title, product_category, description, technical_department, status, source_url, source_title, retrieved_at
    - qcos: id, qco_name, product, is_numbers[], issuing_ministry, mandatory, enforcement_date, amendments[], source_url, retrieved_at
    - certification_schemes: id, scheme_name, product, is_numbers[], certification_type, mandatory, source_url
    - laboratories: id, laboratory_name, lab_code, location, state, applicable_is_numbers[], testing_scope[], validity, source_url
    - products: id, product_name, aliases[], category, applicable_is_numbers[], qco_ids[], certification_scheme_ids[], source_url
    - bis_services (optional): id, service_name, purpose, who_uses, process_summary, source_url, retrieved_at

    Returns:
        Tuple of (all_chunks, counts_by_type)
    """
    all_chunks: List[TextChunk] = []
    counts_by_type: Dict[str, int] = {
        "general_knowledge": 0,
        "standard": 0,
        "qco": 0,
        "certification_scheme": 0,
        "laboratory": 0,
        "product": 0,
        "bis_service": 0,
    }

    # 1. General Knowledge
    gk_items = load_json(data_dir / "general_knowledge.json")
    for item in gk_items:
        # Actual field name is "text", not "content"; no "key_points" field exists
        text = (
            f"Topic: {item.get('topic', '')}\n"
            f"Title: {item.get('title', '')}\n"
            f"Overview:\n{item.get('text', '')}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "GENERAL_KNOWLEDGE",
            "document_type": "general_knowledge",
            "source_url": item.get("source_url", ""),
            "source_title": item.get("title", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=item.get("title", ""),
            source_url=item.get("source_url", ""),
            source_type="GENERAL_KNOWLEDGE",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["general_knowledge"] += len(chunks)

    # 2. Standards
    std_items = load_json(data_dir / "standards.json")
    for item in std_items:
        text = (
            f"Indian Standard: {item.get('is_number', '')}\n"
            f"Standard Title: {item.get('title', '')}\n"
            f"Product Category: {item.get('product_category', '')}\n"
            f"Technical Department: {item.get('technical_department', '')}\n"
            f"Status: {item.get('status', '')}\n"
            f"Scope and Description:\n{item.get('description', '')}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "BIS_STANDARD",
            "document_type": "standard",
            "is_number": item.get("is_number", ""),
            "source_url": item.get("source_url", ""),
            "source_title": item.get("source_title") or item.get("title", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=f"{item.get('is_number', '')} - {item.get('title', '')}",
            source_url=item.get("source_url", ""),
            source_type="BIS_STANDARD",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["standard"] += len(chunks)

    # 3. QCOs — actual fields: qco_name, product, is_numbers, issuing_ministry,
    #            mandatory, enforcement_date, amendments
    qco_items = load_json(data_dir / "qcos.json")
    for item in qco_items:
        covered = ", ".join(item.get("is_numbers", []))
        amendments_str = "; ".join(item.get("amendments", []))
        mandatory_str = "Mandatory" if item.get("mandatory", True) else "Voluntary"
        text = (
            f"Quality Control Order (QCO): {item.get('qco_name', '')}\n"
            f"Covered Product: {item.get('product', '')}\n"
            f"Issuing Ministry: {item.get('issuing_ministry', '')}\n"
            f"Mandatory Status: {mandatory_str}\n"
            f"Enforcement Date: {item.get('enforcement_date', '')}\n"
            f"Indian Standards Mandated: {covered}\n"
            f"Gazette / Amendment History: {amendments_str}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "BIS_QCO",
            "document_type": "qco",
            "qco_id": item["id"],
            "source_url": item.get("source_url", ""),
            "source_title": item.get("qco_name", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=item.get("qco_name", ""),
            source_url=item.get("source_url", ""),
            source_type="BIS_QCO",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["qco"] += len(chunks)

    # 4. Certification Schemes — actual fields: scheme_name, product, is_numbers,
    #    certification_type, mandatory
    scheme_items = load_json(data_dir / "certification_schemes.json")
    for item in scheme_items:
        is_numbers_str = ", ".join(item.get("is_numbers", []))
        mandatory_str = "Mandatory" if item.get("mandatory", True) else "Voluntary"
        text = (
            f"BIS Certification Scheme: {item.get('scheme_name', '')}\n"
            f"Certification Type: {item.get('certification_type', '')}\n"
            f"Applicable To: {item.get('product', '')}\n"
            f"Mandatory Status: {mandatory_str}\n"
            f"Indian Standards Covered: {is_numbers_str}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "BIS_SCHEME",
            "document_type": "certification_scheme",
            "certification_scheme_id": item["id"],
            "source_url": item.get("source_url", ""),
            "source_title": item.get("scheme_name", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=item.get("scheme_name", ""),
            source_url=item.get("source_url", ""),
            source_type="BIS_SCHEME",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["certification_scheme"] += len(chunks)

    # 5. Laboratories — actual fields: laboratory_name, lab_code, location, state,
    #    applicable_is_numbers, testing_scope, validity
    lab_items = load_json(data_dir / "laboratories.json")
    for item in lab_items:
        stds = ", ".join(item.get("applicable_is_numbers", []))
        scope = "; ".join(item.get("testing_scope", []))
        text = (
            f"BIS Recognized Laboratory: {item.get('laboratory_name', '')}\n"
            f"Lab Code: {item.get('lab_code', '')}\n"
            f"Location: {item.get('location', '')}, {item.get('state', '')}\n"
            f"Recognised for Testing Standards: {stds}\n"
            f"Testing Capabilities: {scope}\n"
            f"Validity / Status: {item.get('validity', '')}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "BIS_LABORATORY",
            "document_type": "laboratory",
            "laboratory_id": item["id"],
            "source_url": item.get("source_url", ""),
            "source_title": item.get("laboratory_name", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=item.get("laboratory_name", ""),
            source_url=item.get("source_url", ""),
            source_type="BIS_LABORATORY",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["laboratory"] += len(chunks)

    # 6. Products — actual fields: product_name, aliases[], category,
    #    applicable_is_numbers[], qco_ids[], certification_scheme_ids[]
    prod_items = load_json(data_dir / "products.json")
    for item in prod_items:
        aliases = ", ".join(item.get("aliases", []))
        is_numbers_str = ", ".join(item.get("applicable_is_numbers", []))
        qco_ids_str = ", ".join(item.get("qco_ids", []))
        scheme_ids_str = ", ".join(item.get("certification_scheme_ids", []))
        text = (
            f"Product: {item.get('product_name', '')}\n"
            f"Common Names / Aliases: {aliases}\n"
            f"Category: {item.get('category', '')}\n"
            f"Applicable Indian Standards: {is_numbers_str}\n"
            f"Governing Quality Control Orders: {qco_ids_str or 'None'}\n"
            f"Certification Schemes: {scheme_ids_str}\n"
            f"Official Source: {item.get('source_url', '')}"
        )
        extra_meta = {
            "source_type": "BIS_PRODUCT",
            "document_type": "product",
            "product_id": item["id"],
            "product_name": item.get("product_name", ""),
            "is_number": (item.get("applicable_is_numbers") or [""])[0],
            "source_url": item.get("source_url", ""),
            "source_title": item.get("product_name", ""),
            "retrieved_at": item.get("retrieved_at", ""),
        }
        chunks = chunk_text(
            text=text,
            document_id=item["id"],
            document_title=item.get("product_name", ""),
            source_url=item.get("source_url", ""),
            source_type="BIS_PRODUCT",
            chunk_size=700,
            chunk_overlap=80,
            extra_metadata=extra_meta,
        )
        all_chunks.extend(chunks)
        counts_by_type["product"] += len(chunks)

    # 7. BIS Services (optional — file may not exist yet)
    services_path = data_dir / "bis_services.json"
    if services_path.exists():
        svc_items = load_json(services_path)
        for item in svc_items:
            text = (
                f"BIS Service: {item.get('service_name', '')}\n"
                f"Purpose: {item.get('purpose', '')}\n"
                f"Who Uses This: {item.get('who_uses', '')}\n"
                f"Process Summary:\n{item.get('process_summary', '')}\n"
                f"Official URL: {item.get('source_url', '')}"
            )
            extra_meta = {
                "source_type": "BIS_SERVICE",
                "document_type": "bis_service",
                "service_id": item["id"],
                "source_url": item.get("source_url", ""),
                "source_title": item.get("service_name", ""),
                "retrieved_at": item.get("retrieved_at", ""),
            }
            chunks = chunk_text(
                text=text,
                document_id=item["id"],
                document_title=item.get("service_name", ""),
                source_url=item.get("source_url", ""),
                source_type="BIS_SERVICE",
                chunk_size=700,
                chunk_overlap=80,
                extra_metadata=extra_meta,
            )
            all_chunks.extend(chunks)
            counts_by_type["bis_service"] += len(chunks)

    return all_chunks, counts_by_type


def run_indexing(
    reset: bool = False,
    data_dir: Optional[Path] = None,
    store: Optional[ChromaStore] = None,
) -> Dict[str, Any]:
    """Run full knowledge indexing into ChromaDB.
    
    Args:
        reset: Whether to drop the collection before indexing.
        data_dir: Optional path to data dir.
        store: Optional pre-configured ChromaStore instance.
        
    Returns:
        Summary dict of indexing metrics.
    """
    start_time = time.time()
    target_data_dir = data_dir or find_data_dir()
    logger.info(f"Starting BIS knowledge indexing from {target_data_dir}...")

    vector_store = store or ChromaStore()
    if reset:
        logger.info("Resetting Chroma collection prior to indexing...")
        vector_store.reset()

    chunks, counts_by_type = prepare_chunks(target_data_dir)
    logger.info(f"Generated {len(chunks)} total chunks across {len(counts_by_type)} entity categories.")

    upserted_count = vector_store.add_chunks(chunks)
    elapsed = time.time() - start_time

    summary = {
        "status": "success",
        "total_chunks_prepared": len(chunks),
        "total_chunks_upserted": upserted_count,
        "collection_count_after": vector_store.count(),
        "breakdown": counts_by_type,
        "elapsed_seconds": round(elapsed, 2),
    }

    logger.info("Indexing completed successfully in %.2fs!", elapsed)
    logger.info("Summary: %s", json.dumps(summary, indent=2))
    return summary


def main():
    """CLI entry point for indexing."""
    parser = argparse.ArgumentParser(description="Index BIS Curated Knowledge into ChromaDB.")
    parser.add_argument("--reset", action="store_true", help="Reset/recreate ChromaDB collection before indexing.")
    parser.add_argument("--data-dir", type=str, default=None, help="Custom path to rag/data directory.")
    args = parser.parse_args()

    custom_data_dir = Path(args.data_dir) if args.data_dir else None
    run_indexing(reset=args.reset, data_dir=custom_data_dir)


if __name__ == "__main__":
    main()
