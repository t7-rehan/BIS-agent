"""ChromaDB Vector Store implementation for BIS Knowledge Base."""

import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

# Ensure backend and repo root are in sys.path
_repo_root = Path(__file__).resolve().parent.parent.parent
_backend_dir = _repo_root / "backend"
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))

import chromadb
from chromadb.api.models.Collection import Collection

from app.core.config import settings
from rag.chunking.chunker import TextChunk
from rag.embeddings.embedder import BISEmbedder

logger = logging.getLogger(__name__)


def resolve_chroma_path(path_str: Optional[str] = None) -> Path:
    """Resolve chroma storage directory relative to repository/backend root."""
    target_str = path_str or settings.CHROMA_PERSIST_DIRECTORY
    p = Path(target_str)
    if p.is_absolute():
        return p

    clean_parts = [part for part in p.parts if part != "."]
    # Check if backend directory exists in cwd (running from repo root)
    if (Path.cwd() / "backend").is_dir():
        target = Path.cwd() / "backend" / Path(*clean_parts)
    else:
        target = Path.cwd() / Path(*clean_parts)

    target.mkdir(parents=True, exist_ok=True)
    return target


def sanitize_metadata(meta: Dict[str, Any]) -> Dict[str, Union[str, int, float, bool]]:
    """Sanitize metadata values for ChromaDB compatibility.
    
    Chroma requires metadata values to be primitive types: str, int, float, or bool.
    """
    clean: Dict[str, Union[str, int, float, bool]] = {}
    for k, v in meta.items():
        if v is None:
            clean[k] = ""
        elif isinstance(v, (str, int, float, bool)):
            clean[k] = v
        elif isinstance(v, (list, dict)):
            clean[k] = json.dumps(v, ensure_ascii=False)
        else:
            clean[k] = str(v)
    return clean


class ChromaStore:
    """Persistent local vector store backed by ChromaDB."""

    def __init__(
        self,
        persist_directory: Optional[str] = None,
        collection_name: Optional[str] = None,
        embedder: Optional[BISEmbedder] = None,
    ):
        self.persist_path = resolve_chroma_path(persist_directory)
        self.collection_name = collection_name or settings.CHROMA_COLLECTION_NAME
        self.embedder = embedder or BISEmbedder()

        logger.info(
            f"Initializing ChromaStore at {self.persist_path} with collection '{self.collection_name}'"
        )
        self.client = chromadb.PersistentClient(path=str(self.persist_path))
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedder.embedding_function,
            metadata={"hnsw:space": "cosine"},
        )

    def count(self) -> int:
        """Return the number of items stored in the collection."""
        return self.collection.count()

    def add_chunks(
        self,
        chunks: List[TextChunk],
        metadata_overrides: Optional[List[Dict[str, Any]]] = None,
    ) -> int:
        """Upsert text chunks into the Chroma collection with deterministic IDs.
        
        Args:
            chunks: List of TextChunk objects.
            metadata_overrides: Optional list of additional/overridden metadata dicts per chunk.
            
        Returns:
            Count of chunks upserted.
        """
        if not chunks:
            return 0

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[Dict[str, Union[str, int, float, bool]]] = []

        for idx, chunk in enumerate(chunks):
            # Deterministic chunk ID
            chunk_id = chunk.chunk_id or f"{chunk.document_id}-chk-{idx}"
            ids.append(chunk_id)
            documents.append(chunk.text)

            meta = dict(chunk.metadata)
            meta["chunk_id"] = chunk_id
            meta["document_id"] = chunk.document_id

            if metadata_overrides and idx < len(metadata_overrides):
                meta.update(metadata_overrides[idx])

            metadatas.append(sanitize_metadata(meta))

        # Upsert in batches of 100 to avoid token or argument limits
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            b_ids = ids[i : i + batch_size]
            b_docs = documents[i : i + batch_size]
            b_metas = metadatas[i : i + batch_size]
            self.collection.upsert(
                ids=b_ids,
                documents=b_docs,
                metadatas=b_metas,
            )

        logger.info(f"Upserted {len(ids)} chunks into collection '{self.collection_name}'. Total: {self.count()}")
        return len(ids)

    def query(
        self,
        query_text: str,
        top_k: Optional[int] = None,
        where: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Semantic vector search against indexed BIS chunks.
        
        Args:
            query_text: The user query string.
            top_k: Number of results to return (defaults to settings.RETRIEVAL_TOP_K).
            where: Optional Chroma metadata filtering clause.
            
        Returns:
            List of result dicts sorted by relevance (cosine similarity score).
        """
        k = top_k or settings.RETRIEVAL_TOP_K
        if self.count() == 0 or not query_text or not query_text.strip():
            return []

        query_args: Dict[str, Any] = {
            "query_texts": [query_text],
            "n_results": min(k, self.count()),
        }
        if where:
            query_args["where"] = where

        results = self.collection.query(**query_args)

        formatted_results: List[Dict[str, Any]] = []
        if results and results.get("ids") and results["ids"][0]:
            ids = results["ids"][0]
            docs = results["documents"][0] if results.get("documents") else [""] * len(ids)
            metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(ids)

            for cid, doc, meta, dist in zip(ids, docs, metas, distances):
                # For cosine distance, similarity = 1 - distance (clamped to [0, 1])
                similarity_score = max(0.0, min(1.0, 1.0 - dist))
                formatted_results.append({
                    "chunk_id": cid,
                    "document_id": meta.get("document_id", ""),
                    "text": doc,
                    "score": round(similarity_score, 4),
                    "distance": round(dist, 4),
                    "metadata": meta,
                })

        return formatted_results

    def get_by_id(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific chunk by its chunk ID."""
        res = self.collection.get(ids=[chunk_id], include=["documents", "metadatas"])
        if res and res.get("ids") and len(res["ids"]) > 0:
            doc = res["documents"][0] if res.get("documents") else ""
            meta = res["metadatas"][0] if res.get("metadatas") else {}
            return {
                "chunk_id": chunk_id,
                "document_id": meta.get("document_id", ""),
                "text": doc,
                "metadata": meta,
            }
        return None

    def reset(self) -> None:
        """Clear all indexed data from the collection and recreate it."""
        try:
            self.client.delete_collection(name=self.collection_name)
        except Exception as e:
            logger.warning(f"Error while deleting collection '{self.collection_name}': {e}")

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedder.embedding_function,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"Collection '{self.collection_name}' has been reset.")
