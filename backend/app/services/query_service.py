"""Database query and service layer for structured BIS data retrieval."""

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.db.models import (
    BISService,
    CertificationScheme,
    GeneralKnowledge,
    Laboratory,
    Product,
    ProductAlias,
    QCO,
    Standard,
)

logger = logging.getLogger("bis_query_service")


class BISQueryService:
    """Service providing structured queries over the BIS SQLite database."""

    # ----------------------------------------------------------------
    # Standards Queries
    # ----------------------------------------------------------------

    @staticmethod
    def get_standard_by_id(db: Session, standard_id: str) -> Optional[Standard]:
        """Fetch an Indian Standard by primary key ID (e.g. 'IS-302-2-14')."""
        return db.get(Standard, standard_id)

    @staticmethod
    def get_standard_by_is_number(db: Session, is_number: str) -> Optional[Standard]:
        """Fetch an Indian Standard by exact or normalized IS number."""
        stmt = select(Standard).where(
            func.lower(Standard.is_number) == is_number.strip().lower()
        )
        return db.scalars(stmt).first()

    @staticmethod
    def search_standards(db: Session, query: str, limit: int = 10) -> List[Standard]:
        """Search standards by keyword across IS number, title, category, and description."""
        term = f"%{query.strip().lower()}%"
        stmt = (
            select(Standard)
            .where(
                or_(
                    func.lower(Standard.is_number).like(term),
                    func.lower(Standard.title).like(term),
                    func.lower(Standard.product_category).like(term),
                    func.lower(Standard.description).like(term),
                )
            )
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_all_standards(db: Session, limit: int = 100) -> List[Standard]:
        """List all Indian Standards up to limit."""
        stmt = select(Standard).order_by(Standard.is_number).limit(limit)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_standards_by_category(
        db: Session, category: str, limit: int = 10
    ) -> List[Standard]:
        """Fetch Indian Standards matching a category or sector keyword."""
        term = f"%{category.strip().lower()}%"
        stmt = (
            select(Standard)
            .where(func.lower(Standard.product_category).like(term))
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    # ----------------------------------------------------------------
    # Product Queries
    # ----------------------------------------------------------------

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        """Fetch a product by primary key ID with loaded relationships."""
        stmt = (
            select(Product)
            .options(
                joinedload(Product.aliases),
                joinedload(Product.standards),
                joinedload(Product.qcos),
                joinedload(Product.certification_schemes),
            )
            .where(Product.id == product_id)
        )
        return db.scalars(stmt).unique().first()

    @staticmethod
    def search_products(db: Session, query: str, limit: int = 10) -> List[Product]:
        """Search products across product_name, category, and synonyms/aliases."""
        term = f"%{query.strip().lower()}%"
        stmt = (
            select(Product)
            .outerjoin(Product.aliases)
            .options(
                joinedload(Product.aliases),
                joinedload(Product.standards),
                joinedload(Product.qcos),
                joinedload(Product.certification_schemes),
            )
            .where(
                or_(
                    func.lower(Product.product_name).like(term),
                    func.lower(Product.category).like(term),
                    func.lower(ProductAlias.alias).like(term),
                )
            )
            .distinct()
            .limit(limit)
        )
        return list(db.scalars(stmt).unique().all())

    @staticmethod
    def get_products_by_category(
        db: Session, category: str, limit: int = 10
    ) -> List[Product]:
        """Fetch Products belonging to a specific category or sector."""
        term = f"%{category.strip().lower()}%"
        stmt = (
            select(Product)
            .options(
                joinedload(Product.aliases),
                joinedload(Product.standards),
                joinedload(Product.qcos),
                joinedload(Product.certification_schemes),
            )
            .where(func.lower(Product.category).like(term))
            .distinct()
            .limit(limit)
        )
        return list(db.scalars(stmt).unique().all())

    @staticmethod
    def get_product_standards(db: Session, product_id: str) -> List[Standard]:
        """Retrieve all Indian Standards applicable to a specific product."""
        product = BISQueryService.get_product_by_id(db, product_id)
        if not product:
            return []
        return list(product.standards)

    @staticmethod
    def get_product_qcos(db: Session, product_id: str) -> List[QCO]:
        """Retrieve all QCOs governing a specific product."""
        product = BISQueryService.get_product_by_id(db, product_id)
        if not product:
            return []
        return list(product.qcos)

    @staticmethod
    def get_product_certification_schemes(
        db: Session, product_id: str
    ) -> List[CertificationScheme]:
        """Retrieve all conformity assessment schemes applicable to a product."""
        product = BISQueryService.get_product_by_id(db, product_id)
        if not product:
            return []
        return list(product.certification_schemes)

    @staticmethod
    def is_product_qco_mandatory(db: Session, product_id: str) -> Dict[str, Any]:
        """Determine whether a product falls under any mandatory QCO and its enforcement status."""
        product = BISQueryService.get_product_by_id(db, product_id)
        if not product:
            return {"found": False, "mandatory": False, "qcos": []}

        mandatory_qcos = [q for q in product.qcos if q.mandatory]
        return {
            "found": True,
            "product_id": product.id,
            "product_name": product.product_name,
            "mandatory": len(mandatory_qcos) > 0,
            "qcos": [
                {
                    "id": q.id,
                    "name": q.qco_name,
                    "enforcement_date": q.enforcement_date,
                    "issuing_ministry": q.issuing_ministry,
                    "mandatory": q.mandatory,
                }
                for q in product.qcos
            ],
        }

    # ----------------------------------------------------------------
    # Laboratories Queries
    # ----------------------------------------------------------------

    @staticmethod
    def get_labs_for_standard(
        db: Session, standard_id_or_is_no: str
    ) -> List[Laboratory]:
        """Find all laboratories equipped to test against a standard (by ID or IS number)."""
        clean_input = standard_id_or_is_no.strip()
        stmt = (
            select(Laboratory)
            .join(Laboratory.standards)
            .where(
                or_(
                    Standard.id == clean_input,
                    func.lower(Standard.is_number) == clean_input.lower(),
                )
            )
            .distinct()
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_products_for_standard(
        db: Session, standard_id_or_is_no: str
    ) -> List[Product]:
        """Find all products governed by a specific standard (by ID or IS number)."""
        clean_input = standard_id_or_is_no.strip()
        stmt = (
            select(Product)
            .join(Product.standards)
            .options(
                joinedload(Product.aliases),
                joinedload(Product.standards),
                joinedload(Product.qcos),
                joinedload(Product.certification_schemes),
            )
            .where(
                or_(
                    Standard.id == clean_input,
                    func.lower(Standard.is_number) == clean_input.lower(),
                )
            )
            .distinct()
        )
        return list(db.scalars(stmt).unique().all())

    @staticmethod
    def search_laboratories(
        db: Session, query: str, limit: int = 10
    ) -> List[Laboratory]:
        """Search laboratories across laboratory_name, location, state, lab_code, and testing_scope."""
        clean = query.strip().lower()
        if not clean:
            return []
        term = f"%{clean}%"
        stmt = (
            select(Laboratory)
            .options(
                joinedload(Laboratory.standards),
            )
            .where(
                or_(
                    func.lower(Laboratory.laboratory_name).like(term),
                    func.lower(Laboratory.location).like(term),
                    func.lower(Laboratory.state).like(term),
                    func.lower(Laboratory.lab_code).like(term),
                    func.lower(Laboratory.testing_scope).like(term),
                )
            )
            .distinct()
            .limit(limit)
        )
        results = list(db.scalars(stmt).unique().all())
        if results:
            return results

        # Multi-term / token fallback
        stop_words = {"where", "can", "test", "testing", "what", "which", "how", "the", "and", "for", "with", "from", "about"}
        tokens = [w for w in re.findall(r"\b[a-zA-Z0-9]{3,}\b", clean) if w not in stop_words]
        if not tokens:
            return []

        conditions = []
        for t in tokens:
            t_like = f"%{t}%"
            conditions.extend([
                func.lower(Laboratory.laboratory_name).like(t_like),
                func.lower(Laboratory.location).like(t_like),
                func.lower(Laboratory.state).like(t_like),
                func.lower(Laboratory.lab_code).like(t_like),
                func.lower(Laboratory.testing_scope).like(t_like),
            ])

        stmt = (
            select(Laboratory)
            .options(joinedload(Laboratory.standards))
            .where(or_(*conditions))
            .distinct()
            .limit(limit)
        )
        return list(db.scalars(stmt).unique().all())

    # ----------------------------------------------------------------
    # QCO & Scheme Specific Queries
    # ----------------------------------------------------------------

    @staticmethod
    def get_qco(db: Session, qco_id: str) -> Optional[QCO]:
        """Fetch a QCO by its unique ID with linked standards."""
        stmt = (
            select(QCO)
            .options(joinedload(QCO.standards), joinedload(QCO.products))
            .where(QCO.id == qco_id)
        )
        return db.scalars(stmt).unique().first()

    @staticmethod
    def search_qcos(db: Session, query: str, limit: int = 10) -> List[QCO]:
        """Search QCOs across qco_name, product, and issuing_ministry."""
        clean = query.strip().lower()
        if not clean:
            return []
        term = f"%{clean}%"
        stmt = (
            select(QCO)
            .options(
                joinedload(QCO.standards),
                joinedload(QCO.products),
            )
            .where(
                or_(
                    func.lower(QCO.qco_name).like(term),
                    func.lower(QCO.product).like(term),
                    func.lower(QCO.issuing_ministry).like(term),
                )
            )
            .distinct()
            .limit(limit)
        )
        results = list(db.scalars(stmt).unique().all())
        if results:
            return results

        # Multi-term fallback
        stop_words = {"what", "which", "qco", "order", "under", "mandatory", "compulsory", "the", "and", "for", "with", "from", "about", "standard"}
        tokens = [w for w in re.findall(r"\b[a-zA-Z0-9]{3,}\b", clean) if w not in stop_words]
        if not tokens:
            return []

        conditions = []
        for t in tokens:
            t_like = f"%{t}%"
            conditions.extend([
                func.lower(QCO.qco_name).like(t_like),
                func.lower(QCO.product).like(t_like),
                func.lower(QCO.issuing_ministry).like(t_like),
            ])

        stmt = (
            select(QCO)
            .options(joinedload(QCO.standards), joinedload(QCO.products))
            .where(or_(*conditions))
            .distinct()
            .limit(limit)
        )
        return list(db.scalars(stmt).unique().all())

    @staticmethod
    def get_certification_scheme(
        db: Session, scheme_id: str
    ) -> Optional[CertificationScheme]:
        """Fetch a Certification Scheme by its unique ID with linked standards."""
        stmt = (
            select(CertificationScheme)
            .options(
                joinedload(CertificationScheme.standards),
                joinedload(CertificationScheme.products),
            )
            .where(CertificationScheme.id == scheme_id)
        )
        return db.scalars(stmt).unique().first()

    @staticmethod
    def search_certification_schemes(
        db: Session, query: str, limit: int = 10
    ) -> List[CertificationScheme]:
        """Search certification schemes across scheme_name, product, and certification_type."""
        clean = query.strip().lower()
        if not clean:
            return []
        term = f"%{clean}%"
        stmt = (
            select(CertificationScheme)
            .options(
                joinedload(CertificationScheme.standards),
                joinedload(CertificationScheme.products),
            )
            .where(
                or_(
                    func.lower(CertificationScheme.scheme_name).like(term),
                    func.lower(CertificationScheme.product).like(term),
                    func.lower(CertificationScheme.certification_type).like(term),
                )
            )
            .distinct()
            .limit(limit)
        )
        results = list(db.scalars(stmt).unique().all())
        if results:
            return results

        # Multi-term fallback
        stop_words = {"what", "which", "scheme", "under", "type", "certification", "the", "and", "for", "with", "from", "about"}
        tokens = [w for w in re.findall(r"\b[a-zA-Z0-9]{3,}\b", clean) if w not in stop_words]
        if not tokens:
            return []

        conditions = []
        for t in tokens:
            t_like = f"%{t}%"
            conditions.extend([
                func.lower(CertificationScheme.scheme_name).like(t_like),
                func.lower(CertificationScheme.product).like(t_like),
                func.lower(CertificationScheme.certification_type).like(t_like),
            ])

        stmt = (
            select(CertificationScheme)
            .options(joinedload(CertificationScheme.standards), joinedload(CertificationScheme.products))
            .where(or_(*conditions))
            .distinct()
            .limit(limit)
        )
        return list(db.scalars(stmt).unique().all())

    # ----------------------------------------------------------------
    # General Knowledge Queries
    # ----------------------------------------------------------------

    @staticmethod
    def get_general_knowledge(
        db: Session, query_or_topic: Optional[str] = None, limit: int = 10
    ) -> List[GeneralKnowledge]:
        """Fetch general knowledge articles, optionally filtering by topic or title keyword."""
        stmt = select(GeneralKnowledge)
        if query_or_topic:
            term = f"%{query_or_topic.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(GeneralKnowledge.topic).like(term),
                    func.lower(GeneralKnowledge.title).like(term),
                    func.lower(GeneralKnowledge.text).like(term),
                )
            )
        stmt = stmt.limit(limit)
        return list(db.scalars(stmt).all())

    # ----------------------------------------------------------------
    # BIS Services Queries
    # ----------------------------------------------------------------

    @staticmethod
    def search_bis_services(
        db: Session, query: Optional[str] = None, limit: int = 5
    ) -> List[BISService]:
        """Search BIS digital services by name, purpose, or process keyword."""
        stmt = select(BISService)
        if query:
            term = f"%{query.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(BISService.service_name).like(term),
                    func.lower(BISService.purpose).like(term),
                    func.lower(BISService.who_uses).like(term),
                    func.lower(BISService.process_summary).like(term),
                )
            )
        stmt = stmt.limit(limit)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_bis_service_by_id(db: Session, service_id: str) -> Optional[BISService]:
        """Fetch a BIS service record by its primary key ID."""
        return db.get(BISService, service_id)


query_service = BISQueryService()
