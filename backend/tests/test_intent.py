"""Unit tests for BISIntentService."""

import pytest
from app.services.intent_service import intent_service


def test_intent_standard_lookup():
    """Verify IS number query triggers STANDARD_LOOKUP intent."""
    res = intent_service.detect_intent("What is IS 1293 : 2019?")
    assert res.intent == "STANDARD_LOOKUP"
    assert res.entities.get("is_number") == "IS 1293"
    assert res.clarification_required is False


def test_intent_product_standard_query():
    """Verify product standard query detects product entity and intent."""
    res = intent_service.detect_intent("Which Indian Standard applies to electric food mixers?")
    assert res.intent == "PRODUCT_STANDARD_QUERY"
    assert res.entities.get("product_id") == "PROD-ELECTRIC-MIXER"
    assert res.clarification_required is False


def test_intent_qco_compliance():
    """Verify mandatory / QCO queries trigger QCO_COMPLIANCE_QUERY."""
    res = intent_service.detect_intent("Is BIS certification mandatory for domestic pressure cookers?")
    assert res.intent == "QCO_COMPLIANCE_QUERY"
    assert res.entities.get("product_id") == "PROD-PRESSURE-COOKER"
    assert res.clarification_required is False


def test_intent_certification_scheme():
    """Verify scheme and licence queries trigger CERTIFICATION_QUERY."""
    res = intent_service.detect_intent("How do I apply for an ISI mark under Scheme 1?")
    assert res.intent == "CERTIFICATION_QUERY"
    assert res.entities.get("certification_scheme") == "Scheme I (ISI Mark)"
    assert res.clarification_required is False


def test_intent_laboratory_query():
    """Verify testing and laboratory queries trigger LABORATORY_QUERY."""
    res = intent_service.detect_intent("Where can I test HDPE pipes at a recognized laboratory?")
    assert res.intent == "LABORATORY_QUERY"
    assert res.clarification_required is False


def test_intent_hallmarking_query():
    """Verify jewellery and hallmarking queries trigger HALLMARKING_QUERY."""
    res = intent_service.detect_intent("What are the 6-digit HUID rules for gold jewellery hallmarking?")
    assert res.intent == "HALLMARKING_QUERY"
    assert res.entities.get("certification_scheme") == "Hallmarking Scheme"
    assert res.clarification_required is False


def test_intent_consumer_service():
    """Verify complaints and BIS Care app queries trigger CONSUMER_SERVICE_QUERY."""
    res = intent_service.detect_intent("How can a consumer report fake ISI mark on the BIS Care app?")
    assert res.intent == "CONSUMER_SERVICE_QUERY"
    assert res.clarification_required is False


def test_intent_general_bis():
    """Verify general organizational questions trigger GENERAL_BIS_QUERY."""
    res = intent_service.detect_intent("What is the role of the Bureau of Indian Standards in India?")
    assert res.intent == "GENERAL_BIS_QUERY"
    assert res.clarification_required is False


def test_intent_unknown_query():
    """Verify unclassifiable input triggers UNKNOWN_QUERY fallback."""
    res = intent_service.detect_intent("foobar random sentence with zero keywords 12345")
    assert res.intent == "UNKNOWN_QUERY"
    assert res.confidence <= 0.6


def test_underspecified_query_requires_clarification():
    """Verify generic underspecified product question triggers clarification."""
    res = intent_service.detect_intent("Which standard applies to my product?")
    assert res.clarification_required is True
    assert res.clarifying_question is not None
    assert "specify the product name" in res.clarifying_question.lower()
