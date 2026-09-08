"""Deterministic Intent Detection and Entity Extraction Service."""

import re
from typing import Any, Dict, List, Optional
from app.models.schemas import ConversationTurn, IntentResult


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
        "lab", "laboratory", "test", "testing", "tested", "test facility", "test report", "where to test",
        "accredited lab", "testing center", "nth", "cipet", "lims", "what tests are required",
        "tests required", "testing requirements", "what tests", "parameters", "testing scope"
    ]
    SCHEME_KEYWORDS = [
        "scheme", "scheme 1", "scheme i", "scheme 2", "scheme ii", "crs", "fmcs",
        "isi mark", "licence", "license", "how to apply", "certification process",
        "certification procedure", "how to get certified", "apply for certification",
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
        r"how are you(?: doing)?|how're you(?: doing)?|how do you do|how r u|how are things|"
        r"thank(?:s| you).*|"
        r"thx|ty|"
        r"great(?: job| work| answer)?|"
        r"awesome|amazing|perfect|wonderful|excellent|"
        r"ok(?:ay)?|got it|understood|sure|all right|alright|"
        r"nice|cool|good|"
        r"bye(?:bye)?|goodbye|see you(?: soon| later)?|"
        r"you(?:'re| are) (?:helpful|great|good|amazing|awesome|the best)|"
        r"that(?:'s| is) (?:helpful|great|good|clear|perfect|awesome)"
        r")[!\s.?]*$",
        re.IGNORECASE,
    )

    # General information queries — answerable from Gemini's knowledge, not BIS DB
    GENERAL_INFORMATION_PATTERNS = re.compile(
        r"^(?!.*\bbis\b)("
        r"what (?:is|are|was|were|does|do) (?!isi\b|is\s*\d).+|"
        r"(?:who|when|where|why|how) (?:is|are|was|were|does|do) (?!isi\b).+|"
        r"(?:tell me|explain|describe|define) (?:what |about )?(?!isi\b|is\s*\d).+|"
        r"what(?:'s| is) (?:the )?(?:meaning|definition|difference|purpose) of (?!isi\b).+"
        r")$",
        re.IGNORECASE,
    )

    # "What can you do" / capability questions
    CAPABILITY_PATTERNS = re.compile(
        r"^("
        r"what can you (?:do|help with|assist with)[?!.]*|"
        r"what (?:do you|are you able to) (?:do|know|help with)[?!.]*|"
        r"how can you help(?:\s+me)?[?!.]*|"
        r"can you help(?:\s+me)?[?!.]*|"
        r"what(?:'s| is) your (?:purpose|function|capability|role)[?!.]*|"
        r"tell me (?:about yourself|what you can do)[?!.]*|"
        r"(?:help|assist) (?:me )?with what[?!.]*|"
        r"who are you[?!.]*"
        r")$",
        re.IGNORECASE,
    )

    # Greeting / conversational opener patterns
    GREETING_PATTERNS = re.compile(
        r"^(?:"
        r"hi|hello|hey|hii|hiii|namaste|namaskar|howdy|greetings|yo|hola|"
        r"good\s*(?:morning|afternoon|evening|day|night)"
        r")"
        r"(?:[,\s]+(?:there|all|team|bis\s*agent|agent|friend|assistant|good\s*(?:morning|afternoon|evening|day)))*"
        r"[\s!?.]*$",
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
    KNOWN_PRODUCTS: Dict[str, List[str]] = {
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
        "PROD-SOLAR-INVERTER": ["solar inverter", "pv inverter", "grid-tied inverter", "solar power conditioner"],
        "PROD-FIRE-EXTINGUISHER": ["fire extinguisher", "portable fire extinguisher", "abc extinguisher", "co2 fire extinguisher"],
        "PROD-AAC-BLOCKS": ["aac block", "aac blocks", "aerated concrete block", "cellular concrete block"],
        "PROD-DOMESTIC-LPG-STOVE": ["lpg stove", "gas stove", "gas cooktop", "lpg chulha", "domestic gas stove"],
        "PROD-UREA-FERTILIZER": ["urea", "urea fertilizer", "agricultural urea"],
        "PROD-SAFETY-SHOES": ["safety shoes", "safety boots", "steel toe shoes", "industrial safety footwear"],
        "PROD-CERAMIC-TILES": ["ceramic tiles", "vitrified tiles", "floor tiles", "wall tiles"],
        "PROD-SPLIT-AC": ["split ac", "split air conditioner", "inverter split ac", "air conditioner"],
        "PROD-SUBMERSIBLE-PUMP": ["submersible pump", "borewell pump", "agricultural pump"],
        "PROD-CORRUGATED-BOX": ["corrugated box", "cardboard box", "shipping carton"],
        "PROD-WRITING-PRINTING-PAPER": ["copier paper", "a4 paper", "printing paper", "photocopy paper"],
        "PROD-TOUGHENED-SAFETY-GLASS": ["toughened glass", "tempered glass", "safety glass", "architectural glass"],
        "PROD-SPORTS-FOOTWEAR": ["sports shoes", "running shoes", "athletic shoes", "sports footwear"],
    }

    PROD_TO_STD: Dict[str, str] = {
        "PROD-PRESSURE-COOKER": "IS 2347",
        "PROD-ELECTRIC-MIXER": "IS 4250",
        "PROD-PLUG-SOCKET": "IS 1293",
        "PROD-LED-LAMP": "IS 16102 (Part 1)",
        "PROD-TWO-WHEELER-HELMET": "IS 4151",
        "PROD-CEMENT-OPC": "IS 269",
        "PROD-PACKAGED-WATER": "IS 14543",
        "PROD-STRUCTURAL-STEEL": "IS 2062",
        "PROD-TMT-REBAR": "IS 1786",
        "PROD-SOLAR-INVERTER": "IS 16221 (Part 2)",
        "PROD-FIRE-EXTINGUISHER": "IS 15683",
        "PROD-AAC-BLOCKS": "IS 2185 (Part 3)",
        "PROD-DOMESTIC-LPG-STOVE": "IS 4246",
        "PROD-UREA-FERTILIZER": "IS 540",
        "PROD-SAFETY-SHOES": "IS 15298 (Part 2)",
        "PROD-CERAMIC-TILES": "IS 15622",
        "PROD-SPLIT-AC": "IS 1391 (Part 2)",
        "PROD-SUBMERSIBLE-PUMP": "IS 14220",
        "PROD-CORRUGATED-BOX": "IS 2771 (Part 1)",
        "PROD-WRITING-PRINTING-PAPER": "IS 1848",
        "PROD-TOUGHENED-SAFETY-GLASS": "IS 2553 (Part 1)",
        "PROD-SPORTS-FOOTWEAR": "IS 15844 (Part 1)",
    }

    def __init__(self):
        """Initialize catalog and load all products and standards dynamically."""
        self._load_full_catalog()

    def _load_full_catalog(self) -> None:
        """Dynamically load products from JSON datasets into catalog."""
        try:
            from pathlib import Path
            import json
            for candidate in [
                Path(__file__).resolve().parent.parent.parent.parent / "rag" / "data" / "products.json",
                Path.cwd() / "rag" / "data" / "products.json",
                Path.cwd().parent / "rag" / "data" / "products.json",
            ]:
                if candidate.exists():
                    with open(candidate, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for item in data:
                            p_id = item["id"]
                            aliases = list(item.get("aliases", []))
                            p_name = item.get("product_name", "")
                            if p_name and p_name.lower() not in [a.lower() for a in aliases]:
                                aliases.append(p_name.lower())
                            if p_id not in self.KNOWN_PRODUCTS:
                                self.KNOWN_PRODUCTS[p_id] = aliases
                            else:
                                for a in aliases:
                                    if a.lower() not in [x.lower() for x in self.KNOWN_PRODUCTS[p_id]]:
                                        self.KNOWN_PRODUCTS[p_id].append(a)
                            app_stds = item.get("applicable_is_numbers", [])
                            if app_stds and p_id not in self.PROD_TO_STD:
                                is_clean = re.sub(r"\s*:\s*\d{4}", "", app_stds[0]).strip()
                                self.PROD_TO_STD[p_id] = is_clean
                    break
        except Exception:
            pass

    def _extract_entities_from_context(self, context: List[ConversationTurn]) -> Dict[str, Any]:
        """Scan recent conversation context turns in reverse to extract active entities."""
        inherited: Dict[str, Any] = {}
        for turn in reversed(context):
            content = turn.content
            content_lower = content.lower()

            # Inherit IS number if not yet found
            if "is_number" not in inherited:
                is_matches = self.IS_PATTERN.findall(content)
                if is_matches:
                    inherited["is_number"] = re.sub(r"\s+", " ", is_matches[0]).strip()

            # Inherit product if not yet found
            if "product_id" not in inherited:
                for prod_id, aliases in self.KNOWN_PRODUCTS.items():
                    for alias in aliases:
                        pattern = rf"\b{re.escape(alias)}s?\b"
                        if re.search(pattern, content_lower):
                            inherited["product_id"] = prod_id
                            inherited["product_name"] = alias
                            break
                    if "product_id" in inherited:
                        break

            # Inherit certification scheme if found in context
            if "certification_scheme" not in inherited:
                if "scheme 1" in content_lower or "scheme i" in content_lower or "isi mark" in content_lower:
                    inherited["certification_scheme"] = "Scheme I (ISI Mark)"
                elif "scheme 2" in content_lower or "scheme ii" in content_lower or "crs" in content_lower:
                    inherited["certification_scheme"] = "Scheme II (Compulsory Registration Scheme - CRS)"

            if "is_number" in inherited and "product_id" in inherited:
                break

        return inherited

    def detect_intent(
        self,
        query: str,
        context: Optional[List[ConversationTurn]] = None,
    ) -> IntentResult:
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

        # ── 1. Entity Extraction from Current Query ───────────────────────────
        entities: Dict[str, Any] = {}

        # 1a. IS Numbers
        is_matches = self.IS_PATTERN.findall(clean_query)
        if is_matches:
            entities["is_number"] = re.sub(r"\s+", " ", is_matches[0]).strip()

        # 1b. Product matching
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

        # 1c. Multi-Turn Context Resolution ────────────────────────────────────
        # If user asks a follow-up ("Is it mandatory?", "Where can I test it?"),
        # inherit missing product and standard entities from prior context turns.
        if context:
            context_entities = self._extract_entities_from_context(context)
            if not entities.get("product_id") and "product_id" in context_entities:
                entities["product_id"] = context_entities["product_id"]
                entities["product_name"] = context_entities["product_name"]
                entities["inherited_from_context"] = True
                matched_prod_id = context_entities["product_id"]
                matched_prod_name = context_entities["product_name"]

            active_prod = entities.get("product_id")
            if not entities.get("is_number"):
                if active_prod and active_prod in self.PROD_TO_STD:
                    entities["is_number"] = self.PROD_TO_STD[active_prod]
                    entities["inherited_from_context"] = True
                elif "is_number" in context_entities:
                    entities["is_number"] = context_entities["is_number"]
                    entities["inherited_from_context"] = True
            if not entities.get("certification_scheme") and "certification_scheme" in context_entities:
                entities["certification_scheme"] = context_entities["certification_scheme"]

        # 1d. Certification Scheme
        if "scheme 1" in query_lower or "scheme i" in query_lower or "isi mark" in query_lower:
            entities["certification_scheme"] = "Scheme I (ISI Mark)"
        elif "scheme 2" in query_lower or "scheme ii" in query_lower or "crs" in query_lower:
            entities["certification_scheme"] = "Scheme II (Compulsory Registration Scheme - CRS)"
        elif "fmcs" in query_lower or "foreign manufacturer" in query_lower:
            entities["certification_scheme"] = "Foreign Manufacturers Certification Scheme (FMCS)"
        elif "hallmark" in query_lower:
            entities["certification_scheme"] = "Hallmarking Scheme"

        # 1e. Laboratory indicators
        if any(w in query_lower for w in ["lab", "laboratory", "testing"]):
            for lab_hint in ["cipet", "nth", "national test house", "central lab", "mumbai", "kolkata", "chennai"]:
                if lab_hint in query_lower:
                    entities["laboratory"] = lab_hint.upper()
                    break

        # Check if user is answering a prior clarification question
        is_answering_clarification = False
        if context:
            last_assistant_turn = next((t for t in reversed(context) if t.role == "assistant"), None)
            if last_assistant_turn and any(
                phrase in last_assistant_turn.content.lower()
                for phrase in ["what type", "tell me the product", "which product", "could you tell me", "are you looking for"]
            ):
                is_answering_clarification = True

        # ── 2. Underspecified BIS queries requiring clarification ─────────────
        # Only require clarification if product is NOT already known from query or context
        if not entities.get("product_id") and not is_answering_clarification:
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

        # ── 2e. Bare product with no intent context → natural clarification ───
        intent_signals = (
            self.QCO_KEYWORDS + self.LAB_KEYWORDS + self.SCHEME_KEYWORDS +
            self.CONSUMER_KEYWORDS + self.GENERAL_BIS_KEYWORDS +
            ["standard", "specification", "is number", "applies to", "apply", "rule",
             "how", "what", "which", "where", "why", "who", "tell", "explain",
             "require", "need", "mandatory", "test", "certif"]
        )
        has_intent_signals = any(sig in query_lower for sig in intent_signals)
        if matched_prod_name and not has_intent_signals and not entities.get("is_number") and not is_answering_clarification:
            if matched_prod_name == "cooker" or clean_query.lower().strip("?!. ") in ["cooker", "cookers"]:
                return IntentResult(
                    intent="PRODUCT_STANDARD_QUERY",
                    confidence=0.75,
                    entities={**entities, "clarification_options": ["Domestic pressure cooker", "Electric cooker", "Other"]},
                    clarification_required=True,
                    clarifying_question="Sure — I can help with that. What type of cooker do you mean?",
                )
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
        if self.GENERAL_INFORMATION_PATTERNS.match(clean_query):
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
