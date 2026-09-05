"""PDF document parser for official BIS standards and gazette notifications."""

from dataclasses import dataclass, field
import io
import logging
import re
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# Check if pypdf is installed
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False


@dataclass
class PDFClause:
    """Detected clause or section within an Indian Standard document."""

    clause_id: str
    heading: str
    body: str
    page_number: int


@dataclass
class ParsedPDFDocument:
    """Structured text and extracted clauses from a PDF document."""

    total_pages: int
    text: str
    clauses: List[PDFClause] = field(default_factory=list)
    metadata: Dict[str, str] = field(default_factory=dict)
    parser_used: str = "pypdf" if PYPDF_AVAILABLE else "fallback"


def extract_clauses_from_text(full_text: str, page_num: int = 1) -> List[PDFClause]:
    """Identify clause markers like 'Clause 4.1', '5.2', 'Section 3' in standard documents."""
    clauses = []
    # Pattern matching 'Clause X.Y' or numbered sections like '4.1 General Requirements'
    clause_pattern = re.compile(
        r"(?:Clause\s+)?(\d+\.(?:\d+\.?)*)\s+([A-Z][A-Za-z0-9\s,\-\(\)]+?)(?=\n|\.\s)",
        re.MULTILINE,
    )

    matches = list(clause_pattern.finditer(full_text))
    for i, match in enumerate(matches):
        clause_id = match.group(1).rstrip(".")
        heading = match.group(2).strip()

        start_pos = match.end()
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        body = full_text[start_pos:end_pos].strip()

        # Only register meaningful clauses
        if len(body) > 10 and len(heading) > 3:
            clauses.append(
                PDFClause(
                    clause_id=f"Clause {clause_id}",
                    heading=heading,
                    body=body[:1000],  # Keep reasonable snippet
                    page_number=page_num,
                )
            )

    return clauses


def parse_pdf_content(pdf_bytes: bytes) -> ParsedPDFDocument:
    """Parse PDF binary content into structured text and clauses.

    Args:
        pdf_bytes: Raw bytes of the PDF file.

    Returns:
        ParsedPDFDocument: Parsed text, clause breakdown, and metadata.
    """
    if not pdf_bytes:
        return ParsedPDFDocument(total_pages=0, text="", metadata={})

    if PYPDF_AVAILABLE:
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            total_pages = len(reader.pages)
            page_texts = []
            all_clauses = []

            for idx, page in enumerate(reader.pages, start=1):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    page_texts.append(f"--- Page {idx} ---\n" + page_text.strip())
                    clauses = extract_clauses_from_text(page_text, page_num=idx)
                    all_clauses.extend(clauses)

            combined_text = "\n\n".join(page_texts)

            doc_meta = {}
            if reader.metadata:
                for k, v in reader.metadata.items():
                    doc_meta[str(k).lstrip("/")] = str(v)

            return ParsedPDFDocument(
                total_pages=total_pages,
                text=combined_text,
                clauses=all_clauses,
                metadata=doc_meta,
                parser_used="pypdf",
            )
        except Exception as e:
            logger.warning("pypdf parsing failed: %s. Falling back to stream extraction.", e)

    # Fallback: Plaintext stream extraction for environments without pypdf
    raw_str = pdf_bytes.decode("latin-1", errors="ignore")
    # Extract strings inside parentheses in PDF content streams: (Text) Tj
    text_fragments = re.findall(r"\(([^\(\)\\]{2,})\)\s*T[jJ]", raw_str)
    fallback_text = " ".join(text_fragments)
    fallback_text = re.sub(r"\s+", " ", fallback_text).strip()

    clauses = extract_clauses_from_text(fallback_text, page_num=1)

    return ParsedPDFDocument(
        total_pages=1,
        text=fallback_text or "PDF text extraction unavailable without pypdf.",
        clauses=clauses,
        metadata={"note": "Extracted via raw stream fallback"},
        parser_used="fallback",
    )
