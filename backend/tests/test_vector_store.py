"""Tests for ChromaDB vector store module."""

import shutil
import tempfile
from pathlib import Path
import pytest

from rag.chunking.chunker import TextChunk
from rag.embeddings.embedder import BISEmbedder
from rag.vector_store.chroma_store import ChromaStore, sanitize_metadata


@pytest.fixture
def temp_chroma_dir():
    """Provide a fresh temporary directory for isolated ChromaDB tests."""
    temp_dir = tempfile.mkdtemp(prefix="test_chroma_")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def shared_embedder():
    """Shared BISEmbedder instance across tests."""
    return BISEmbedder()


def test_sanitize_metadata():
    """Verify metadata sanitization converts non-primitive types safely."""
    raw = {
        "str_val": "test",
        "int_val": 42,
        "float_val": 3.14,
        "bool_val": True,
        "none_val": None,
        "list_val": ["a", "b"],
        "dict_val": {"nested": 1},
    }
    cleaned = sanitize_metadata(raw)
    assert cleaned["str_val"] == "test"
    assert cleaned["int_val"] == 42
    assert cleaned["float_val"] == 3.14
    assert cleaned["bool_val"] is True
    assert cleaned["none_val"] == ""
    assert isinstance(cleaned["list_val"], str)
    assert isinstance(cleaned["dict_val"], str)


def test_vector_store_initialization(temp_chroma_dir, shared_embedder):
    """Verify ChromaStore initializes empty in a fresh directory."""
    store = ChromaStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_collection",
        embedder=shared_embedder,
    )
    assert store.count() == 0
    assert store.collection_name == "test_collection"


def test_add_chunks_and_count(temp_chroma_dir, shared_embedder):
    """Verify adding TextChunks upserts correctly and updates count."""
    store = ChromaStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_chunks",
        embedder=shared_embedder,
    )

    chunks = [
        TextChunk(
            chunk_id="doc-1-chk-0",
            document_id="doc-1",
            document_title="Electric Mixer Standard",
            source_url="https://bis.gov.in/std/302",
            source_type="BIS_STANDARD",
            chunk_index=0,
            text="Safety of household electrical appliances part 2 section 14 for kitchen machines.",
            char_start=0,
            char_end=85,
            metadata={"document_type": "standard", "is_number": "IS 302-2-14"},
        ),
        TextChunk(
            chunk_id="doc-2-chk-0",
            document_id="doc-2",
            document_title="HDPE Pipes Standard",
            source_url="https://bis.gov.in/std/4984",
            source_type="BIS_STANDARD",
            chunk_index=0,
            text="High Density Polyethylene pipes for potable water supply systems under IS 4984.",
            char_start=0,
            char_end=80,
            metadata={"document_type": "standard", "is_number": "IS 4984"},
        ),
    ]

    added = store.add_chunks(chunks)
    assert added == 2
    assert store.count() == 2


def test_idempotent_upsert(temp_chroma_dir, shared_embedder):
    """Verify upserting the exact same chunks twice does not duplicate records."""
    store = ChromaStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_idempotent",
        embedder=shared_embedder,
    )

    chunk = TextChunk(
        chunk_id="qco-1-chk-0",
        document_id="qco-1",
        document_title="Toys QCO",
        source_url="https://bis.gov.in/qco/toys",
        source_type="BIS_QCO",
        chunk_index=0,
        text="Toys Quality Control Order mandating ISI certification under Scheme I.",
        char_start=0,
        char_end=70,
        metadata={"document_type": "qco"},
    )

    # First upsert
    store.add_chunks([chunk])
    assert store.count() == 1

    # Second upsert with same chunk_id
    store.add_chunks([chunk])
    assert store.count() == 1


def test_query_semantic_search(temp_chroma_dir, shared_embedder):
    """Verify semantic search returns relevant items sorted by similarity score."""
    store = ChromaStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_query",
        embedder=shared_embedder,
    )

    chunks = [
        TextChunk(
            chunk_id="c1",
            document_id="doc-mixer",
            document_title="Food Mixers",
            source_url="https://bis.gov.in/mixer",
            source_type="BIS_PRODUCT",
            chunk_index=0,
            text="Electric food mixer grinder kitchen blenders safety specifications.",
            char_start=0,
            char_end=68,
            metadata={"document_type": "product"},
        ),
        TextChunk(
            chunk_id="c2",
            document_id="doc-pipes",
            document_title="Water Pipes",
            source_url="https://bis.gov.in/pipes",
            source_type="BIS_PRODUCT",
            chunk_index=0,
            text="Polyethylene pipes for irrigation and potable water distribution.",
            char_start=0,
            char_end=66,
            metadata={"document_type": "product"},
        ),
    ]
    store.add_chunks(chunks)

    # Query for kitchen appliance
    results = store.query("kitchen blender grinder machine", top_k=2)
    assert len(results) == 2
    top_result = results[0]
    assert top_result["chunk_id"] == "c1"
    assert top_result["score"] > 0.3
    assert "blenders" in top_result["text"]


def test_get_by_id_and_reset(temp_chroma_dir, shared_embedder):
    """Verify retrieving a chunk by ID and resetting the collection."""
    store = ChromaStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_reset",
        embedder=shared_embedder,
    )

    chunk = TextChunk(
        chunk_id="item-42",
        document_id="doc-42",
        document_title="Item 42 Title",
        source_url="https://bis.gov.in/42",
        source_type="GENERAL",
        chunk_index=0,
        text="Special technical clause 42 for testing procedures.",
        char_start=0,
        char_end=52,
        metadata={"document_type": "general"},
    )
    store.add_chunks([chunk])

    fetched = store.get_by_id("item-42")
    assert fetched is not None
    assert fetched["chunk_id"] == "item-42"
    assert "clause 42" in fetched["text"]

    # Non-existent ID returns None
    assert store.get_by_id("non-existent") is None

    # Reset collection
    store.reset()
    assert store.count() == 0
    assert store.get_by_id("item-42") is None
