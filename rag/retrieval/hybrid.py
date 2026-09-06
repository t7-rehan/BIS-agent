"""Hybrid Retrieval Service combining ChromaDB Vector Search and SQLite Structured Lookups."""

from dataclasses import asdict, dataclass, field
import logging
import re
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

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.services.query_service import BISQueryService
from rag.retrieval.retriever import SemanticRetriever
from rag.vector_store.chroma_store import ChromaStore

logger = logging.getLogger(__name__)


@dataclass
class HybridSearchResult:
    """Unified hybrid retrieval output combining dense semantic chunks and structured facts."""

    query: str
    semantic_chunks: List[Dict[str, Any]] = field(default_factory=list)
    structured_entities: Dict[str, Any] = field(default_factory=dict)
    sources: List[Dict[str, str]] = field(default_factory=list)
    confidence_score: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        """Convert result object to serializable dictionary."""
        return asdict(self)


class BISHybridRetriever:
    """Combines dense semantic vector search with relational SQLite queries."""

    # Regex to detect mentions of Indian Standards (e.g., 'IS 1293', 'IS/IEC 60065', 'IS 302', 'IS 4984')
    IS_PATTERN = re.compile(r"\bIS(?:\s*/\s*IEC)?\s*\d+(?:\s*\(.*?\))?", re.IGNORECASE)

    def __init__(
        self,
        retriever: Optional[SemanticRetriever] = None,
        vector_store: Optional[ChromaStore] = None,
        db_session: Optional[Session] = None,
    ):
        if retriever:
            self.retriever = retriever
        else:
            self.retriever = SemanticRetriever(vector_store=vector_store)
        self._db_session = db_session

    def _get_db(self) -> Session:
        """Return provided session or instantiate a new SessionLocal."""
        if self._db_session is not None:
            return self._db_session
        return SessionLocal()

    def _extract_is_numbers(self, query: str) -> List[str]:
        """Extract all potential IS number patterns from query."""
        matches = self.IS_PATTERN.findall(query)
        # Normalize whitespace in matches
        return [re.sub(r"\s+", " ", m).strip() for m in matches]

    def search(
        self,
        query: str,
        top_k: int = 5,
        db_session: Optional[Session] = None,
    ) -> HybridSearchResult:
        """Perform unified hybrid search over semantic vector store and relational database.
        
        Args:
            query: User's search query.
            top_k: Maximum number of semantic chunks to return.
            db_session: Optional active DB session override.
            
        Returns:
            HybridSearchResult containing semantic chunks, structured facts, and deduplicated citations.
        """
        clean_query = query.strip() if query else ""
        if not clean_query:
            return HybridSearchResult(query="")

        # 1. Semantic Vector Search
        semantic_chunks = self.retriever.retrieve(clean_query, top_k=top_k)

        # 2. Structured Relational Lookup
        structured: Dict[str, Any] = {
            "products": [],
            "standards": [],
            "qcos": [],
            "laboratories": [],
            "schemes": [],
        }
        sources: List[Dict[str, str]] = []
        seen_source_urls = set()

        def add_source(title: str, url: str, source_type: str):
            if url and url not in seen_source_urls:
                seen_source_urls.add(url)
                sources.append({
                    "source_title": title,
                    "source_url": url,
                    "source_type": source_type,
                })

        # Add sources from semantic chunks
        for chunk in semantic_chunks:
            add_source(
                title=chunk.get("source_title") or chunk.get("chunk_id", ""),
                url=chunk.get("source_url", ""),
                source_type=chunk.get("source_type", "GENERAL"),
            )

        db = db_session or self._get_db()
        owns_db = db_session is None and self._db_session is None
        try:
            # 2a. Relational expansion from top semantic chunks (only if relevant score >= 0.45)
            for chunk in semantic_chunks:
                if chunk.get("score", 0.0) < 0.45:
                    continue

                meta = chunk.get("metadata", {})
                doc_type = meta.get("document_type", "")
                doc_id = meta.get("document_id", "")
                is_no = meta.get("is_number", "")
                prod_id = meta.get("product_id", "")
                qco_id = meta.get("qco_id", "")
                scheme_id = meta.get("certification_scheme_id", "")
                lab_id = meta.get("laboratory_id", "")

                if doc_type == "standard" or is_no:
                    target_std_id = doc_id or is_no
                    std = BISQueryService.get_standard_by_id(db, target_std_id) or BISQueryService.get_standard_by_is_number(db, is_no)
                    if std and not any(s["id"] == std.id for s in structured["standards"]):
                        structured["standards"].append(std.to_dict())
                        add_source(f"{std.is_number} - {std.title}", std.source_url or "", "BIS_STANDARD")
                        for p in BISQueryService.get_products_for_standard(db, std.id):
                            if not any(x["id"] == p.id for x in structured["products"]):
                                structured["products"].append(p.to_dict())
                                add_source(p.product_name, p.source_url or "", "BIS_PRODUCT")
                                qinfo = BISQueryService.is_product_qco_mandatory(db, p.id)
                                for q in qinfo.get("qcos", []):
                                    if not any(x["id"] == q["id"] for x in structured["qcos"]):
                                        structured["qcos"].append(q)
                        for l in BISQueryService.get_labs_for_standard(db, std.id):
                            if not any(x["id"] == l.id for x in structured["laboratories"]):
                                structured["laboratories"].append(l.to_dict())
                                lab_name = getattr(l, "laboratory_name", getattr(l, "name", "Laboratory"))
                                add_source(lab_name, l.source_url or "", "BIS_LABORATORY")

                if doc_type == "product" or prod_id:
                    target_prod_id = prod_id or doc_id
                    prod = BISQueryService.get_product_by_id(db, target_prod_id)
                    if prod and not any(p["id"] == prod.id for p in structured["products"]):
                        structured["products"].append(prod.to_dict())
                        add_source(prod.product_name, prod.source_url or "", "BIS_PRODUCT")
                        qinfo = BISQueryService.is_product_qco_mandatory(db, prod.id)
                        for q in qinfo.get("qcos", []):
                            if not any(x["id"] == q["id"] for x in structured["qcos"]):
                                structured["qcos"].append(q)
                        for sc in BISQueryService.get_product_certification_schemes(db, prod.id):
                            if not any(x["id"] == sc.id for x in structured["schemes"]):
                                structured["schemes"].append(sc.to_dict())
                                add_source(sc.scheme_name, sc.source_url or "", "BIS_SCHEME")

                if doc_type == "qco" or qco_id:
                    target_qco_id = qco_id or doc_id
                    q = BISQueryService.get_qco(db, target_qco_id)
                    if q and not any(x["id"] == q.id for x in structured["qcos"]):
                        structured["qcos"].append(q.to_dict())
                        add_source(q.qco_name, q.source_url or "", "BIS_QCO")

                if doc_type == "certification_scheme" or scheme_id:
                    target_scheme_id = scheme_id or doc_id
                    sc = BISQueryService.get_certification_scheme(db, target_scheme_id)
                    if sc and not any(x["id"] == sc.id for x in structured["schemes"]):
                        structured["schemes"].append(sc.to_dict())
                        add_source(sc.scheme_name, sc.source_url or "", "BIS_SCHEME")

            # 2b. Check for explicit IS Number in query
            is_numbers = self._extract_is_numbers(clean_query)
            for is_no in is_numbers:
                stds = BISQueryService.search_standards(db, is_no, limit=3)
                for s in stds:
                    if not any(x["id"] == s.id for x in structured["standards"]):
                        structured["standards"].append(s.to_dict())
                        add_source(f"{s.is_number} - {s.title}", s.source_url or "", "BIS_STANDARD")
                    for l in BISQueryService.get_labs_for_standard(db, s.id):
                        if not any(x["id"] == l.id for x in structured["laboratories"]):
                            structured["laboratories"].append(l.to_dict())
                            lab_name = getattr(l, "laboratory_name", getattr(l, "name", "Laboratory"))
                            add_source(lab_name, l.source_url or "", "BIS_LABORATORY")
                    for p in BISQueryService.get_products_for_standard(db, s.id):
                        if not any(x["id"] == p.id for x in structured["products"]):
                            structured["products"].append(p.to_dict())
                            add_source(p.product_name, p.source_url or "", "BIS_PRODUCT")
                            qinfo = BISQueryService.is_product_qco_mandatory(db, p.id)
                            for q in qinfo.get("qcos", []):
                                if not any(x["id"] == q["id"] for x in structured["qcos"]):
                                    structured["qcos"].append(q)

            # 2c. Check for product phrases / keywords in query
            query_lower = clean_query.lower()
            all_prods = BISQueryService.search_products(db, clean_query, limit=5)
            if not all_prods:
                # Token / alias matching against database products
                from app.db.models import Product, ProductAlias
                from sqlalchemy import select
                from sqlalchemy.orm import joinedload
                candidates = db.scalars(select(Product).options(joinedload(Product.aliases))).unique().all()
                for c in candidates:
                    p_name_lower = c.product_name.lower()
                    aliases_lower = [a.alias.lower() for a in c.aliases]
                    if (
                        any(re.search(rf"\b{re.escape(a)}s?\b", query_lower) for a in aliases_lower)
                        or any(
                            re.search(rf"\b{re.escape(w)}s?\b", query_lower)
                            for w in p_name_lower.split()
                            if len(w) > 4 and w not in ["module", "device", "apparatus", "material", "general", "terrestrial"]
                        )
                    ):
                        all_prods.append(c)

            for prod in all_prods:
                if not any(x["id"] == prod.id for x in structured["products"]):
                    structured["products"].append(prod.to_dict())
                    add_source(prod.product_name, prod.source_url or "", "BIS_PRODUCT")
                qco_info = BISQueryService.is_product_qco_mandatory(db, prod.id)
                for q in qco_info.get("qcos", []):
                    if not any(x["id"] == q["id"] for x in structured["qcos"]):
                        structured["qcos"].append(q)
                schemes = BISQueryService.get_product_certification_schemes(db, prod.id)
                for sc in schemes:
                    if not any(x["id"] == sc.id for x in structured["schemes"]):
                        structured["schemes"].append(sc.to_dict())
                        add_source(sc.scheme_name, sc.source_url or "", "BIS_SCHEME")

        except Exception as e:
            logger.warning(f"Error during structured DB lookup in hybrid search: {e}")
        finally:
            if owns_db:
                db.close()

        # 3. Compute Composite Confidence Score
        top_semantic_score = semantic_chunks[0]["score"] if semantic_chunks else 0.0
        structured_match_bonus = 0.15 if (structured["products"] or structured["standards"]) else 0.0
        confidence = min(1.0, round(top_semantic_score * 0.85 + structured_match_bonus, 4))

        return HybridSearchResult(
            query=clean_query,
            semantic_chunks=semantic_chunks,
            structured_entities=structured,
            sources=sources,
            confidence_score=confidence,
        )
