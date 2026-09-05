"""Automated tests for Phase 2 RAG datasets, ingestion utilities, and chunking."""

import json
from pathlib import Path
import pytest

from rag.validate_data import (
    load_json,
    validate_sources,
    validate_standards,
    validate_qcos,
    validate_schemes,
    validate_products,
    validate_laboratories,
    validate_general_knowledge,
)
from rag.ingestion.html_parser import parse_html_content
from rag.ingestion.pdf_parser import parse_pdf_content, extract_clauses_from_text
from rag.chunking.chunker import chunk_text

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "rag" / "data"
SOURCES_DIR = Path(__file__).resolve().parent.parent.parent / "rag" / "sources"


def test_rag_datasets_relational_integrity():
    """Verify all 6 datasets and source registry satisfy strict integrity rules."""
    sources = load_json(SOURCES_DIR / "sources.json")
    standards = load_json(DATA_DIR / "standards.json")
    qcos = load_json(DATA_DIR / "qcos.json")
    schemes = load_json(DATA_DIR / "certification_schemes.json")
    products = load_json(DATA_DIR / "products.json")
    laboratories = load_json(DATA_DIR / "laboratories.json")
    general_knowledge = load_json(DATA_DIR / "general_knowledge.json")

    # Verify counts meet MVP threshold
    assert 20 <= len(standards) <= 50, f"Expected 20-50 standards, got {len(standards)}"
    assert 20 <= len(products) <= 30, f"Expected 20-30 products, got {len(products)}"
    assert 15 <= len(qcos) <= 30, f"Expected 15-30 QCOs, got {len(qcos)}"
    assert 15 <= len(schemes) <= 30, f"Expected 15-30 schemes, got {len(schemes)}"
    assert 20 <= len(laboratories) <= 50, f"Expected 20-50 laboratories, got {len(laboratories)}"
    assert 10 <= len(general_knowledge) <= 20, f"Expected 10-20 articles, got {len(general_knowledge)}"

    # Run full schema and referential integrity validations
    validate_sources(sources)
    valid_is_numbers = validate_standards(standards)
    valid_qco_ids = validate_qcos(qcos, valid_is_numbers)
    valid_scheme_ids = validate_schemes(schemes, valid_is_numbers)
    validate_products(products, valid_is_numbers, valid_qco_ids, valid_scheme_ids)
    validate_laboratories(laboratories, valid_is_numbers)
    validate_general_knowledge(general_knowledge)


def test_html_parser():
    """Verify HTML parser strips tags, extracts title, and produces clean text."""
    sample_html = """
    <!DOCTYPE html>
    <html>
      <head>
        <title>BIS Test Document</title>
        <script>alert('malicious');</script>
        <style>body { color: red; }</style>
      </head>
      <body>
        <header><nav>Home | Contact</nav></header>
        <h1>Indian Standard IS 10322</h1>
        <p>This standard covers emergency lighting luminaires.</p>
        <h2>Clause 4 Requirements</h2>
        <p>Insulation resistance shall be at least 2 M-Ohm.</p>
        <footer>Copyright BIS 2026</footer>
      </body>
    </html>
    """
    doc = parse_html_content(sample_html)
    assert doc.title == "BIS Test Document"
    assert "Indian Standard IS 10322" in doc.text
    assert "Insulation resistance shall be at least 2 M-Ohm." in doc.text
    assert "alert" not in doc.text
    assert "Copyright" not in doc.text
    assert len(doc.headings) >= 2


def test_pdf_parser_fallback():
    """Verify PDF parser handles binary streams and clause extraction gracefully."""
    sample_text = (
        "Indian Standard IS 2347 Specification\n"
        "Clause 4.1 Material Specification\n"
        "The body of the pressure cooker shall be manufactured from food grade aluminium or stainless steel.\n"
        "Clause 7.1 Hydrostatic Proof Pressure Test\n"
        "Every unit shall withstand 200 kPa pressure for 2 minutes without leakage.\n"
    )
    clauses = extract_clauses_from_text(sample_text)
    assert len(clauses) >= 2
    assert clauses[0].clause_id == "Clause 4.1"
    assert "Material Specification" in clauses[0].heading

    # Test parser call
    doc = parse_pdf_content(b"%PDF-1.4 sample stream text")
    assert doc.total_pages >= 0


def test_chunker():
    """Verify semantic chunker respects size, overlap, and preserves metadata."""
    sample_doc = (
        "The Central Government notifies Quality Control Orders under Section 16 of the BIS Act 2016. "
        "A QCO mandates compliance with specified Indian Standards for public safety and health. "
        "No manufacturer may produce or sell non-certified goods once a QCO enters into force. "
        "Violations carry penal consequences including fines and seizure of goods."
    )
    chunks = chunk_text(
        text=sample_doc,
        document_id="DOC-QCO-TEST",
        document_title="QCO Test Document",
        source_url="https://www.bis.gov.in/",
        source_type="BIS_QCO",
        chunk_size=120,
        chunk_overlap=25,
    )

    assert len(chunks) >= 2
    for chunk in chunks:
        assert chunk.document_id == "DOC-QCO-TEST"
        assert chunk.document_title == "QCO Test Document"
        assert chunk.source_url == "https://www.bis.gov.in/"
        assert chunk.source_type == "BIS_QCO"
        assert len(chunk.text) > 0
        assert chunk.chunk_id.startswith("DOC-QCO-TEST-chk-")
