"""Document chunking foundation designed for future RAG retrieval and citation linking."""

from dataclasses import dataclass, field
import hashlib
import re
from typing import Dict, List, Optional


@dataclass
class TextChunk:
    """A discrete, source-traceable semantic unit for retrieval."""

    chunk_id: str
    document_id: str
    document_title: str
    source_url: str
    source_type: str
    chunk_index: int
    text: str
    char_start: int
    char_end: int
    metadata: Dict[str, str] = field(default_factory=dict)


def chunk_text(
    text: str,
    document_id: str,
    document_title: str = "",
    source_url: str = "",
    source_type: str = "GENERAL",
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    extra_metadata: Optional[Dict[str, str]] = None,
) -> List[TextChunk]:
    """Split text into semantic chunks with overlap while preserving source traceability.

    Args:
        text: Source text to be split.
        document_id: Identifier of the parent document (e.g., standard ID, article ID).
        document_title: Human-readable title of the document.
        source_url: Canonical official URL where document originated.
        source_type: Category of document (e.g., BIS_STANDARD, BIS_QCO).
        chunk_size: Target character length of each chunk.
        chunk_overlap: Number of characters to overlap between consecutive chunks.
        extra_metadata: Additional key-value tags to embed in every chunk.

    Returns:
        List[TextChunk]: List of chunks ready for embedding in later phases.
    """
    clean_text = text.strip()
    if not clean_text:
        return []

    if len(clean_text) <= chunk_size:
        # Fits in a single chunk
        chunk_id = f"{document_id}-chk-0"
        return [
            TextChunk(
                chunk_id=chunk_id,
                document_id=document_id,
                document_title=document_title,
                source_url=source_url,
                source_type=source_type,
                chunk_index=0,
                text=clean_text,
                char_start=0,
                char_end=len(clean_text),
                metadata=extra_metadata or {},
            )
        ]

    # Split preferentially at paragraph or sentence boundaries
    paragraphs = re.split(r"\n\s*\n", clean_text)
    units = []
    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if len(p_clean) > chunk_size:
            # Split paragraph into sentences
            sentences = re.split(r"(?<=[.!?])\s+", p_clean)
            units.extend([s.strip() for s in sentences if s.strip()])
        else:
            units.append(p_clean)

    chunks: List[TextChunk] = []
    current_unit_group: List[str] = []
    current_len = 0
    current_start_offset = 0
    chunk_idx = 0

    for unit in units:
        unit_len = len(unit)
        if current_len + unit_len + 1 > chunk_size and current_unit_group:
            chunk_body = " ".join(current_unit_group).strip()
            chunk_id = f"{document_id}-chk-{chunk_idx}"
            chunks.append(
                TextChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    document_title=document_title,
                    source_url=source_url,
                    source_type=source_type,
                    chunk_index=chunk_idx,
                    text=chunk_body,
                    char_start=current_start_offset,
                    char_end=current_start_offset + len(chunk_body),
                    metadata=extra_metadata or {},
                )
            )
            chunk_idx += 1

            # Calculate overlap from trailing units
            overlap_units = []
            overlap_len = 0
            for prev_unit in reversed(current_unit_group):
                if overlap_len + len(prev_unit) <= chunk_overlap:
                    overlap_units.insert(0, prev_unit)
                    overlap_len += len(prev_unit) + 1
                else:
                    break

            current_unit_group = overlap_units + [unit]
            current_len = sum(len(u) for u in current_unit_group) + len(current_unit_group) - 1
            current_start_offset += max(1, len(chunk_body) - overlap_len)
        else:
            current_unit_group.append(unit)
            current_len += unit_len + 1

    if current_unit_group:
        chunk_body = " ".join(current_unit_group).strip()
        chunk_id = f"{document_id}-chk-{chunk_idx}"
        chunks.append(
            TextChunk(
                chunk_id=chunk_id,
                document_id=document_id,
                document_title=document_title,
                source_url=source_url,
                source_type=source_type,
                chunk_index=chunk_idx,
                text=chunk_body,
                char_start=current_start_offset,
                char_end=current_start_offset + len(chunk_body),
                metadata=extra_metadata or {},
            )
        )

    return chunks
