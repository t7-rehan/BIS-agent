"""Tests for local embeddings service using all-MiniLM-L6-v2."""

import pytest
from rag.embeddings.embedder import BISEmbedder


@pytest.fixture(scope="module")
def embedder():
    """Shared module-level embedder instance."""
    return BISEmbedder()


def test_embedder_initialization(embedder):
    """Verify embedder initializes with correct model and dimension."""
    assert embedder.model_name == "all-MiniLM-L6-v2"
    assert embedder.dimension == 384
    assert embedder.embedding_function is not None


def test_embed_single_text(embedder):
    """Verify single text embedding produces a 384-dim non-empty vector."""
    text = "Indian Standard IS 1293 specifies requirements for plugs and socket-outlets."
    vec = embedder.embed_text(text)
    assert isinstance(vec, list)
    assert len(vec) == 384
    assert any(x != 0.0 for x in vec)
    assert all(isinstance(x, float) for x in vec)


def test_embed_batch_documents(embedder):
    """Verify batch embedding produces consistent 384-dim vectors for each document."""
    docs = [
        "High Density Polyethylene pipes for water supply under IS 4984.",
        "Safety requirements for luminaires under IS 10322.",
        "Toys Safety Quality Control Order notified by DPIIT.",
    ]
    vecs = embedder.embed_documents(docs)
    assert len(vecs) == len(docs)
    for vec in vecs:
        assert len(vec) == 384
        assert any(x != 0.0 for x in vec)


def test_embed_empty_and_whitespace_text(embedder):
    """Verify empty or whitespace-only strings do not fail and return zero vector."""
    empty_vec = embedder.embed_text("")
    assert len(empty_vec) == 384
    assert all(x == 0.0 for x in empty_vec)

    ws_vec = embedder.embed_text("    ")
    assert len(ws_vec) == 384
    assert all(x == 0.0 for x in ws_vec)


def test_semantic_similarity_distance(embedder):
    """Verify that semantically similar sentences have higher cosine similarity."""
    import numpy as np

    v_mixer = np.array(embedder.embed_text("electric kitchen mixer and grinder"))
    v_blender = np.array(embedder.embed_text("food processor and blender machine"))
    v_pipes = np.array(embedder.embed_text("polyethylene agricultural water pipes"))

    # Cosine similarity helper
    def cos_sim(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    sim_mixer_blender = cos_sim(v_mixer, v_blender)
    sim_mixer_pipes = cos_sim(v_mixer, v_pipes)

    assert sim_mixer_blender > sim_mixer_pipes
