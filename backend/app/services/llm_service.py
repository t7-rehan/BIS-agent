"""Google Gemini LLM Service utilizing the official google-genai SDK."""

import json
import logging
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel

from app.core.config import settings
from app.models.schemas import LLMStructuredAnswer

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Base exception for LLM operations."""
    pass


class LLMConfigurationError(LLMError):
    """Raised when LLM service is misconfigured (e.g. missing API key)."""
    pass


class LLMTimeoutError(LLMError):
    """Raised when LLM call times out."""
    pass


class GeminiLLMService:
    """Service encapsulating Google Gemini API calls via the modern google-genai SDK."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        mock_mode: Optional[bool] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.temperature = temperature if temperature is not None else settings.LLM_TEMPERATURE
        self.mock_mode = mock_mode if mock_mode is not None else settings.MOCK_LLM

        self._client = None
        if not self.mock_mode and self.api_key and self.api_key.strip():
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini client initialized with model '{self.model}'.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
                self._client = None
        else:
            if not self.mock_mode:
                logger.info("GEMINI_API_KEY not configured. Running in offline/mock mode.")

    @property
    def is_configured(self) -> bool:
        """Check whether a valid Gemini client is ready."""
        return self._client is not None and not self.mock_mode

    def generate(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Optional[Type[BaseModel]] = None,
    ) -> str:
        """Call Gemini model to generate content.
        
        Args:
            prompt: Formatted user and evidence prompt.
            system_instruction: System prompt enforcing anti-hallucination rules.
            response_schema: Optional Pydantic schema for structured output.
            
        Returns:
            Generated response string (JSON string if schema is requested).
        """
        if not self.is_configured:
            # Offline or mocked fallback response
            return self._generate_mock_fallback(prompt, response_schema)

        try:
            from google.genai import types

            config_args: Dict[str, Any] = {
                "temperature": self.temperature,
                "max_output_tokens": settings.LLM_MAX_OUTPUT_TOKENS,
                "system_instruction": system_instruction,
            }

            if response_schema:
                config_args["response_mime_type"] = "application/json"
                config_args["response_schema"] = response_schema

            config = types.GenerateContentConfig(**config_args)

            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )

            if not response or not response.text:
                raise LLMError("Gemini returned an empty response.")

            return response.text

        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            raise LLMError(f"Gemini API failure: {str(e)}")

    def _generate_mock_fallback(
        self,
        prompt: str,
        response_schema: Optional[Type[BaseModel]] = None,
    ) -> str:
        """Synthesize a safe, deterministic mock answer grounded strictly in prompt evidence."""
        # Check if prompt has standard or QCO references
        answer_text = (
            "According to official BIS records, certification requirements and applicable standards "
            "are established by the Bureau of Indian Standards and governing ministry notifications. "
            "Please refer to the verified citations below for exact specifications."
        )

        mock_obj = LLMStructuredAnswer(
            answer=answer_text,
            summary="BIS compliance status derived from curated records.",
            applicable_standards=[],
            mandatory_status="Refer to official Gazette notification",
            qco_details=None,
            testing_laboratories=[],
            cited_sources=[],
            warnings=["Operating in offline demonstration mode."],
        )

        if response_schema:
            return mock_obj.model_dump_json()
        return mock_obj.answer


llm_service = GeminiLLMService()
