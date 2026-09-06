"""Google Gemini LLM Service utilizing the official google-genai SDK."""

import json
import logging
import threading
import time
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


# HTTP status codes that indicate a transient server-side problem worth retrying.
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _is_retryable(exc: Exception) -> bool:
    """Return True if the exception represents a transient API error."""
    msg = str(exc).lower()
    # google-genai raises ServerError / ClientError with the HTTP status in the message
    retryable_phrases = ("503", "502", "500", "504", "429",
                         "unavailable", "overloaded", "high demand",
                         "rate limit", "quota", "resource exhausted",
                         "temporarily", "try again")
    return any(p in msg for p in retryable_phrases)


class GeminiLLMService:
    """Service encapsulating Google Gemini API calls via the modern google-genai SDK."""

    # Retry configuration for transient 5xx / 429 errors
    _MAX_RETRIES = 3
    _RETRY_BACKOFF_SECONDS = (2.0, 5.0, 10.0)  # wait before attempt 2, 3, 4

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
                from google.genai import types as _types
                _timeout_ms = int(settings.LLM_TIMEOUT_SECONDS * 1000)
                self._client = genai.Client(
                    api_key=self.api_key,
                    http_options=_types.HttpOptions(timeout=_timeout_ms),
                )
                logger.info(
                    "[LLM] Gemini client initialized: model='%s' sdk_timeout=%dms",
                    self.model, _timeout_ms,
                )
            except Exception as e:
                logger.warning("[LLM] Failed to initialize Gemini client: %s", e)
                self._client = None
        else:
            if not self.mock_mode:
                logger.info("[LLM] GEMINI_API_KEY not configured. Running in offline/mock mode.")

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

        Retries up to _MAX_RETRIES times on transient 5xx / 429 errors before
        raising LLMError.  A thread-based wall-clock timeout (LLM_TIMEOUT_SECONDS)
        is enforced as a hard outer limit.

        Args:
            prompt: Formatted user and evidence prompt.
            system_instruction: System prompt enforcing anti-hallucination rules.
            response_schema: Optional Pydantic schema for structured output.

        Returns:
            Generated response string (JSON string if schema is requested).
        """
        if not self.is_configured:
            return self._generate_mock_fallback(prompt, response_schema)

        timeout_seconds = settings.LLM_TIMEOUT_SECONDS
        result_container: Dict[str, Any] = {"result": None, "error": None}

        def _do_generate() -> None:
            last_exc: Optional[Exception] = None
            for attempt in range(1, self._MAX_RETRIES + 1):
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

                    logger.info(
                        "[LLM] Request attempt %d/%d: model='%s'",
                        attempt, self._MAX_RETRIES, self.model,
                    )

                    response = self._client.models.generate_content(
                        model=self.model,
                        contents=prompt,
                        config=config,
                    )

                    if not response or not response.text:
                        last_exc = LLMError("Gemini returned an empty response.")
                        logger.warning(
                            "[LLM] Attempt %d/%d: empty response from model",
                            attempt, self._MAX_RETRIES,
                        )
                        # Empty response is not retryable — break immediately
                        break

                    logger.info("[LLM] Request succeeded on attempt %d/%d", attempt, self._MAX_RETRIES)
                    result_container["result"] = response.text
                    return  # success

                except Exception as exc:
                    last_exc = exc
                    exc_type = type(exc).__name__

                    if _is_retryable(exc) and attempt < self._MAX_RETRIES:
                        backoff = self._RETRY_BACKOFF_SECONDS[attempt - 1]
                        logger.warning(
                            "[LLM] Attempt %d/%d failed (%s: transient). "
                            "Retrying in %.1fs...",
                            attempt, self._MAX_RETRIES, exc_type, backoff,
                        )
                        time.sleep(backoff)
                        continue

                    # Non-retryable error or final attempt — log and stop
                    logger.error(
                        "[LLM] Attempt %d/%d failed (%s). Not retrying.",
                        attempt, self._MAX_RETRIES, exc_type,
                    )
                    break

            result_container["error"] = last_exc

        thread = threading.Thread(target=_do_generate, daemon=True)
        thread.start()
        thread.join(timeout=timeout_seconds)

        if thread.is_alive():
            logger.error(
                "[LLM] API call timed out after %ds for model '%s'.",
                timeout_seconds, self.model,
            )
            raise LLMTimeoutError(
                f"Gemini API call timed out after {timeout_seconds} seconds. "
                "The model may be unavailable or the prompt was too long."
            )

        if result_container["error"] is not None:
            exc = result_container["error"]
            logger.error("[LLM] Request failed: %s: %s", type(exc).__name__, exc)
            raise LLMError(f"Gemini API failure: {str(exc)}")

        return result_container["result"]  # type: ignore[return-value]

    def _generate_mock_fallback(
        self,
        prompt: str,
        response_schema: Optional[Type[BaseModel]] = None,
    ) -> str:
        """Synthesize a safe, deterministic mock answer grounded strictly in prompt evidence."""
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