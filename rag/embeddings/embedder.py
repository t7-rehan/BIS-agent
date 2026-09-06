"""BIS Embedding Service using local ONNX / Sentence Transformers."""

from typing import List, Optional
import chromadb.utils.embedding_functions as embedding_functions


class BISEmbedder:
    """Local embedding generator using all-MiniLM-L6-v2 via ONNX/ChromaDB.
    
    Produces 384-dimensional dense vectors locally without external API calls.
    """

    DEFAULT_MODEL = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION = 384

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or self.DEFAULT_MODEL
        # DefaultEmbeddingFunction in chromadb uses all-MiniLM-L6-v2 ONNX pipeline
        self._embedding_function = embedding_functions.DefaultEmbeddingFunction()

    @property
    def embedding_function(self):
        """Return the underlying Chroma-compatible embedding function."""
        return self._embedding_function

    @property
    def dimension(self) -> int:
        """Return embedding vector dimensionality."""
        return self.EMBEDDING_DIMENSION

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding vector for a single query or text string.
        
        Args:
            text: Input string to embed.
            
        Returns:
            List of floats representing the 384-dim dense vector.
        """
        if not text or not text.strip():
            # Return zero vector for empty input to prevent failures
            return [0.0] * self.EMBEDDING_DIMENSION
        results = self._embedding_function([text])
        return [float(x) for x in results[0]]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of text chunks.
        
        Args:
            texts: List of text strings.
            
        Returns:
            List of 384-dim embedding vectors.
        """
        if not texts:
            return []
        
        # Replace empty strings with a single space to avoid tokenizer errors
        cleaned = [t if (t and t.strip()) else " " for t in texts]
        results = self._embedding_function(cleaned)
        return [[float(x) for x in emb] for emb in results]
