"""Automated tests for Phase 3 SQLite database, models, seeding, and query services."""

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db.database import Base, get_engine
from app.db.models import (
    CertificationScheme,
    GeneralKnowledge,
    Laboratory,
    Product,
    ProductAlias,
    QCO,
    Standard,
)
from app.db.seed import seed_database
from app.services.query_service import BISQueryService


@pytest.fixture(scope="function")
def test_engine():
    """Provide a clean in-memory SQLite database engine for testing."""
    engine = get_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Provide a seeded database session for testing queries and relationships."""
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestSession()
    seed_database(session, init_tables=False)
    yield session
    session.close()


# ====================================================================
# 1. Database Initialization & Model Creation Tests
# ====================================================================

def test_database_initialization(test_engine):
    """Verify that all tables are created cleanly in a fresh database."""
    table_names = Base.metadata.tables.keys()
    expected_tables = {
        "standards",
        "products",
        "product_aliases",
        "qcos",
        "certification_schemes",
        "laboratories",
        "general_knowledge",
        "product_standards",
        "product_qcos",
        "product_certification_schemes",
        "qco_standards",
        "scheme_standards",
        "laboratory_standards",
    }
    assert expected_tables.issubset(set(table_names)), (
        f"Missing expected tables. Present: {set(table_names)}"
    )


def test_model_creation_and_repr(test_engine):
    """Verify individual model instances can be created and formatted."""
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    with TestSession() as session:
        std = Standard(
            id="IS-TEST-1",
            is_number="IS 99999 : 2026",
            title="Test Specification Title",
            product_category="Testing",
            description="A test description.",
            technical_department="Testing Dept",
            status="Active",
            source_url="https://bis.gov.in/test",
        )
        session.add(std)
        session.commit()

        fetched = session.get(Standard, "IS-TEST-1")
        assert fetched is not None
        assert fetched.is_number == "IS 99999 : 2026"
        assert repr(fetched) == "<Standard id=IS-TEST-1 is_number='IS 99999 : 2026'>"
        assert fetched.to_dict()["id"] == "IS-TEST-1"


# ====================================================================
# 2. Seeding & Idempotency Tests
# ====================================================================

def test_seeding_counts(test_db):
    """Verify exact counts of records imported from Phase 2 datasets."""
    from sqlalchemy import func

    standards_count = test_db.scalar(select(func.count(Standard.id)))
    products_count = test_db.scalar(select(func.count(Product.id)))
    qcos_count = test_db.scalar(select(func.count(QCO.id)))
    schemes_count = test_db.scalar(select(func.count(CertificationScheme.id)))
    labs_count = test_db.scalar(select(func.count(Laboratory.id)))
    gk_count = test_db.scalar(select(func.count(GeneralKnowledge.id)))

    assert standards_count == 26
    assert products_count == 23
    assert qcos_count == 16
    assert schemes_count == 20
    assert labs_count == 20
    assert gk_count == 12


def test_seed_idempotency(test_db):
    """Verify that re-running seed does not duplicate records or associations."""
    from sqlalchemy import func

    # Re-run seeding on already-seeded session
    summary2 = seed_database(test_db, init_tables=False)

    assert summary2["standards"] == 26
    assert summary2["products"] == 23
    assert summary2["qcos"] == 16

    # Verify counts remain identical
    assert test_db.scalar(select(func.count(Standard.id))) == 26
    assert test_db.scalar(select(func.count(Product.id))) == 23
    assert test_db.scalar(select(func.count(QCO.id))) == 16
    assert test_db.scalar(select(func.count(CertificationScheme.id))) == 20
    assert test_db.scalar(select(func.count(Laboratory.id))) == 20
    assert test_db.scalar(select(func.count(GeneralKnowledge.id))) == 12


# ====================================================================
# 3. Standard & Product Retrieval Tests
# ====================================================================

def test_standard_retrieval(test_db):
    """Verify standard retrieval by ID, exact IS number, and search."""
    # By ID
    std_by_id = BISQueryService.get_standard_by_id(test_db, "IS-302-2-14")
    assert std_by_id is not None
    assert "Kitchen Machines" in std_by_id.title

    # By IS Number
    std_by_is = BISQueryService.get_standard_by_is_number(
        test_db, "IS 302 (Part 2/Sec 14) : 2009"
    )
    assert std_by_is is not None
    assert std_by_is.id == "IS-302-2-14"

    # Search standards
    search_results = BISQueryService.search_standards(test_db, "luminaire")
    assert len(search_results) > 0
    assert any("10322" in s.is_number for s in search_results)


def test_product_retrieval_and_aliases(test_db):
    """Verify product retrieval by ID and search across product name and aliases."""
    prod = BISQueryService.get_product_by_id(test_db, "PROD-ELECTRIC-MIXER")
    assert prod is not None
    assert "Mixer" in prod.product_name

    # Check aliases
    aliases = [a.alias for a in prod.aliases]
    assert len(aliases) > 0
    assert any("grinder" in a.lower() for a in aliases)

    # Search by alias term
    alias_search = BISQueryService.search_products(test_db, "kitchen grinder")
    assert len(alias_search) > 0
    assert any(p.id == "PROD-ELECTRIC-MIXER" for p in alias_search)


# ====================================================================
# 4. Relational Integrity Tests
# ====================================================================

def test_product_to_standard_relationship(test_db):
    """Verify that products correctly map to their Indian Standards."""
    prod = BISQueryService.get_product_by_id(test_db, "PROD-ELECTRIC-MIXER")
    assert prod is not None
    stds = BISQueryService.get_product_standards(test_db, prod.id)
    std_numbers = [s.is_number for s in stds]

    assert "IS 302 (Part 1) : 2024" in std_numbers
    assert "IS 302 (Part 2/Sec 14) : 2009" in std_numbers


def test_product_to_qco_relationship(test_db):
    """Verify product to QCO relationship and mandatory enforcement check."""
    prod = BISQueryService.get_product_by_id(test_db, "PROD-ELECTRIC-MIXER")
    assert prod is not None
    qcos = BISQueryService.get_product_qcos(test_db, prod.id)
    assert len(qcos) > 0
    assert qcos[0].id == "QCO-APPLIANCES-2024"

    # Mandatory status check
    status = BISQueryService.is_product_qco_mandatory(test_db, prod.id)
    assert status["found"] is True
    assert status["mandatory"] is True
    assert status["qcos"][0]["id"] == "QCO-APPLIANCES-2024"
    assert status["qcos"][0]["enforcement_date"] == "2025-03-05"


def test_product_to_certification_scheme_relationship(test_db):
    """Verify product to certification scheme mapping."""
    prod = BISQueryService.get_product_by_id(test_db, "PROD-ELECTRIC-MIXER")
    assert prod is not None
    schemes = BISQueryService.get_product_certification_schemes(test_db, prod.id)
    assert len(schemes) > 0
    assert schemes[0].id == "SCHEME-ISI-KITCHEN-MACHINES"
    assert schemes[0].certification_type == "Scheme I (ISI Mark)"


def test_laboratory_to_standard_relationship(test_db):
    """Verify laboratories capable of testing against a standard."""
    # Find labs for IS 302 (Part 2/Sec 14) : 2009
    labs = BISQueryService.get_labs_for_standard(
        test_db, "IS 302 (Part 2/Sec 14) : 2009"
    )
    assert len(labs) > 0
    lab_codes = [l.lab_code for l in labs]
    assert "CLD-GZB-01" in lab_codes  # BIS Central Laboratory


def test_products_for_standard_reverse_lookup(test_db):
    """Verify finding products associated with an Indian Standard."""
    products = BISQueryService.get_products_for_standard(test_db, "IS-302-2-14")
    assert len(products) > 0
    prod_ids = [p.id for p in products]
    assert "PROD-ELECTRIC-MIXER" in prod_ids


def test_qco_and_scheme_direct_lookups(test_db):
    """Verify direct fetching of QCOs and Certification Schemes."""
    qco = BISQueryService.get_qco(test_db, "QCO-ELECTRICAL-2020")
    assert qco is not None
    assert len(qco.standards) == 2
    assert qco.mandatory is True

    scheme = BISQueryService.get_certification_scheme(test_db, "SCHEME-CRS-LED")
    assert scheme is not None
    assert len(scheme.standards) == 1
    assert scheme.certification_type == "Scheme II (CRS)"


def test_general_knowledge_lookup(test_db):
    """Verify general knowledge querying by topic and keywords."""
    all_gk = BISQueryService.get_general_knowledge(test_db)
    assert len(all_gk) == 10  # default limit 10
    total_gk = BISQueryService.get_general_knowledge(test_db, limit=20)
    assert len(total_gk) == 12

    hallmarking_articles = BISQueryService.get_general_knowledge(test_db, "HUID")
    assert len(hallmarking_articles) > 0
    assert "HUID" in hallmarking_articles[0].title


def test_nonexistent_references_handled_safely(test_db):
    """Verify querying non-existent entities returns None or empty collections safely."""
    assert BISQueryService.get_standard_by_id(test_db, "NON-EXISTENT") is None
    assert BISQueryService.get_standard_by_is_number(test_db, "IS 00000 : 9999") is None
    assert BISQueryService.get_product_by_id(test_db, "NON-EXISTENT") is None
    assert BISQueryService.get_product_standards(test_db, "NON-EXISTENT") == []
    assert BISQueryService.get_product_qcos(test_db, "NON-EXISTENT") == []
    assert BISQueryService.get_product_certification_schemes(test_db, "NON-EXISTENT") == []
    assert BISQueryService.get_labs_for_standard(test_db, "NON-EXISTENT") == []
    assert BISQueryService.get_products_for_standard(test_db, "NON-EXISTENT") == []
    assert BISQueryService.get_qco(test_db, "NON-EXISTENT") is None
    assert BISQueryService.get_certification_scheme(test_db, "NON-EXISTENT") is None

    mandatory_check = BISQueryService.is_product_qco_mandatory(test_db, "NON-EXISTENT")
    assert mandatory_check["found"] is False
    assert mandatory_check["mandatory"] is False


def test_foreign_key_enforcement(test_db):
    """Verify that foreign key constraints are strictly enforced."""
    from sqlalchemy.exc import IntegrityError
    from app.db.models import product_standards

    # Inserting invalid standard_id into association table should raise IntegrityError
    with pytest.raises(IntegrityError):
        test_db.execute(
            product_standards.insert().values(
                product_id="PROD-ELECTRIC-MIXER",
                standard_id="IS-DOES-NOT-EXIST",
            )
        )
        test_db.commit()
    test_db.rollback()
