"""Semantic Vector Search Retriever for BIS Knowledge Base."""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Ensure backend and repo root are in sys.path
_repo_root = Path(__file__).resolve().parent.parent.parent
_backend_dir = _repo_root / "backend"
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))

from app.core.config import settings
from rag.vector_store.chroma_store import ChromaStore

logger = logging.getLogger(__name__)


class SemanticRetriever:
    """Retrieves relevant BIS knowledge chunks using dense vector embeddings."""

    def __init__(self, vector_store: Optional[ChromaStore] = None):
        self.vector_store = vector_store or ChromaStore()

    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        where: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Perform semantic search against indexed BIS chunks.
        
        Args:
            query: Natural language query or keywords.
            top_k: Number of semantic chunks to return.
            where: Optional metadata filter dict for ChromaDB.
            
        Returns:
            List of result dicts with text, score, citation URL, and metadata.
        """
        clean_query = query.strip() if query else ""
        if not clean_query:
            return []

        k = top_k or settings.RETRIEVAL_TOP_K
        results = self.vector_store.query(
            query_text=clean_query,
            top_k=k,
            where=where,
        )

        formatted = []
        for r in results:
            meta = r.get("metadata", {})
            formatted.append({
                "chunk_id": r.get("chunk_id", ""),
                "document_id": r.get("document_id", ""),
                "text": r.get("text", ""),
                "score": r.get("score", 0.0),
                "distance": r.get("distance", 0.0),
                "source_title": meta.get("source_title", meta.get("document_title", "")),
                "source_url": meta.get("source_url", ""),
                "source_type": meta.get("source_type", ""),
                "document_type": meta.get("document_type", ""),
                "metadata": meta,
            })

        return formatted

    def retrieve_by_document_type(
        self,
        query: str,
        document_type: str,
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve chunks filtered by specific document type (standard, qco, scheme, etc.)."""
        return self.retrieve(
            query=query,
            top_k=top_k,
            where={"document_type": document_type},
        )
