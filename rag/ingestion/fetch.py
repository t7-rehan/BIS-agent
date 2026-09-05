"""Safe and polite document fetcher for official BIS sources."""

import hashlib
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

DEFAULT_USER_AGENT = "BIS-Intelligent-Assistant-Bot/0.1 (Research & Compliance Assistant Prototype; +https://www.bis.gov.in)"
DEFAULT_TIMEOUT = 15.0
MAX_RETRIES = 3
DEFAULT_CACHE_DIR = Path(__file__).resolve().parent.parent / "raw"


@dataclass
class FetchResult:
    """Structured result of an official document fetch attempt."""

    url: str
    status_code: int
    success: bool
    content_type: str
    content: bytes
    retrieved_at: str
    cached_path: Optional[str] = None
    error: Optional[str] = None


def fetch_document(
    url: str,
    cache_dir: Optional[Path] = None,
    use_cache: bool = True,
    timeout: float = DEFAULT_TIMEOUT,
    retries: int = MAX_RETRIES,
) -> FetchResult:
    """Fetch an official document via HTTP with retries, caching, and error resilience.

    Args:
        url: The official source URL to fetch.
        cache_dir: Directory where raw content should be cached.
        use_cache: If True, returns previously cached file if available.
        timeout: Network socket timeout in seconds.
        retries: Maximum retry attempts for transient errors.

    Returns:
        FetchResult: Complete metadata and raw bytes or error details.
    """
    target_cache_dir = cache_dir or DEFAULT_CACHE_DIR
    target_cache_dir.mkdir(parents=True, exist_ok=True)

    # Generate deterministic cache filename based on SHA256 of URL
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
    # Simple extension deduction
    ext = ".html"
    if url.lower().endswith(".pdf"):
        ext = ".pdf"
    elif url.lower().endswith(".json"):
        ext = ".json"

    cache_file = target_cache_dir / f"{url_hash}{ext}"

    if use_cache and cache_file.exists():
        logger.info("Serving document from cache: %s (%s)", cache_file.name, url)
        try:
            cached_bytes = cache_file.read_bytes()
            return FetchResult(
                url=url,
                status_code=200,
                success=True,
                content_type="application/pdf" if ext == ".pdf" else "text/html",
                content=cached_bytes,
                retrieved_at=datetime.fromtimestamp(cache_file.stat().st_mtime, timezone.utc).isoformat(),
                cached_path=str(cache_file),
            )
        except Exception as e:
            logger.warning("Failed to read cache file %s: %s. Re-fetching from network.", cache_file, e)

    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/pdf,application/json;q=0.9,*/*;q=0.8",
    }

    req = urllib.request.Request(url, headers=headers)
    last_error = None
    retrieved_time = datetime.now(timezone.utc).isoformat()

    for attempt in range(1, retries + 1):
        try:
            logger.info("Fetching [%s] (Attempt %d/%d)...", url, attempt, retries)
            with urllib.request.urlopen(req, timeout=timeout) as response:
                status_code = response.status
                content_type = response.headers.get_content_type() or "application/octet-stream"
                content = response.read()

                # Cache raw content
                try:
                    cache_file.write_bytes(content)
                    cached_path = str(cache_file)
                except Exception as write_err:
                    logger.warning("Failed to write cache file %s: %s", cache_file, write_err)
                    cached_path = None

                return FetchResult(
                    url=url,
                    status_code=status_code,
                    success=True,
                    content_type=content_type,
                    content=content,
                    retrieved_at=retrieved_time,
                    cached_path=cached_path,
                )
        except urllib.error.HTTPError as http_err:
            last_error = f"HTTP {http_err.code}: {http_err.reason}"
            logger.warning("HTTP error fetching %s: %s", url, last_error)
            if 400 <= http_err.code < 500:
                # Do not retry client errors (403, 404, etc.)
                return FetchResult(
                    url=url,
                    status_code=http_err.code,
                    success=False,
                    content_type="text/plain",
                    content=b"",
                    retrieved_at=retrieved_time,
                    error=last_error,
                )
        except urllib.error.URLError as url_err:
            last_error = f"Network URL Error: {url_err.reason}"
            logger.warning("URL error on attempt %d: %s", attempt, last_error)
        except Exception as exc:
            last_error = f"Unexpected error: {str(exc)}"
            logger.warning("Unexpected error on attempt %d: %s", attempt, last_error)

        if attempt < retries:
            time.sleep(1.0 * attempt)

    return FetchResult(
        url=url,
        status_code=0,
        success=False,
        content_type="text/plain",
        content=b"",
        retrieved_at=retrieved_time,
        error=last_error,
    )
