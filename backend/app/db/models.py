"""SQLAlchemy 2.0 ORM models and association tables for BIS datasets."""

from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    JSON,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


# ====================================================================
# Association Tables (Many-to-Many Relationships)
# ====================================================================

product_standards = Table(
    "product_standards",
    Base.metadata,
    Column(
        "product_id",
        String(64),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "standard_id",
        String(64),
        ForeignKey("standards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

product_qcos = Table(
    "product_qcos",
    Base.metadata,
    Column(
        "product_id",
        String(64),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "qco_id",
        String(64),
        ForeignKey("qcos.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

product_certification_schemes = Table(
    "product_certification_schemes",
    Base.metadata,
    Column(
        "product_id",
        String(64),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "scheme_id",
        String(64),
        ForeignKey("certification_schemes.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

qco_standards = Table(
    "qco_standards",
    Base.metadata,
    Column(
        "qco_id",
        String(64),
        ForeignKey("qcos.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "standard_id",
        String(64),
        ForeignKey("standards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

scheme_standards = Table(
    "scheme_standards",
    Base.metadata,
    Column(
        "scheme_id",
        String(64),
        ForeignKey("certification_schemes.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "standard_id",
        String(64),
        ForeignKey("standards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

laboratory_standards = Table(
    "laboratory_standards",
    Base.metadata,
    Column(
        "laboratory_id",
        String(64),
        ForeignKey("laboratories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "standard_id",
        String(64),
        ForeignKey("standards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ====================================================================
# Core Domain Models
# ====================================================================

class Standard(Base):
    """Indian Standard specification (IS)."""

    __tablename__ = "standards"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    is_number: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    product_category: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    technical_department: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="Active")
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    source_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    retrieved_at: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relational mappings
    products: Mapped[List["Product"]] = relationship(
        "Product",
        secondary=product_standards,
        back_populates="standards",
    )
    qcos: Mapped[List["QCO"]] = relationship(
        "QCO",
        secondary=qco_standards,
        back_populates="standards",
    )
    certification_schemes: Mapped[List["CertificationScheme"]] = relationship(
        "CertificationScheme",
        secondary=scheme_standards,
        back_populates="standards",
    )
    laboratories: Mapped[List["Laboratory"]] = relationship(
        "Laboratory",
        secondary=laboratory_standards,
        back_populates="standards",
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert standard model to dictionary."""
        return {
            "id": self.id,
            "is_number": self.is_number,
            "title": self.title,
            "product_category": self.product_category,
            "description": self.description,
            "technical_department": self.technical_department,
            "status": self.status,
            "source_url": self.source_url,
            "source_title": self.source_title,
            "retrieved_at": self.retrieved_at,
        }

    def __repr__(self) -> str:
        return f"<Standard id={self.id} is_number='{self.is_number}'>"


class ProductAlias(Base):
    """Search aliases and synonyms for products."""

    __tablename__ = "product_aliases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    alias: Mapped[str] = mapped_column(String(256), nullable=False, index=True)

    product: Mapped["Product"] = relationship("Product", back_populates="aliases")

    def __repr__(self) -> str:
        return f"<ProductAlias alias='{self.alias}'>"


class Product(Base):
    """Commercial and consumer product mapped to applicable standards, QCOs, and schemes."""

    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(256), nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    # Relational mappings
    aliases: Mapped[List["ProductAlias"]] = relationship(
        "ProductAlias",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        secondary=product_standards,
        back_populates="products",
    )
    qcos: Mapped[List["QCO"]] = relationship(
        "QCO",
        secondary=product_qcos,
        back_populates="products",
    )
    certification_schemes: Mapped[List["CertificationScheme"]] = relationship(
        "CertificationScheme",
        secondary=product_certification_schemes,
        back_populates="products",
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert product model to dictionary."""
        return {
            "id": self.id,
            "product_name": self.product_name,
            "category": self.category,
            "source_url": self.source_url,
            "aliases": [a.alias for a in self.aliases],
            "applicable_is_numbers": [s.is_number for s in self.standards],
            "qco_ids": [q.id for q in self.qcos],
            "certification_scheme_ids": [c.id for c in self.certification_schemes],
        }

    def __repr__(self) -> str:
        return f"<Product id={self.id} name='{self.product_name}'>"


class QCO(Base):
    """Quality Control Order issued by line ministries."""

    __tablename__ = "qcos"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    qco_name: Mapped[str] = mapped_column(String(512), nullable=False)
    product: Mapped[str] = mapped_column(String(512), nullable=False)
    issuing_ministry: Mapped[str] = mapped_column(String(256), nullable=False)
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enforcement_date: Mapped[str] = mapped_column(String(64), nullable=False)
    amendments: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    retrieved_at: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relational mappings
    products: Mapped[List["Product"]] = relationship(
        "Product",
        secondary=product_qcos,
        back_populates="qcos",
    )
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        secondary=qco_standards,
        back_populates="qcos",
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert QCO model to dictionary."""
        return {
            "id": self.id,
            "qco_name": self.qco_name,
            "product": self.product,
            "issuing_ministry": self.issuing_ministry,
            "mandatory": self.mandatory,
            "enforcement_date": self.enforcement_date,
            "amendments": self.amendments,
            "source_url": self.source_url,
            "retrieved_at": self.retrieved_at,
            "is_numbers": [s.is_number for s in self.standards],
        }

    def __repr__(self) -> str:
        return f"<QCO id={self.id} name='{self.qco_name}'>"


class CertificationScheme(Base):
    """BIS Conformity assessment scheme (e.g. Scheme I ISI, Scheme II CRS)."""

    __tablename__ = "certification_schemes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    scheme_name: Mapped[str] = mapped_column(String(256), nullable=False)
    product: Mapped[str] = mapped_column(String(512), nullable=False)
    certification_type: Mapped[str] = mapped_column(String(128), nullable=False)
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    # Relational mappings
    products: Mapped[List["Product"]] = relationship(
        "Product",
        secondary=product_certification_schemes,
        back_populates="certification_schemes",
    )
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        secondary=scheme_standards,
        back_populates="certification_schemes",
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert scheme model to dictionary."""
        return {
            "id": self.id,
            "scheme_name": self.scheme_name,
            "product": self.product,
            "certification_type": self.certification_type,
            "mandatory": self.mandatory,
            "source_url": self.source_url,
            "is_numbers": [s.is_number for s in self.standards],
        }

    def __repr__(self) -> str:
        return f"<CertificationScheme id={self.id} name='{self.scheme_name}'>"


class Laboratory(Base):
    """BIS Central, Regional, or recognized external testing facility."""

    __tablename__ = "laboratories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    laboratory_name: Mapped[str] = mapped_column(String(256), nullable=False)
    lab_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(512), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    testing_scope: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    validity: Mapped[str] = mapped_column(String(256), nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    # Relational mappings
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        secondary=laboratory_standards,
        back_populates="laboratories",
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert laboratory model to dictionary."""
        return {
            "id": self.id,
            "laboratory_name": self.laboratory_name,
            "lab_code": self.lab_code,
            "location": self.location,
            "state": self.state,
            "testing_scope": self.testing_scope,
            "validity": self.validity,
            "source_url": self.source_url,
            "applicable_is_numbers": [s.is_number for s in self.standards],
        }

    def __repr__(self) -> str:
        return f"<Laboratory id={self.id} code='{self.lab_code}'>"


class GeneralKnowledge(Base):
    """Authoritative reference article explaining BIS regulatory procedures and consumer rights."""

    __tablename__ = "general_knowledge"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    topic: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    retrieved_at: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert general knowledge model to dictionary."""
        return {
            "id": self.id,
            "topic": self.topic,
            "title": self.title,
            "text": self.text,
            "source_url": self.source_url,
            "source_type": self.source_type,
            "retrieved_at": self.retrieved_at,
        }

    def __repr__(self) -> str:
        return f"<GeneralKnowledge id={self.id} topic='{self.topic}'>"
