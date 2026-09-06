"""Deterministic Intent Detection and Entity Extraction Service."""

import re
from typing import Any, Dict, List, Optional
from app.models.schemas import IntentResult


class BISIntentService:
    """Service for classifying user queries and extracting key regulatory entities."""

    # Regex patterns for Indian Standards
    IS_PATTERN = re.compile(r"\bIS(?:\s*/\s*IEC)?\s*\d+(?:\s*\(.*?\))?", re.IGNORECASE)

    # Keywords for intent classification
    QCO_KEYWORDS = [
        "mandatory", "compulsory", "qco", "quality control order", "enforce",
        "enforcement", "gazette", "order", "deadline", "penalty", "illegal without"
    ]
    LAB_KEYWORDS = [
        "lab", "laboratory", "testing", "test facility", "test report", "where to test",
        "accredited lab", "testing center", "nth", "cipet", "lims"
    ]
    SCHEME_KEYWORDS = [
        "scheme", "scheme 1", "scheme i", "scheme 2", "scheme ii", "crs", "fmcs",
        "isi mark", "licence", "license", "how to apply", "certification process",
        "factory audit", "surveillance"
    ]
    HALLMARKING_KEYWORDS = [
        "hallmark", "hallmarking", "gold", "silver", "huid", "carat", "karat", "jewellery", "jewelry"
    ]
    CONSUMER_KEYWORDS = [
        "complaint", "grievance", "bis care", "verify mark", "fake isi", "consumer",
        "substandard", "how to report"
    ]
    GENERAL_BIS_KEYWORDS = [
        "what is bis", "about bis", "bureau of indian standards", "national standards body",
        "what does bis do", "role of bis", "manakonline", "standards portal"
    ]

    # Common underspecified query patterns requiring clarification
    UNDERSPECIFIED_PATTERNS = [
        r"^(?:which|what)\s+standard\s+applies\s+to\s+my\s+product\??$",
        r"^(?:does|is)\s+(?:my|this)?\s*product\s+(?:need|require|mandatory)\s+(?:bis|certification)\??$",
        r"^(?:what|which)\s+(?:is\s+the\s+)?standard\s+for\s+my\s+item\??$",
        r"^(?:how\s+to\s+get\s+)?certification\s+for\s+my\s+product\??$",
        r"^which\s+standard\s+do\s+i\s+need\??$",
        r"^is\s+certification\s+mandatory\??$",
        r"^how\s+do\s+i\s+get\s+bis\s+license\??$",
    ]

    # Curated product catalog vocabulary for deterministic matching
    KNOWN_PRODUCTS = {
        "PROD-ELECTRIC-MIXER": ["electric food mixer", "electric mixer", "food mixer", "mixer grinder", "kitchen grinder", "mixie", "food processor", "juicer mixer"],
        "PROD-PLUG-SOCKET": ["plug", "socket", "socket-outlet", "plugs and socket-outlets", "3-pin plug", "wall plug", "power socket"],
        "PROD-PRESSURE-COOKER": ["pressure cooker", "cooker", "domestic pressure cooker"],
        "PROD-EMERGENCY-LUMINAIRE": ["emergency luminaire", "emergency light", "led emergency light"],
        "PROD-LED-LAMP": ["led lamp", "led bulb", "self-ballasted led"],
        "PROD-LED-DRIVER": ["led driver", "lamp controlgear", "controlgear"],
        "PROD-TMT-REBAR": ["tmt rebar", "tmt bar", "steel bar", "deformed steel bar", "reinforcement steel"],
        "PROD-STRUCTURAL-STEEL": ["structural steel", "hot rolled steel"],
        "PROD-TWO-WHEELER-HELMET": ["helmet", "two-wheeler helmet", "protective helmet", "motorcycle helmet", "rider helmet"],
        "PROD-EV-TRACTION-BATTERY": ["ev battery", "traction battery", "electric vehicle battery"],
        "PROD-EV-CHARGER": ["ev charger", "charging station", "electric vehicle charger"],
        "PROD-CEMENT-OPC": ["opc", "ordinary portland cement", "opc cement"],
        "PROD-CEMENT-PPC": ["ppc", "portland pozzolana cement", "fly ash cement"],
        "PROD-PACKAGED-WATER": ["packaged drinking water", "bottled water", "drinking water"],
        "PROD-MINERAL-WATER": ["natural mineral water", "mineral water"],
        "PROD-TOYS-MECHANICAL": ["toys", "toy", "children toy", "mechanical toy", "physical toy"],
        "PROD-LAPTOP-NOTEBOOK": ["laptop", "notebook computer", "notebook"],
        "PROD-LITHIUM-CELL": ["lithium cell", "powerbank", "lithium battery", "secondary cell"],
        "PROD-SOLAR-PV-MODULE": ["solar module", "solar panel", "photovoltaic module", "pv module"],
        "PROD-GOLD-JEWELLERY": ["gold jewellery", "gold jewelry", "gold artefact", "gold ring", "gold necklace"],
        "PROD-SILVER-JEWELLERY": ["silver jewellery", "silver jewelry", "silver artefact"],
        "PROD-FOOD-POLYETHYLENE": ["food contact polyethylene", "polyethylene film", "food packaging plastic"],
        "PROD-STAINLESS-SINK": ["stainless steel sink", "kitchen sink", "steel sink"],
    }

    def detect_intent(self, query: str) -> IntentResult:
        """Analyze query, extract entities, detect intent and check for underspecification."""
        clean_query = query.strip()
        query_lower = clean_query.lower()

        # 1. Check for underspecified query triggering clarification
        for pattern in self.UNDERSPECIFIED_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentResult(
                    intent="PRODUCT_STANDARD_QUERY",
                    confidence=0.85,
                    entities={},
                    clarification_required=True,
                    clarifying_question=(
                        "Please specify the product name, intended use, or material (for example: "
                        "electric food mixer, domestic pressure cooker, LED luminaire, or toys) "
                        "so I can identify the relevant Indian Standard and mandatory certification status."
                    ),
                )

        # 2. Extract Entities
        entities: Dict[str, Any] = {}

        # 2a. IS Numbers
        is_matches = self.IS_PATTERN.findall(clean_query)
        if is_matches:
            entities["is_number"] = re.sub(r"\s+", " ", is_matches[0]).strip()

        # 2b. Product matching
        matched_prod_id = None
        matched_prod_name = None
        for prod_id, aliases in self.KNOWN_PRODUCTS.items():
            for alias in aliases:
                # Support singular or plural forms (e.g., mixer/mixers, cooker/cookers)
                pattern = rf"\b{re.escape(alias)}s?\b"
                if re.search(pattern, query_lower):
                    matched_prod_id = prod_id
                    matched_prod_name = alias
                    break
            if matched_prod_id:
                break

        if matched_prod_id:
            entities["product_id"] = matched_prod_id
            entities["product_name"] = matched_prod_name

        # 2c. Certification Scheme
        if "scheme 1" in query_lower or "scheme i" in query_lower or "isi mark" in query_lower:
            entities["certification_scheme"] = "Scheme I (ISI Mark)"
        elif "scheme 2" in query_lower or "scheme ii" in query_lower or "crs" in query_lower:
            entities["certification_scheme"] = "Scheme II (Compulsory Registration Scheme - CRS)"
        elif "fmcs" in query_lower or "foreign manufacturer" in query_lower:
            entities["certification_scheme"] = "Foreign Manufacturers Certification Scheme (FMCS)"
        elif "hallmark" in query_lower:
            entities["certification_scheme"] = "Hallmarking Scheme"

        # 2d. Laboratory indicators
        if any(w in query_lower for w in ["lab", "laboratory", "testing"]):
            for lab_hint in ["cipet", "nth", "national test house", "central lab", "mumbai", "kolkata", "chennai"]:
                if lab_hint in query_lower:
                    entities["laboratory"] = lab_hint.upper()
                    break

        # 2e. Check for bare / vague product query without intent context (e.g. "cooker", "toys")
        intent_signals = (
            self.QCO_KEYWORDS + self.LAB_KEYWORDS + self.SCHEME_KEYWORDS +
            self.CONSUMER_KEYWORDS + self.GENERAL_BIS_KEYWORDS +
            ["standard", "specification", "is number", "applies to", "apply", "rule", "how", "what", "which", "where", "why", "who", "tell", "explain", "require", "need", "mandatory"]
        )
        has_intent_signals = any(sig in query_lower for sig in intent_signals)
        if matched_prod_name and not has_intent_signals and not entities.get("is_number"):
            return IntentResult(
                intent="PRODUCT_STANDARD_QUERY",
                confidence=0.75,
                entities=entities,
                clarification_required=True,
                clarifying_question=(
                    f"You asked about '{matched_prod_name}'. Are you looking for its applicable Indian Standard, "
                    f"mandatory certification status under Quality Control Orders (QCOs), or recognized testing laboratories?"
                ),
            )

        # 3. Categorize Intent (ordered from most specific to general)

        # Rule 3a: Consumer grievances & verification (e.g. BIS care, report fake ISI)
        if any(w in query_lower for w in self.CONSUMER_KEYWORDS):
            return IntentResult(
                intent="CONSUMER_SERVICE_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3b: General BIS organizational overview
        if any(w in query_lower for w in self.GENERAL_BIS_KEYWORDS):
            return IntentResult(
                intent="GENERAL_BIS_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3c: Hallmarking
        if any(w in query_lower for w in self.HALLMARKING_KEYWORDS):
            return IntentResult(
                intent="HALLMARKING_QUERY",
                confidence=0.95,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3d: Direct standard lookup (e.g. "What is IS 1293?", "Scope of IS 302")
        if entities.get("is_number") and not any(w in query_lower for w in self.QCO_KEYWORDS + self.LAB_KEYWORDS):
            return IntentResult(
                intent="STANDARD_LOOKUP",
                confidence=0.95,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3e: Laboratory query
        if any(w in query_lower for w in self.LAB_KEYWORDS):
            return IntentResult(
                intent="LABORATORY_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3f: QCO / Mandatory Compliance query
        has_qco_keyword = any(
            w in query_lower
            for w in [
                "mandatory", "qco", "quality control order", "enforce",
                "enforcement", "gazette", "deadline", "penalty", "illegal without"
            ]
        ) or ("compulsory" in query_lower and "compulsory registration scheme" not in query_lower)

        if has_qco_keyword:
            return IntentResult(
                intent="QCO_COMPLIANCE_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3g: Certification scheme query (e.g. Scheme 1 ISI, Scheme 2 CRS, licensing, process)
        if entities.get("certification_scheme") or any(w in query_lower for w in self.SCHEME_KEYWORDS):
            return IntentResult(
                intent="CERTIFICATION_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # Rule 3h: Product standard query
        if entities.get("product_name") or any(w in query_lower for w in ["standard", "specification", "is number", "applies to"]):
            return IntentResult(
                intent="PRODUCT_STANDARD_QUERY",
                confidence=0.85,
                entities=entities,
                clarification_required=False,
            )

        # Fallback
        return IntentResult(
            intent="UNKNOWN_QUERY",
            confidence=0.50,
            entities=entities,
            clarification_required=False,
        )


intent_service = BISIntentService()
