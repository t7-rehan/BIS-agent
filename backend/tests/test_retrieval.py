"""Comprehensive unit and benchmark evaluation tests for Semantic & Hybrid Retrieval."""

import json
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.database import Base
from app.db.seed import find_data_dir, seed_database
from rag.chunking.chunker import TextChunk
from rag.embeddings.embedder import BISEmbedder
from rag.index import prepare_chunks
from rag.retrieval.hybrid import BISHybridRetriever, HybridSearchResult
from rag.retrieval.retriever import SemanticRetriever
from rag.vector_store.chroma_store import ChromaStore


@pytest.fixture(scope="module")
def shared_embedder():
    """Shared BISEmbedder across retrieval test suite."""
    return BISEmbedder()


@pytest.fixture(scope="module")
def seeded_db_session():
    """In-memory SQLite database seeded with Phase 2 data."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    data_dir = find_data_dir()
    seed_database(session, data_dir=data_dir, init_tables=False)
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def indexed_vector_store(tmp_path_factory, shared_embedder):
    """Temporary ChromaStore populated with all curated Phase 2 chunks."""
    temp_dir = tmp_path_factory.mktemp("retrieval_chroma")
    store = ChromaStore(
        persist_directory=str(temp_dir),
        collection_name="test_retrieval_kb",
        embedder=shared_embedder,
    )
    data_dir = find_data_dir()
    chunks, _ = prepare_chunks(data_dir)
    store.add_chunks(chunks)
    return store


@pytest.fixture(scope="module")
def hybrid_retriever(indexed_vector_store, seeded_db_session):
    """Configured BISHybridRetriever instance."""
    semantic = SemanticRetriever(vector_store=indexed_vector_store)
    return BISHybridRetriever(
        retriever=semantic,
        vector_store=indexed_vector_store,
        db_session=seeded_db_session,
    )


# ====================================================================
# 1. Semantic Retriever Unit Tests
# ====================================================================

def test_semantic_retriever_basic_query(indexed_vector_store):
    """Verify semantic retriever returns relevant chunks with score and citation."""
    retriever = SemanticRetriever(vector_store=indexed_vector_store)
    results = retriever.retrieve("electric mixer safety", top_k=3)

    assert len(results) > 0
    assert len(results) <= 3
    top_hit = results[0]
    assert "chunk_id" in top_hit
    assert "text" in top_hit
    assert top_hit["score"] > 0.0
    assert "source_url" in top_hit
    assert "source_title" in top_hit


def test_semantic_retriever_empty_query(indexed_vector_store):
    """Verify empty or whitespace-only queries return empty result list."""
    retriever = SemanticRetriever(vector_store=indexed_vector_store)
    assert retriever.retrieve("") == []
    assert retriever.retrieve("   ") == []


def test_semantic_retriever_document_type_filter(indexed_vector_store):
    """Verify retriever filters results strictly by document_type."""
    retriever = SemanticRetriever(vector_store=indexed_vector_store)
    results = retriever.retrieve_by_document_type(
        query="quality control order notification",
        document_type="qco",
        top_k=3,
    )
    assert len(results) > 0
    for r in results:
        assert r["document_type"] == "qco"


# ====================================================================
# 2. Hybrid Retriever Unit Tests
# ====================================================================

def test_hybrid_retriever_empty_query(hybrid_retriever):
    """Verify hybrid retriever handles empty input gracefully."""
    res = hybrid_retriever.search("")
    assert isinstance(res, HybridSearchResult)
    assert res.query == ""
    assert len(res.semantic_chunks) == 0
    assert len(res.sources) == 0


def test_hybrid_retriever_standard_lookup(hybrid_retriever):
    """Verify IS number query retrieves semantic chunks, structured standard, and testing labs."""
    res = hybrid_retriever.search("IS 1293 plug and socket requirements")
    assert isinstance(res, HybridSearchResult)
    assert len(res.semantic_chunks) > 0

    # Structured verification
    stds = res.structured_entities.get("standards", [])
    assert len(stds) > 0
    assert any("1293" in s["is_number"] for s in stds)

    # Associated testing labs found
    labs = res.structured_entities.get("laboratories", [])
    assert len(labs) > 0
    assert any(
        "NROL" in (l.get("laboratory_name") or l.get("name", ""))
        or "Central" in (l.get("laboratory_name") or l.get("name", ""))
        or "National" in (l.get("laboratory_name") or l.get("name", ""))
        or "CPRI" in (l.get("laboratory_name") or l.get("name", ""))
        for l in labs
    )

    # Sources deduplicated
    assert len(res.sources) > 0
    urls = [s["source_url"] for s in res.sources]
    assert len(urls) == len(set(urls)), "Source URLs must be strictly deduplicated"


def test_hybrid_retriever_product_and_qco_lookup(hybrid_retriever):
    """Verify product query retrieves structured product, QCO status, and schemes."""
    res = hybrid_retriever.search("electric food mixer")
    assert len(res.semantic_chunks) > 0

    products = res.structured_entities.get("products", [])
    assert len(products) > 0
    assert any(p["id"] == "PROD-ELECTRIC-MIXER" for p in products)

    # QCOs attached
    qcos = res.structured_entities.get("qcos", [])
    assert len(qcos) > 0
    assert any("APPLIANCES" in q["id"] for q in qcos)

    # Confidence score calculation
    assert res.confidence_score > 0.0
    assert res.confidence_score <= 1.0


# ====================================================================
# 3. Benchmark Evaluation Query Suite (15 Test Cases)
# ====================================================================

def test_benchmark_evaluation_suite(hybrid_retriever):
    """Execute all 15 benchmark evaluation queries and verify retrieval performance."""
    eval_file = Path(__file__).parent / "rag" / "evaluation_queries.json"
    if not eval_file.exists():
        eval_file = Path(__file__).resolve().parent.parent.parent / "tests" / "rag" / "evaluation_queries.json"

    assert eval_file.exists(), f"Evaluation queries file not found at {eval_file}"

    with open(eval_file, "r", encoding="utf-8") as f:
        eval_queries = json.load(f)

    assert len(eval_queries) >= 15, "Evaluation suite must have at least 15 test cases"

    passed_count = 0
    for case in eval_queries:
        query_text = case["query"]
        expected_types = case.get("expected_document_types", [])
        expected_entities = case.get("expected_entities", [])

        res = hybrid_retriever.search(query_text, top_k=5)

        # 1. Result must have non-empty chunks or structured facts
        has_content = bool(res.semantic_chunks or res.structured_entities.get("products") or res.structured_entities.get("standards"))
        assert has_content, f"Query '{query_text}' returned no content!"

        # 2. Confidence score must be positive
        assert res.confidence_score > 0.0, f"Query '{query_text}' had zero confidence!"

        # 3. Source citations must be present with valid URLs
        assert len(res.sources) > 0, f"Query '{query_text}' had no source citations!"
        for src in res.sources:
            assert src["source_url"].startswith("http"), f"Invalid source URL: {src['source_url']}"

        # 4. Check that at least one expected document type is present in retrieved chunks
        chunk_doc_types = {c.get("document_type") for c in res.semantic_chunks}
        type_match = any(t in chunk_doc_types for t in expected_types)

        # 5. Check that expected entity is referenced either in text or structured entities
        combined_text = " ".join(c["text"] for c in res.semantic_chunks)
        for std in res.structured_entities.get("standards", []):
            combined_text += " " + std.get("is_number", "") + " " + std.get("title", "")
        for prod in res.structured_entities.get("products", []):
            combined_text += " " + prod.get("product_name", "")
        for qco in res.structured_entities.get("qcos", []):
            combined_text += " " + str(qco.get("name", "")) + " " + str(qco.get("id", ""))
        for lab in res.structured_entities.get("laboratories", []):
            combined_text += " " + (lab.get("laboratory_name") or lab.get("name", "")) + " " + lab.get("id", "") + " " + lab.get("lab_code", "")
        for sc in res.structured_entities.get("schemes", []):
            combined_text += " " + (sc.get("scheme_name") or sc.get("name", "")) + " " + sc.get("id", "")

        entity_match = any(e.lower() in combined_text.lower() for e in expected_entities)

        assert type_match or entity_match, (
            f"Query '{query_text}' failed relevance check. "
            f"Expected types: {expected_types} (got {chunk_doc_types}). "
            f"Expected entities: {expected_entities}"
        )
        passed_count += 1

    assert passed_count == len(eval_queries)
