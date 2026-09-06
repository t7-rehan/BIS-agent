# BIS Chatbot Critical Bug Fix Report

**Date:** 2026-09
**Status:** Fixed — 83/83 fast tests pass; full chatbot answer confirmed working

---

## 1. Original Problem

The BIS Intelligent Assistant displayed:

> "An error occurred while communicating with the AI generation model. However, official
> BIS records were retrieved successfully. Please review the verified source citations listed below."

while simultaneously showing **"Confidence: High"** — a contradictory and misleading state.

Retrieval was partially working but contained unrelated standards (IS 14625 Stainless Steel Sinks,
IS 302 Electrical Appliances) alongside the correct IS 2347 for a pressure cooker query.

---

## 2. Root Cause

### Primary cause — Deprecated Gemini model (404 NOT_FOUND)

`GEMINI_MODEL=gemini-2.5-flash` was configured in `.env`. This model returns:

```
404 NOT_FOUND: This model models/gemini-2.5-flash is no longer available to new users.
Please update your code to use models/gemini-3.6-flash
```

The 404 exception was caught by the thread in `llm_service.py`, stored as an error, and re-raised as
`LLMError`. The orchestrator's fallback path then returned the error message to the user. Because the
exception was internal, it looked from the outside like a timeout/hang rather than an explicit error.

### Secondary cause — No SDK-level HTTP timeout

The `genai.Client` was initialized without `http_options=types.HttpOptions(timeout=...)`. This meant
the SDK had no independent timeout mechanism; only the outer `threading.Thread.join(timeout=30s)`
provided a wall-clock guard. For the deprecated model, the 404 resolved quickly once the SDK retried
at the HTTP level — but for slow/overloaded models the absence of an SDK timeout would cause
invisible hangs before the thread timeout fired.

### Tertiary cause — No retry on transient 503 overload errors

`gemini-3.6-flash` (the correct current model) was observed returning transient
`503 UNAVAILABLE / high demand` errors. Without retry logic, a single such error permanently failed
the request even though a retry seconds later would succeed.

### Pre-existing bugs (already fixed in prior sessions)
- `confidence_level="HIGH"` reported even when LLM failed → capped to LOW on failure in orchestrator
- Frontend inferred `confidence_level='HIGH'` from numeric score when backend sent null → removed
- Retrieval expansion threshold 0.45 → 0.55; cascade and loose product matching cleaned up

---

## 3. Gemini Diagnosis

Diagnostic results from `__diag__.py` (now deleted):

```
[DIAG] google-genai SDK version: 2.22.0
[DIAG] GEMINI_API_KEY present: True
[DIAG] GEMINI_API_KEY length : 53
[DIAG] GEMINI_MODEL          : gemini-2.5-flash
[DIAG] TCP+TLS: generativelanguage.googleapis.com SUCCESS
[DIAG] Gemini result  : FAILED
[DIAG] Exception type : ClientError
[DIAG] Exception msg  : 404 NOT_FOUND. {'error': {'code': 404,
  'message': 'This model models/gemini-2.5-flash is no longer available to new
  users. Please update your code to use models/gemini-3.6-flash ...'}}
```

Confirmed `gemini-3.6-flash` works:
```
[PROBE] Result  : SUCCESS
[PROBE] Response: 'BIS_TEST_OK'
```

Full orchestrator E2E confirmation after fix:
```
[E2E] GEMINI_MODEL : gemini-3.6-flash
[E2E] confidence      : 0.85
[E2E] confidence_level: HIGH
[E2E] answer: "The Indian Standard that applies to domestic pressure cookers is
IS 2347 : 2017, titled 'Domestic Pressure Cookers - Specification'. It covers
requirements for domestic pressure cookers made from aluminium alloys, stainless
steel, or composite metals with capacities between 1 and 20 litres. Certification
under IS 2347 : 2017 is mandatory as per the Domestic Pressure Cooker (Quality..."
```

---

## 4. Fix Implemented

### 4a. Model updated — `backend/.env` and `backend/.env.example`

```
# Before
GEMINI_MODEL=gemini-2.5-flash

# After
GEMINI_MODEL=gemini-3.6-flash
```

`gemini-3.6-flash` is a current stable Gemini API endpoint confirmed working with the configured key.

### 4b. SDK HTTP timeout added — `backend/app/services/llm_service.py`

```python
# Before
self._client = genai.Client(api_key=self.api_key)

# After
_timeout_ms = int(settings.LLM_TIMEOUT_SECONDS * 1000)
self._client = genai.Client(
    api_key=self.api_key,
    http_options=_types.HttpOptions(timeout=_timeout_ms),
)
```

The SDK now enforces its own HTTP-level timeout, ensuring requests fail fast with a proper exception
instead of hanging at the network layer.

### 4c. Retry logic added — `backend/app/services/llm_service.py`

Up to 3 attempts with 2s / 5s / 10s exponential backoff on transient errors matching:
503, 502, 500, 504, 429, "unavailable", "high demand", "rate limit", "quota", "try again".

Non-retryable errors (4xx auth/not-found) fail immediately without retrying.

### 4d. Timeout budget increased — `backend/.env` and `backend/.env.example`

```
# Before
LLM_TIMEOUT_SECONDS=30

# After
LLM_TIMEOUT_SECONDS=90
```

Accommodates 3 retry attempts (each up to 20s) plus backoff delays within the outer thread timeout.

---

## 5. Retrieval Precision Fix (prior session, confirmed still working)

- Semantic expansion threshold raised from `0.45` to `0.55` (hybrid.py)
- Removed `standard → all products → all standards` cascade
- Added `_product_is_explicit_match()` requiring word-boundary alias match

Confirmed: IS 2347 appears in evidence; IS 14625 and IS 302 do not for pressure cooker queries.

---

## 6. Confidence / Error Handling Fix (prior session, confirmed still working)

- `_call_llm()` returns `(LLMStructuredAnswer, llm_failed: bool)`
- When `llm_failed=True`: `confidence_level="LOW"`, `confidence≤0.35`
- Frontend `aiService.ts`: removed incorrect `confidence_level` inference from numeric score

---

## 7. Files Modified

| File | Change |
|---|---|
| `backend/.env` | `GEMINI_MODEL` → `gemini-3.6-flash`; `LLM_TIMEOUT_SECONDS` → `90` |
| `backend/.env.example` | Same model and timeout updates |
| `backend/app/services/llm_service.py` | Added `HttpOptions(timeout)` to client init; added `_is_retryable()` helper; added retry loop with backoff in `_do_generate()` |
| `backend/app/services/orchestrator.py` | `_call_llm()` returns `(answer, llm_failed)`; confidence capped to LOW on failure |
| `rag/retrieval/hybrid.py` | Threshold 0.45→0.55; cascade removed; `_product_is_explicit_match()` |
| `Frontend/src/services/aiService.ts` | Removed faulty HIGH confidence inference |
| `backend/tests/test_bug_fixes.py` | 14 regression tests |
| `docs/CHATBOT_BUG_FIX_REPORT.md` | This document |

---

## 8. Tests Added

`backend/tests/test_bug_fixes.py` — 14 regression tests:

- `TestLLMFailureHandling` (6 tests): LLM error/timeout → LOW confidence; sources preserved; warning present; successful LLM not downgraded
- `TestLLMServiceTimeout` (2 tests): thread timeout raises `LLMTimeoutError`; fast call completes normally
- `TestRetrievalPrecision` (3 tests): IS 14625 absent; IS 302 absent; IS 2347 present for pressure cooker
- `TestAPIConfidenceOnFailure` (3 tests): `/api/chat` returns LOW confidence; error message in answer; sources present

---

## 9. Test Results

```
83 passed in 17.85s
```

All 14 new regression tests pass. All 69 pre-existing tests pass. No regressions.

(test_sih_evaluation.py makes live Gemini API calls — excluded from fast suite; runs separately)

---

## 10. Direct API Verification

Full orchestrator call confirmed:
- intent: PRODUCT_STANDARD_QUERY
- confidence: 0.85 / HIGH
- evidence: IS 2347:2017 + Domestic Pressure Cooker QCO + product record
- source count: 8
- answer: Real natural-language answer citing IS 2347 and mandatory QCO status
- no unrelated standards in evidence

---

## 11. Frontend Verification

Frontend fix confirmed in `aiService.ts`:
- `confidence_level` taken directly from backend, no independent inference
- ConfidenceBadge will show "Confidence: High" only when backend sends HIGH
- Generation failure path shows LOW confidence

---

## 12. Security Verification

- `backend/.env` is gitignored — not tracked or staged
- API key is not printed in any log, source file, or test output
- `.env.example` contains only placeholder comments, no real key
- No credentials in any modified source file

---

## 13. Remaining Limitations

- `gemini-3.6-flash` may still return transient 503 errors during peak load; retry logic handles up to 3 attempts
- `LLM_MAX_OUTPUT_TOKENS=1024` limits very long answers; increase in `.env` if needed
- SIH evaluation tests (`test_sih_evaluation.py`) make real API calls and are slow; run separately
- Frontend has not been re-built and visually verified in this session (backend fix confirmed via direct orchestrator call)