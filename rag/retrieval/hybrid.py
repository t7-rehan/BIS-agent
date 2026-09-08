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

    # Regex to detect mentions of Indian Standards (e.g., 'IS 1293', 'IS:1293', 'IS/IEC 60065', 'IS 2185 (Part 3)')
    IS_PATTERN = re.compile(
        r"\bIS(?:\s*[:\-_/]?\s*IEC)?\s*[:\-_]?\s*\d+(?:\s*(?:\(Part\s*[^)]+\)|Part\s*\d+|Pt\s*\d+))?",
        re.IGNORECASE,
    )

    # Generic words that should never trigger product matching by themselves
    GENERIC_WORDS = {
        "what", "which", "where", "when", "why", "how", "does", "do", "is", "are", "can",
        "the", "a", "an", "and", "or", "for", "to", "in", "of", "on", "at", "by", "from",
        "with", "about", "tell", "me", "give", "show", "detail", "details", "information",
        "standard", "standards", "indian", "bis", "applies", "applicable", "apply",
        "certification", "certificate", "order", "quality", "control", "qco", "mandatory",
        "compulsory", "test", "testing", "tested", "lab", "laboratory", "laboratories",
        "rule", "rules", "requirement", "requirements", "specification", "specifications",
        "product", "products", "item", "items", "commercial", "domestic", "industrial",
        "general", "national", "system", "equipment", "device", "material", "apparatus",
        "module", "terrestrial", "electrical", "electronic", "part", "section", "support",
        "vehicle", "goods", "services", "scheme", "schemes", "under", "with", "have"
    }

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
        """Extract all potential IS number patterns from query and normalize them."""
        matches = self.IS_PATTERN.findall(query)
        normalized = []
        for m in matches:
            clean_m = re.sub(r"\s*[:\-_]\s*", " ", m)
            clean_m = re.sub(r"\s+", " ", clean_m).strip()
            # Standardize prefix as 'IS '
            if clean_m.upper().startswith("IS"):
                clean_m = "IS " + clean_m[2:].strip()
            normalized.append(clean_m)
        return list(dict.fromkeys(normalized))

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

        # Extract topical non-stopword query tokens
        query_content_words = [
            w for w in re.findall(r"\b[a-zA-Z]{3,}\b", clean_query.lower())
            if w not in self.GENERIC_WORDS
        ]

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

        def add_source(title: str, url: str, source_type: str, is_number: Optional[str] = None):
            if url and url not in seen_source_urls:
                seen_source_urls.add(url)
                src_item = {
                    "source_title": title,
                    "source_url": url,
                    "source_type": source_type,
                }
                if is_number:
                    src_item["is_number"] = is_number
                sources.append(src_item)

        # Add sources from semantic chunks above relevance threshold with lexical ground check
        _SOURCE_MIN_SCORE = 0.58
        for chunk in semantic_chunks:
            chunk_score = chunk.get("score", 0.0)
            chunk_text_lower = (chunk.get("text", "") + " " + chunk.get("source_title", "")).lower()
            has_word_overlap = not query_content_words or any(w in chunk_text_lower for w in query_content_words)
            if chunk_score >= 0.75 or (chunk_score >= _SOURCE_MIN_SCORE and has_word_overlap):
                add_source(
                    title=chunk.get("source_title") or chunk.get("chunk_id", ""),
                    url=chunk.get("source_url", ""),
                    source_type=chunk.get("source_type", "GENERAL"),
                    is_number=chunk.get("metadata", {}).get("is_number"),
                )

        db = db_session or self._get_db()
        owns_db = db_session is None and self._db_session is None
        try:
            # 2a. Relational expansion from top semantic chunks ONLY IF genuinely grounded
            for chunk in semantic_chunks:
                chunk_score = chunk.get("score", 0.0)
                chunk_text_lower = (chunk.get("text", "") + " " + chunk.get("source_title", "")).lower()
                has_word_overlap = not query_content_words or any(w in chunk_text_lower for w in query_content_words)

                # Never expand relational entities from loose semantic chunks that don't match query subject
                if chunk_score < 0.75 and not has_word_overlap:
                    continue
                if chunk_score < 0.58:
                    continue

                meta = chunk.get("metadata", {})
                doc_type = meta.get("document_type", "")
                doc_id = meta.get("document_id", "")
                is_no = meta.get("is_number", "")
                prod_id = meta.get("product_id", "")
                qco_id = meta.get("qco_id", "")
                scheme_id = meta.get("certification_scheme_id", "")
                service_id = meta.get("service_id", "")

                if doc_type == "bis_service" or service_id:
                    target_svc_id = service_id or doc_id
                    svc = BISQueryService.get_bis_service_by_id(db, target_svc_id)
                    if svc:
                        add_source(svc.service_name, svc.source_url or "", "BIS_SERVICE")

                if doc_type == "standard" or is_no:
                    target_std_id = doc_id or is_no
                    std = BISQueryService.get_standard_by_id(db, target_std_id) or BISQueryService.get_standard_by_is_number(db, is_no)
                    if std and not any(s["id"] == std.id for s in structured["standards"]):
                        structured["standards"].append(std.to_dict())
                        add_source(f"{std.is_number} - {std.title}", std.source_url or "", "BIS_STANDARD", std.is_number)

                if doc_type == "product" or prod_id:
                    target_prod_id = prod_id or doc_id
                    prod = BISQueryService.get_product_by_id(db, target_prod_id)
                    if prod and not any(p["id"] == prod.id for p in structured["products"]):
                        structured["products"].append(prod.to_dict())
                        add_source(prod.product_name, prod.source_url or "", "BIS_PRODUCT")

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
                stds = BISQueryService.search_standards(db, is_no, limit=5)
                # Also search by digits if no direct match
                if not stds:
                    digits = re.findall(r"\d+", is_no)
                    if digits:
                        stds = BISQueryService.search_standards(db, f"IS {digits[0]}", limit=5)
                for s in stds:
                    if not any(x["id"] == s.id for x in structured["standards"]):
                        structured["standards"].append(s.to_dict())
                        add_source(f"{s.is_number} - {s.title}", s.source_url or "", "BIS_STANDARD", s.is_number)

            # 2c. Check for product phrases / keywords in query
            query_lower = clean_query.lower()
            from app.db.models import Product, ProductAlias
            from sqlalchemy import select
            from sqlalchemy.orm import joinedload
            candidates = db.scalars(
                select(Product).options(
                    joinedload(Product.aliases),
                    joinedload(Product.standards),
                    joinedload(Product.qcos),
                    joinedload(Product.certification_schemes),
                )
            ).unique().all()

            explicit_prods = []
            q_content_tokens = [w for w in re.findall(r"\b[a-zA-Z]{3,}\b", query_lower) if w not in self.GENERIC_WORDS]

            for c in candidates:
                p_name_lower = c.product_name.lower()
                aliases_lower = [a.alias.lower() for a in c.aliases]

                # 1. Full phrase matches
                matched_alias = any(
                    re.search(rf"\b{re.escape(a)}s?\b", query_lower) or (len(a) >= 5 and a in query_lower)
                    for a in aliases_lower
                )
                matched_pname = bool(re.search(rf"\b{re.escape(p_name_lower)}s?\b", query_lower))

                # 2. Reverse phrase match: query (or sub-phrase) contained in product name or alias
                matched_subphrase = False
                if len(clean_query.strip()) >= 4 and len(q_content_tokens) >= 1:
                    clean_lower = clean_query.strip().lower()
                    if clean_lower in p_name_lower or any(clean_lower in a for a in aliases_lower):
                        matched_subphrase = True

                # 3. Product sub-parts (e.g. "electric food mixer", "kitchen grinder")
                subparts = [p.strip() for p in re.split(r"\s+(?:and|&)\s+|\s*,\s*|\s*/\s*|\s*\(|\s*\)", p_name_lower) if len(p.strip()) >= 4]
                matched_part = any(
                    re.search(rf"\b{re.escape(part)}s?\b", query_lower) or (len(part) >= 6 and part in query_lower)
                    for part in subparts
                )

                # 4. Multi-word distinctive phrase matching
                matched_distinctive = False
                p_words = [w for w in re.findall(r"\b[a-zA-Z]{3,}\b", p_name_lower) if w not in self.GENERIC_WORDS]
                if len(p_words) >= 2:
                    phrase = " ".join(p_words)
                    if re.search(rf"\b{re.escape(phrase)}s?\b", query_lower):
                        matched_distinctive = True

                # 5. Distinctive content token matching
                matched_tokens = False
                if q_content_tokens:
                    matching_q_tokens = [
                        t for t in q_content_tokens
                        if re.search(rf"\b{re.escape(t)}s?\b", p_name_lower)
                        or any(re.search(rf"\b{re.escape(t)}s?\b", a) for a in aliases_lower)
                    ]
                    if len(matching_q_tokens) >= 2 or (len(q_content_tokens) == 1 and len(matching_q_tokens) == 1 and len(matching_q_tokens[0]) >= 4):
                        matched_tokens = True

                if matched_alias or matched_pname or matched_subphrase or matched_part or matched_distinctive or matched_tokens:
                    explicit_prods.append(c)

            # Strictly use explicit product matches to avoid loose stop-word cascades
            for prod in explicit_prods:
                if not any(x["id"] == prod.id for x in structured["products"]):
                    structured["products"].append(prod.to_dict())
                    add_source(prod.product_name, prod.source_url or "", "BIS_PRODUCT")

            # 2d. Direct QCO Matching
            qco_signals = ["qco", "quality control order", "mandatory", "order", "compulsory"]
            if any(sig in query_lower for sig in qco_signals):
                qco_candidates = BISQueryService.search_qcos(db, clean_query, limit=5)
                for q in qco_candidates:
                    # Verify QCO has at least one content word overlap with query
                    q_text = (q.qco_name + " " + (q.product or "")).lower()
                    if any(w in q_text for w in query_content_words):
                        if not any(x["id"] == q.id for x in structured["qcos"]):
                            structured["qcos"].append(q.to_dict())
                            add_source(q.qco_name, q.source_url or "", "BIS_QCO")

            # 2e. Direct Certification Scheme Matching
            scheme_signals = ["scheme", "crs", "isi mark", "fmcs", "hallmark", "licence", "license"]
            if any(sig in query_lower for sig in scheme_signals):
                scheme_candidates = BISQueryService.search_certification_schemes(db, clean_query, limit=5)
                for sc in scheme_candidates:
                    sc_text = (sc.scheme_name + " " + (sc.product or "")).lower()
                    if any(w in sc_text for w in query_content_words):
                        if not any(x["id"] == sc.id for x in structured["schemes"]):
                            structured["schemes"].append(sc.to_dict())
                            add_source(sc.scheme_name, sc.source_url or "", "BIS_SCHEME")

            # 2f. Direct Laboratory Matching
            lab_signals = ["lab", "laboratory", "testing", "where to test", "cipet", "nth", "lims", "test facility"]
            if any(sig in query_lower for sig in lab_signals):
                lab_candidates = BISQueryService.search_laboratories(db, clean_query, limit=5)
                for l in lab_candidates:
                    l_text = (l.laboratory_name + " " + (l.location or "") + " " + (l.state or "") + " " + " ".join(l.testing_scope)).lower()
                    if any(w in l_text for w in query_content_words):
                        if not any(x["id"] == l.id for x in structured["laboratories"]):
                            structured["laboratories"].append(l.to_dict())
                            lab_name = getattr(l, "laboratory_name", getattr(l, "name", "Laboratory"))
                            add_source(lab_name, l.source_url or "", "BIS_LABORATORY")

            # 2g. Sector / Category Matching if no products or standards matched yet
            if not structured["products"] and not structured["standards"]:
                _SECTOR_KEYWORDS = [
                    "solar", "renewable", "battery", "batteries", "electric vehicle", "ev",
                    "building material", "cement", "steel", "iron", "plastic", "polymer",
                    "rubber", "packaging", "fertilizer", "paint", "coating", "fire safety",
                    "fire extinguisher", "lpg", "gas appliance", "refrigeration", "air conditioning",
                    "pump", "ppe", "safety equipment", "toy", "toys", "jewellery", "gold",
                    "hallmarking", "footwear", "leather", "paper", "glass", "ceramic",
                    "medical", "textile", "electronics", "automotive", "chemical", "food",
                ]
                matched_sectors = [kw for kw in _SECTOR_KEYWORDS if re.search(rf"\b{re.escape(kw)}s?\b", query_lower)]
                for sec in matched_sectors[:2]:
                    cat_stds = BISQueryService.get_standards_by_category(db, sec, limit=3)
                    for cs in cat_stds:
                        if not any(x["id"] == cs.id for x in structured["standards"]):
                            structured["standards"].append(cs.to_dict())
                            add_source(f"{cs.is_number} - {cs.title}", cs.source_url or "", "BIS_STANDARD", cs.is_number)
                    cat_prods = BISQueryService.get_products_by_category(db, sec, limit=3)
                    for cp in cat_prods:
                        if not any(x["id"] == cp.id for x in structured["products"]):
                            structured["products"].append(cp.to_dict())
                            add_source(cp.product_name, cp.source_url or "", "BIS_PRODUCT")

            # 2h. Cross-Entity Relational Completion (Bidirectional Traversal)
            # Chain: Product ↔ IS ↔ QCO ↔ Scheme ↔ Laboratory

            # From Products: expand Standards, QCOs, Schemes, and Laboratories
            current_prods = list(structured["products"])
            for prod_dict in current_prods:
                p_id = prod_dict["id"]
                # Standards for product
                for std in BISQueryService.get_product_standards(db, p_id):
                    if not any(s["id"] == std.id for s in structured["standards"]):
                        structured["standards"].append(std.to_dict())
                        add_source(f"{std.is_number} - {std.title}", std.source_url or "", "BIS_STANDARD", std.is_number)
                # QCOs for product
                qco_info = BISQueryService.is_product_qco_mandatory(db, p_id)
                for q in qco_info.get("qcos", []):
                    q_norm = dict(q)
                    q_name = q.get("name") or q.get("qco_name", "")
                    q_norm["qco_name"] = q_name
                    q_norm["name"] = q_name
                    if not any(x["id"] == q_norm["id"] for x in structured["qcos"]):
                        structured["qcos"].append(q_norm)
                # Schemes for product
                for sc in BISQueryService.get_product_certification_schemes(db, p_id):
                    sc_dict = sc.to_dict()
                    sc_name = sc_dict.get("scheme_name") or sc_dict.get("name", "")
                    sc_dict["scheme_name"] = sc_name
                    sc_dict["name"] = sc_name
                    if not any(x["id"] == sc.id for x in structured["schemes"]):
                        structured["schemes"].append(sc_dict)
                        add_source(sc_name, sc.source_url or "", "BIS_SCHEME")

            # From Standards: expand Labs, Products, QCOs, Schemes
            current_stds = list(structured["standards"])
            for std_dict in current_stds:
                s_id = std_dict["id"]
                # Laboratories for standard
                for l in BISQueryService.get_labs_for_standard(db, s_id):
                    l_dict = l.to_dict()
                    lab_name = l_dict.get("laboratory_name") or l_dict.get("name", "Laboratory")
                    l_dict["laboratory_name"] = lab_name
                    l_dict["name"] = lab_name
                    if not any(x["id"] == l.id for x in structured["laboratories"]):
                        structured["laboratories"].append(l_dict)
                        add_source(lab_name, l.source_url or "", "BIS_LABORATORY")
                # Products for standard
                for p in BISQueryService.get_products_for_standard(db, s_id):
                    if not any(x["id"] == p.id for x in structured["products"]):
                        structured["products"].append(p.to_dict())
                        add_source(p.product_name, p.source_url or "", "BIS_PRODUCT")
                        qinfo = BISQueryService.is_product_qco_mandatory(db, p.id)
                        for q in qinfo.get("qcos", []):
                            q_norm = dict(q)
                            q_name = q.get("name") or q.get("qco_name", "")
                            q_norm["qco_name"] = q_name
                            q_norm["name"] = q_name
                            if not any(x["id"] == q_norm["id"] for x in structured["qcos"]):
                                structured["qcos"].append(q_norm)
                        for sc in BISQueryService.get_product_certification_schemes(db, p.id):
                            sc_dict = sc.to_dict()
                            sc_name = sc_dict.get("scheme_name") or sc_dict.get("name", "")
                            sc_dict["scheme_name"] = sc_name
                            sc_dict["name"] = sc_name
                            if not any(x["id"] == sc.id for x in structured["schemes"]):
                                structured["schemes"].append(sc_dict)
                                add_source(sc_name, sc.source_url or "", "BIS_SCHEME")

            # From QCOs: expand Standards
            current_qcos = list(structured["qcos"])
            for q_dict in current_qcos:
                q_id = q_dict["id"]
                q_model = BISQueryService.get_qco(db, q_id)
                if q_model:
                    for std in q_model.standards:
                        if not any(s["id"] == std.id for s in structured["standards"]):
                            structured["standards"].append(std.to_dict())
                            add_source(f"{std.is_number} - {std.title}", std.source_url or "", "BIS_STANDARD", std.is_number)
                        for l in BISQueryService.get_labs_for_standard(db, std.id):
                            l_dict = l.to_dict()
                            lab_name = l_dict.get("laboratory_name") or l_dict.get("name", "Laboratory")
                            l_dict["laboratory_name"] = lab_name
                            l_dict["name"] = lab_name
                            if not any(x["id"] == l.id for x in structured["laboratories"]):
                                structured["laboratories"].append(l_dict)
                                add_source(lab_name, l.source_url or "", "BIS_LABORATORY")

            # From Schemes: expand Standards
            current_schemes = list(structured["schemes"])
            for sc_dict in current_schemes:
                sc_id = sc_dict["id"]
                sc_model = BISQueryService.get_certification_scheme(db, sc_id)
                if sc_model:
                    for std in sc_model.standards:
                        if not any(s["id"] == std.id for s in structured["standards"]):
                            structured["standards"].append(std.to_dict())
                            add_source(f"{std.is_number} - {std.title}", std.source_url or "", "BIS_STANDARD", std.is_number)
                        for l in BISQueryService.get_labs_for_standard(db, std.id):
                            l_dict = l.to_dict()
                            lab_name = l_dict.get("laboratory_name") or l_dict.get("name", "Laboratory")
                            l_dict["laboratory_name"] = lab_name
                            l_dict["name"] = lab_name
                            if not any(x["id"] == l.id for x in structured["laboratories"]):
                                structured["laboratories"].append(l_dict)
                                add_source(lab_name, l.source_url or "", "BIS_LABORATORY")

        except Exception as e:
            logger.warning(f"Error during structured DB lookup in hybrid search: {e}")
        finally:
            if owns_db:
                db.close()

        # 3. Compute Composite Confidence Score
        top_semantic_score = semantic_chunks[0]["score"] if semantic_chunks else 0.0
        has_structured = bool(
            structured["products"] or structured["standards"]
            or structured["qcos"] or structured["schemes"] or structured["laboratories"]
        )

        if has_structured:
            # Verified ground exists in database
            confidence = min(1.0, round(top_semantic_score * 0.70 + 0.30, 4))
        else:
            # Check if semantic chunks have subject overlap
            has_word_overlap = bool(query_content_words and any(
                any(w in (c.get("text", "") + " " + c.get("source_title", "")).lower() for w in query_content_words)
                for c in semantic_chunks[:3]
            ))
            if has_word_overlap and top_semantic_score >= 0.45:
                confidence = round(top_semantic_score * 0.85, 4)
            else:
                # Insufficient evidence
                confidence = 0.0

        return HybridSearchResult(
            query=clean_query,
            semantic_chunks=semantic_chunks,
            structured_entities=structured,
            sources=sources,
            confidence_score=confidence,
        )
