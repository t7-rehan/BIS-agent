"""Automated data integrity, schema compliance, and relational validation script."""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Set

DATA_DIR = Path(__file__).resolve().parent / "data"
SOURCES_DIR = Path(__file__).resolve().parent / "sources"


class ValidationError(Exception):
    """Raised when data integrity rules are violated."""


def load_json(filepath: Path) -> Any:
    """Load JSON file and return contents."""
    if not filepath.exists():
        raise FileNotFoundError(f"Missing required dataset: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_sources(sources: List[Dict[str, Any]]) -> None:
    """Validate sources.json schema and unique source IDs."""
    print("Validating sources.json...")
    required_fields = {"source_id", "title", "url", "source_type", "authority", "retrieved_at", "status"}
    seen_ids: Set[str] = set()

    for idx, src in enumerate(sources):
        missing = required_fields - set(src.keys())
        if missing:
            raise ValidationError(f"Source at index {idx} missing fields: {missing}")
        if src["source_id"] in seen_ids:
            raise ValidationError(f"Duplicate source_id: {src['source_id']}")
        seen_ids.add(src["source_id"])
        if not src["url"].startswith("http"):
            raise ValidationError(f"Invalid source URL for {src['source_id']}: {src['url']}")

    print(f"  OK: {len(sources)} sources validated.")


def validate_standards(standards: List[Dict[str, Any]]) -> Set[str]:
    """Validate standards.json and return set of valid IS numbers."""
    print("Validating standards.json...")
    required_fields = {
        "id", "is_number", "title", "product_category", "description",
        "technical_department", "status", "source_url", "source_title", "retrieved_at"
    }
    seen_ids: Set[str] = set()
    is_numbers: Set[str] = set()

    for idx, std in enumerate(standards):
        missing = required_fields - set(std.keys())
        if missing:
            raise ValidationError(f"Standard at index {idx} missing fields: {missing}")

        if std["id"] in seen_ids:
            raise ValidationError(f"Duplicate standard ID: {std['id']}")
        seen_ids.add(std["id"])

        is_no = std["is_number"].strip()
        if not is_no:
            raise ValidationError(f"Standard {std['id']} has empty is_number")
        if is_no in is_numbers:
            raise ValidationError(f"Duplicate is_number: {is_no}")
        is_numbers.add(is_no)

        if not std["source_url"].startswith("http"):
            raise ValidationError(f"Standard {std['id']} has invalid source_url: {std['source_url']}")

    print(f"  OK: {len(standards)} standards validated.")
    return is_numbers


def validate_qcos(qcos: List[Dict[str, Any]], valid_is_numbers: Set[str]) -> Set[str]:
    """Validate qcos.json and cross-reference with valid IS numbers."""
    print("Validating qcos.json...")
    required_fields = {
        "id", "qco_name", "product", "is_numbers", "issuing_ministry",
        "mandatory", "enforcement_date", "amendments", "source_url", "retrieved_at"
    }
    qco_ids: Set[str] = set()

    for idx, qco in enumerate(qcos):
        missing = required_fields - set(qco.keys())
        if missing:
            raise ValidationError(f"QCO at index {idx} missing fields: {missing}")

        if qco["id"] in qco_ids:
            raise ValidationError(f"Duplicate QCO ID: {qco['id']}")
        qco_ids.add(qco["id"])

        if not isinstance(qco["is_numbers"], list) or not qco["is_numbers"]:
            raise ValidationError(f"QCO {qco['id']} must have non-empty is_numbers list")

        for is_no in qco["is_numbers"]:
            if is_no not in valid_is_numbers:
                raise ValidationError(f"QCO {qco['id']} references unknown is_number: '{is_no}'")

        if not qco["source_url"].startswith("http"):
            raise ValidationError(f"QCO {qco['id']} has invalid source_url: {qco['source_url']}")

    print(f"  OK: {len(qcos)} QCOs validated.")
    return qco_ids


def validate_schemes(schemes: List[Dict[str, Any]], valid_is_numbers: Set[str]) -> Set[str]:
    """Validate certification_schemes.json and cross-reference with valid IS numbers."""
    print("Validating certification_schemes.json...")
    required_fields = {"id", "scheme_name", "product", "is_numbers", "certification_type", "mandatory", "source_url"}
    scheme_ids: Set[str] = set()

    for idx, sch in enumerate(schemes):
        missing = required_fields - set(sch.keys())
        if missing:
            raise ValidationError(f"Scheme at index {idx} missing fields: {missing}")

        if sch["id"] in scheme_ids:
            raise ValidationError(f"Duplicate Scheme ID: {sch['id']}")
        scheme_ids.add(sch["id"])

        if not isinstance(sch["is_numbers"], list) or not sch["is_numbers"]:
            raise ValidationError(f"Scheme {sch['id']} must have non-empty is_numbers list")

        for is_no in sch["is_numbers"]:
            if is_no not in valid_is_numbers:
                raise ValidationError(f"Scheme {sch['id']} references unknown is_number: '{is_no}'")

        if not sch["source_url"].startswith("http"):
            raise ValidationError(f"Scheme {sch['id']} has invalid source_url: {sch['source_url']}")

    print(f"  OK: {len(schemes)} schemes validated.")
    return scheme_ids


def validate_products(
    products: List[Dict[str, Any]],
    valid_is_numbers: Set[str],
    valid_qco_ids: Set[str],
    valid_scheme_ids: Set[str],
) -> None:
    """Validate products.json and relational references to standards, QCOs, and schemes."""
    print("Validating products.json...")
    required_fields = {
        "id", "product_name", "aliases", "category", "applicable_is_numbers",
        "qco_ids", "certification_scheme_ids", "source_url"
    }
    product_ids: Set[str] = set()

    for idx, prod in enumerate(products):
        missing = required_fields - set(prod.keys())
        if missing:
            raise ValidationError(f"Product at index {idx} missing fields: {missing}")

        if prod["id"] in product_ids:
            raise ValidationError(f"Duplicate Product ID: {prod['id']}")
        product_ids.add(prod["id"])

        # Validate standard references
        if not isinstance(prod["applicable_is_numbers"], list) or not prod["applicable_is_numbers"]:
            raise ValidationError(f"Product {prod['id']} must have non-empty applicable_is_numbers list")

        for is_no in prod["applicable_is_numbers"]:
            if is_no not in valid_is_numbers:
                raise ValidationError(f"Product {prod['id']} references unknown is_number: '{is_no}'")

        # Validate QCO references
        for qco_id in prod["qco_ids"]:
            if qco_id not in valid_qco_ids:
                raise ValidationError(f"Product {prod['id']} references unknown qco_id: '{qco_id}'")

        # Validate Scheme references
        for sch_id in prod["certification_scheme_ids"]:
            if sch_id not in valid_scheme_ids:
                raise ValidationError(f"Product {prod['id']} references unknown certification_scheme_id: '{sch_id}'")

        if not prod["source_url"].startswith("http"):
            raise ValidationError(f"Product {prod['id']} has invalid source_url: {prod['source_url']}")

    print(f"  OK: {len(products)} products validated.")


def validate_laboratories(laboratories: List[Dict[str, Any]], valid_is_numbers: Set[str]) -> None:
    """Validate laboratories.json and ensure all tested standards match valid IS numbers."""
    print("Validating laboratories.json...")
    required_fields = {
        "id", "laboratory_name", "lab_code", "location", "state",
        "applicable_is_numbers", "testing_scope", "validity", "source_url"
    }
    lab_ids: Set[str] = set()

    for idx, lab in enumerate(laboratories):
        missing = required_fields - set(lab.keys())
        if missing:
            raise ValidationError(f"Laboratory at index {idx} missing fields: {missing}")

        if lab["id"] in lab_ids:
            raise ValidationError(f"Duplicate Laboratory ID: {lab['id']}")
        lab_ids.add(lab["id"])

        if not isinstance(lab["applicable_is_numbers"], list) or not lab["applicable_is_numbers"]:
            raise ValidationError(f"Laboratory {lab['id']} must have non-empty applicable_is_numbers list")

        for is_no in lab["applicable_is_numbers"]:
            if is_no not in valid_is_numbers:
                raise ValidationError(f"Laboratory {lab['id']} references unknown is_number: '{is_no}'")

        if not lab["source_url"].startswith("http"):
            raise ValidationError(f"Laboratory {lab['id']} has invalid source_url: {lab['source_url']}")

    print(f"  OK: {len(laboratories)} laboratories validated.")


def validate_general_knowledge(articles: List[Dict[str, Any]]) -> None:
    """Validate general_knowledge.json records."""
    print("Validating general_knowledge.json...")
    required_fields = {"id", "topic", "title", "text", "source_url", "source_type", "retrieved_at"}
    article_ids: Set[str] = set()

    for idx, art in enumerate(articles):
        missing = required_fields - set(art.keys())
        if missing:
            raise ValidationError(f"Article at index {idx} missing fields: {missing}")

        if art["id"] in article_ids:
            raise ValidationError(f"Duplicate Article ID: {art['id']}")
        article_ids.add(art["id"])

        if len(art["text"].strip()) < 50:
            raise ValidationError(f"Article {art['id']} text is too short (< 50 chars)")

        if not art["source_url"].startswith("http"):
            raise ValidationError(f"Article {art['id']} has invalid source_url: {art['source_url']}")

    print(f"  OK: {len(articles)} general knowledge articles validated.")


def run_all_validations() -> bool:
    """Execute complete validation suite across all datasets."""
    try:
        sources = load_json(SOURCES_DIR / "sources.json")
        standards = load_json(DATA_DIR / "standards.json")
        qcos = load_json(DATA_DIR / "qcos.json")
        schemes = load_json(DATA_DIR / "certification_schemes.json")
        products = load_json(DATA_DIR / "products.json")
        laboratories = load_json(DATA_DIR / "laboratories.json")
        general_knowledge = load_json(DATA_DIR / "general_knowledge.json")

        validate_sources(sources)
        valid_is_numbers = validate_standards(standards)
        valid_qco_ids = validate_qcos(qcos, valid_is_numbers)
        valid_scheme_ids = validate_schemes(schemes, valid_is_numbers)
        validate_products(products, valid_is_numbers, valid_qco_ids, valid_scheme_ids)
        validate_laboratories(laboratories, valid_is_numbers)
        validate_general_knowledge(general_knowledge)

        print("\n=======================================================")
        print("ALL DATA VALIDATIONS PASSED SUCCESSFULLY!")
        print("=======================================================")
        print(f"Sources:              {len(sources)}")
        print(f"Indian Standards:     {len(standards)}")
        print(f"Products:             {len(products)}")
        print(f"Quality Control Orders: {len(qcos)}")
        print(f"Certification Schemes: {len(schemes)}")
        print(f"Testing Laboratories: {len(laboratories)}")
        print(f"General Knowledge:    {len(general_knowledge)}")
        print("=======================================================\n")
        return True
    except Exception as e:
        print(f"\n[VALIDATION FAILED]: {e}\n", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = run_all_validations()
    sys.exit(0 if success else 1)
