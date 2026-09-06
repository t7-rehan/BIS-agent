"""Response validation service ensuring anti-hallucination and evidence grounding."""

import logging
import re
from typing import Any, Dict, List, Set, Tuple

from app.models.schemas import EvidencePackage, LLMStructuredAnswer, SourceItem

logger = logging.getLogger(__name__)


class ResponseValidator:
    """Validates LLM-generated responses against the retrieved EvidencePackage."""

    IS_PATTERN = re.compile(r"\bIS(?:\s*/\s*IEC)?\s*\d+(?:\s*\(.*?\))?", re.IGNORECASE)
    MANDATORY_KEYWORDS = ["mandatory", "compulsory", "legally required", "must have isi mark", "strictly required"]

    def validate(
        self,
        llm_output: LLMStructuredAnswer,
        evidence: EvidencePackage,
    ) -> Tuple[LLMStructuredAnswer, List[SourceItem], List[str]]:
        """Validate LLM output against evidence, filter fabricated URLs, and attach warnings.
        
        Args:
            llm_output: Structured answer produced by the LLM.
            evidence: Evidence package supplied to the LLM.
            
        Returns:
            Tuple of (validated_llm_output, validated_sources, warnings)
        """
        warnings: List[str] = list(llm_output.warnings) if llm_output.warnings else []

        # 1. Ensure answer is not empty
        if not llm_output.answer or not llm_output.answer.strip():
            llm_output.answer = (
                "I could not locate sufficient official BIS evidence to answer your query. "
                "Please verify your product specifications directly on the official BIS portal (https://www.bis.gov.in)."
            )
            warnings.append("Original model response was empty; replaced with safe fallback.")

        # 2. Collect all legitimate URLs from evidence
        legitimate_sources: Dict[str, Dict[str, str]] = {}
        for src in evidence.sources:
            url = src.get("source_url", "")
            if url:
                legitimate_sources[url] = src

        # 3. Validate Sources (Filter fabricated URLs)
        validated_sources: List[SourceItem] = []
        for src_url, src_dict in legitimate_sources.items():
            validated_sources.append(
                SourceItem(
                    title=src_dict.get("source_title", "Official BIS Document"),
                    url=src_url,
                    source_type=src_dict.get("source_type", "GENERAL"),
                    is_number=src_dict.get("is_number"),
                )
            )

        # 4. Check for unsupported IS numbers in the answer
        mentioned_is_numbers = [
            re.sub(r"\s+", " ", m).strip() for m in self.IS_PATTERN.findall(llm_output.answer)
        ]

        evidence_text = (
            evidence.query + " "
            + json_dumps_safe(evidence.structured_facts) + " "
            + " ".join(c.get("text", "") for c in evidence.semantic_evidence)
        )
        evidence_text_lower = evidence_text.lower()

        for is_no in mentioned_is_numbers:
            # Check if main digits appear in evidence
            digits_match = re.search(r"\d+", is_no)
            if digits_match:
                digits = digits_match.group(0)
                if digits not in evidence_text_lower:
                    warnings.append(
                        f"Unverified standard citation: '{is_no}' was not found in retrieved official records."
                    )

        # 5. Check mandatory claims
        answer_lower = llm_output.answer.lower()
        claims_mandatory = any(kw in answer_lower for kw in self.MANDATORY_KEYWORDS)

        has_qco_evidence = bool(
            evidence.structured_facts.get("qcos")
            or any(c.get("document_type") == "qco" for c in evidence.semantic_evidence)
        )

        if claims_mandatory and not has_qco_evidence:
            warnings.append(
                "Regulatory Notice: Mandatory certification is claimed, but no specific Quality Control Order (QCO) "
                "was found in retrieved records. Mandatory compliance must be verified against official DPIIT/Ministry notifications."
            )

        # 6. Standard Disclaimer
        warnings.append(
            "Regulatory Disclaimer: Information is grounded in official BIS publications. "
            "Formal certification decisions require verification on the official BIS portal (https://www.bis.gov.in)."
        )

        # Remove duplicate warnings while preserving order
        unique_warnings = list(dict.fromkeys(warnings))

        return llm_output, validated_sources, unique_warnings


def json_dumps_safe(obj: Any) -> str:
    """Safe string serializer for evidence inspection."""
    try:
        import json
        return json.dumps(obj, default=str)
    except Exception:
        return str(obj)


response_validator = ResponseValidator()
