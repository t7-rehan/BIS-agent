"""Deterministic Intent Detection and Entity Extraction Service."""

import re
from typing import Any, Dict, List, Optional
from app.models.schemas import IntentResult


class BISIntentService:
    """Service for classifying user queries and extracting key regulatory entities."""

    # Regex patterns for Indian Standards
    IS_PATTERN = re.compile(r"\bIS(?:\s*/\s*IEC)?\s*\d+(?:\s*\(.*?\))?", re.IGNORECASE)

    # Keywords for BIS-specific intent classification
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

    # Casual conversation phrases — short social exchanges that need no BIS retrieval
    CASUAL_CONVERSATION_PATTERNS = re.compile(
        r"^("
        r"how are you|how're you|how do you do|how r u|"
        r"thank(?:s| you)(?: so much| a lot| very much)?|"
        r"thank(?:s| you)|"
        r"great(?: job| work| answer)?|"
        r"awesome|amazing|perfect|"
        r"ok(?:ay)?|got it|understood|"
        r"nice|cool|good|"
        r"bye(?:bye)?|goodbye|see you|"
        r"you(?:'re| are) (?:helpful|great|good|amazing|awesome)|"
        r"that(?:'s| is) (?:helpful|great|good|clear|perfect|awesome)"
        r")[!.?]*$",
        re.IGNORECASE,
    )

    # General information queries — answerable from Gemini's knowledge, not BIS DB
    GENERAL_INFORMATION_PATTERNS = re.compile(
        r"^("
        r"what (?:is|are|was|were|does|do) (?!bis\b|isi\b|is\s*\d).*|"
        r"(?:who|when|where|why|how) (?:is|are|was|were|does|do) (?!bis\b|isi\b).*|"
        r"(?:tell me|explain|describe|define) (?:what |about )?(?!bis\b|isi\b|is\s*\d).*|"
        r"what(?:'s| is) (?:the )?(?:meaning|definition|difference|purpose) of (?!bis\b|isi\b).*"
        r")$",
        re.IGNORECASE,
    )

    # "What can you do" / capability questions
    CAPABILITY_PATTERNS = re.compile(
        r"^("
        r"what can you (?:do|help with|assist with)[?!.]*|"
        r"what (?:do you|are you able to) (?:do|know|help with)[?!.]*|"
        r"how can you help(?:\s+me)?[?!.]*|"
        r"what(?:'s| is) your (?:purpose|function|capability|role)[?!.]*|"
        r"tell me (?:about yourself|what you can do)[?!.]*|"
        r"(?:help|assist) (?:me )?with what[?!.]*"
        r")$",
        re.IGNORECASE,
    )

    # Greeting / conversational opener patterns
    GREETING_PATTERNS = re.compile(
        r"^(hi|hello|hey|hii|hiii|namaste|namaskar|"
        r"good\s*(?:morning|afternoon|evening|day|night)|"
        r"howdy|greetings|yo|hola|"
        r"(?:hey|hi|hello)\s+there)[\s!?.]*$",
        re.IGNORECASE,
    )

    # Common underspecified BIS query patterns requiring clarification
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

        # ── 0. Pure conversational openers (no retrieval needed) ──────────────

        # 0a. Greeting
        if self.GREETING_PATTERNS.match(clean_query):
            return IntentResult(
                intent="GREETING",
                confidence=0.99,
                entities={},
                clarification_required=False,
            )

        # 0b. Casual social exchange ("thanks", "how are you", "great!", etc.)
        if self.CASUAL_CONVERSATION_PATTERNS.match(clean_query):
            return IntentResult(
                intent="CASUAL_CONVERSATION",
                confidence=0.95,
                entities={},
                clarification_required=False,
            )

        # 0c. Capability question ("what can you do?")
        if self.CAPABILITY_PATTERNS.match(clean_query):
            return IntentResult(
                intent="CASUAL_CONVERSATION",
                confidence=0.92,
                entities={"capability_query": True},
                clarification_required=False,
            )

        # ── 1. Underspecified BIS queries requiring clarification ─────────────
        for pattern in self.UNDERSPECIFIED_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentResult(
                    intent="PRODUCT_STANDARD_QUERY",
                    confidence=0.85,
                    entities={},
                    clarification_required=True,
                    clarifying_question=(
                        "Sure — could you tell me the product name or material? "
                        "For example: domestic pressure cooker, LED lamp, motorcycle helmet, or toys. "
                        "That will let me find the applicable Indian Standard and certification status."
                    ),
                )

        # ── 2. Entity Extraction ──────────────────────────────────────────────
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

        # ── 2e. Bare product with no intent context → natural clarification ───
        intent_signals = (
            self.QCO_KEYWORDS + self.LAB_KEYWORDS + self.SCHEME_KEYWORDS +
            self.CONSUMER_KEYWORDS + self.GENERAL_BIS_KEYWORDS +
            ["standard", "specification", "is number", "applies to", "apply", "rule",
             "how", "what", "which", "where", "why", "who", "tell", "explain",
             "require", "need", "mandatory", "test", "certif"]
        )
        has_intent_signals = any(sig in query_lower for sig in intent_signals)
        if matched_prod_name and not has_intent_signals and not entities.get("is_number"):
            return IntentResult(
                intent="PRODUCT_STANDARD_QUERY",
                confidence=0.75,
                entities=entities,
                clarification_required=True,
                clarifying_question=(
                    f"Sure — I can help with that. Are you looking for the applicable Indian Standard "
                    f"for a {matched_prod_name}, its mandatory certification status under a Quality Control Order, "
                    f"or recognised testing laboratories?"
                ),
            )

        # ── 3. BIS-specific intent classification (first-match wins) ─────────

        # 3a. Consumer grievances & ISI mark verification
        if any(w in query_lower for w in self.CONSUMER_KEYWORDS):
            return IntentResult(
                intent="CONSUMER_SERVICE_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # 3b. General BIS organisational overview
        if any(w in query_lower for w in self.GENERAL_BIS_KEYWORDS):
            return IntentResult(
                intent="GENERAL_BIS_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # 3c. Hallmarking
        if any(w in query_lower for w in self.HALLMARKING_KEYWORDS):
            return IntentResult(
                intent="HALLMARKING_QUERY",
                confidence=0.95,
                entities=entities,
                clarification_required=False,
            )

        # 3d. Direct standard lookup (e.g. "Tell me about IS 1293")
        if entities.get("is_number") and not any(w in query_lower for w in self.QCO_KEYWORDS + self.LAB_KEYWORDS):
            return IntentResult(
                intent="STANDARD_LOOKUP",
                confidence=0.95,
                entities=entities,
                clarification_required=False,
            )

        # 3e. Laboratory query
        if any(w in query_lower for w in self.LAB_KEYWORDS):
            return IntentResult(
                intent="LABORATORY_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # 3f. QCO / Mandatory Compliance query
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

        # 3g. Certification scheme query
        if entities.get("certification_scheme") or any(w in query_lower for w in self.SCHEME_KEYWORDS):
            return IntentResult(
                intent="CERTIFICATION_QUERY",
                confidence=0.90,
                entities=entities,
                clarification_required=False,
            )

        # 3h. Product standard query (has product name or standard keywords)
        if entities.get("product_name") or any(w in query_lower for w in ["standard", "specification", "is number", "applies to"]):
            return IntentResult(
                intent="PRODUCT_STANDARD_QUERY",
                confidence=0.85,
                entities=entities,
                clarification_required=False,
            )

        # ── 4. General information query (answerable from Gemini general knowledge) ──
        # Only reached if no BIS-specific signal was found above.
        # Matches "What is ISO?", "What is certification?", "What is a QCO?", etc.
        if self.GENERAL_INFORMATION_PATTERNS.match(clean_query) or len(clean_query.split()) >= 4:
            return IntentResult(
                intent="GENERAL_INFORMATION",
                confidence=0.70,
                entities=entities,
                clarification_required=False,
            )

        # ── Fallback ──────────────────────────────────────────────────────────
        return IntentResult(
            intent="UNKNOWN_QUERY",
            confidence=0.50,
            entities=entities,
            clarification_required=False,
        )


intent_service = BISIntentService()
