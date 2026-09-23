import asyncio
import json
import logging
import re
from typing import List, Optional, Any, Dict
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Timeout budget breakdown
#   connect : time to establish connection
#   read    : time to receive response body
#   write   : time to send request payload
#   pool    : time waiting for connection from pool
# ---------------------------------------------------------------------------
_GEMINI_TIMEOUT = httpx.Timeout(
    connect=3.0,
    read=8.0,
    write=5.0,
    pool=3.0,
)

_MAX_RETRIES = 1
_RETRY_DELAY = 1.0


def _build_strict_prompt(name: str, target_root_number: Optional[Any] = None) -> str:
    target_str = str(target_root_number) if target_root_number is not None else "Any auspicious root"

    return f"""You are a strict phonetic name spelling variant generator.
Given the original name '{name}', generate 5 to 8 natural English phonetic spelling or transliteration variants.

STRICT RULES:
1. Preserve exact pronunciation, identity, and word count.
2. Surname must remain identical unless a standard real-world transliteration variant exists.
3. Minimal modifications (1 to 2 characters max; e.g., vowel doubling/alternation like 'a' -> 'aa', 'v' -> 'w' or 'bh', 'i' -> 'ee'/'y').
4. NEVER insert random, unexplained, or artificial letters (no 'x', 'q', 'z', repeated consonants like 'vvv' or 'kkk').
5. Output must look natural on legal documents, business cards, and social profiles.
6. Target root filter is '{target_str}' (downstream backend calculates numerology; do not calculate or output numbers).

OUTPUT FORMAT:
Return valid JSON ONLY (no markdown, no code fences, no explanations):
{{"candidates": ["NAME 1", "NAME 2", "NAME 3", "NAME 4", "NAME 5"]}}"""


def _parse_candidate_json(raw_text: str) -> List[str]:
    """Extracts uppercase name candidate strings from LLM output."""
    if not raw_text:
        return []

    cleaned = re.sub(r"^```json\s*", "", raw_text, flags=re.IGNORECASE)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    try:
        parsed = json.loads(cleaned)
    except Exception:
        return []

    candidates_list = []
    if isinstance(parsed, dict) and "candidates" in parsed:
        raw_cands = parsed["candidates"]
        if isinstance(raw_cands, list):
            for item in raw_cands:
                if isinstance(item, dict) and "name" in item and item["name"]:
                    candidates_list.append(str(item["name"]).strip().upper())
                elif isinstance(item, str) and item.strip():
                    candidates_list.append(item.strip().upper())
    elif isinstance(parsed, list):
        for item in parsed:
            if isinstance(item, dict) and "name" in item and item["name"]:
                candidates_list.append(str(item["name"]).strip().upper())
            elif isinstance(item, str) and item.strip():
                candidates_list.append(item.strip().upper())

    return candidates_list


async def get_gemini_name_variants(
    name: str,
    target_root_number: Optional[Any] = None,
    gender: Optional[str] = None,
    n: int = 8,
    timeout_sec: float = 7.0,
) -> List[str]:
    """
    Calls the Google Gemini API to generate phonetically identical
    spelling variants under optimal settings (strict prompt, JSON mode, resilient model fallback).
    Returns a clean list of candidate name strings with minimal token usage.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured. Skipping Gemini variant generation.")
        return []

    prompt = _build_strict_prompt(name, target_root_number=target_root_number)

    # Candidate models to try in order of preference:
    # 1. Primary model configured in .env (GEMINI_MODEL)
    # 2. Resilient fast flash models
    models_to_try = [settings.GEMINI_MODEL] if settings.GEMINI_MODEL else []
    for fallback in ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash"]:
        if fallback and fallback not in models_to_try:
            models_to_try.append(fallback)

    effective_timeout = httpx.Timeout(
        connect=_GEMINI_TIMEOUT.connect,
        read=max(timeout_sec, 5.0),
        write=_GEMINI_TIMEOUT.write,
        pool=_GEMINI_TIMEOUT.pool,
    )

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.GEMINI_API_KEY,
    }
    payload = {
        "systemInstruction": {
            "parts": [
                {"text": prompt}
            ]
        },
        "contents": [
            {
                "parts": [
                    {"text": f"Generate plausible phonetic spelling variants for '{name}'."}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800,
            "thinkingConfig": {
                "thinkingBudget": 0
            },
            "responseMimeType": "application/json",
        }
    }

    for model_name in models_to_try:
        url = f"{settings.GEMINI_BASE_URL.rstrip('/')}/models/{model_name}:generateContent"
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(timeout=effective_timeout) as client:
                    response = await client.post(url, headers=headers, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    candidates_data = data.get("candidates", [])
                    if candidates_data:
                        parts = candidates_data[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "")
                            logger.info("Gemini (%s) raw text: %s", model_name, raw_text)
                            result = _parse_candidate_json(raw_text)
                            if result:
                                logger.info("Gemini (%s) generated %d candidate(s)", model_name, len(result))
                                return result
                            else:
                                logger.warning("Gemini (%s) JSON parsing returned empty list for text: %s", model_name, raw_text)
                        else:
                            finish_reason = candidates_data[0].get("finishReason")
                            logger.warning("Gemini (%s) returned no parts, finishReason: %s", model_name, finish_reason)
                    break

                # If non-200 (503 demand spike, 404 not found, 429 rate limit, etc.)
                logger.warning(
                    "Gemini API model %s returned status %d (%s). Falling back to next model...",
                    model_name, response.status_code, response.text[:120]
                )
                break  # Proceed to try the next model in models_to_try

            except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.ConnectError) as exc:
                if attempt < _MAX_RETRIES:
                    logger.warning(
                        "Gemini API transient error (%s) on model %s attempt %d/%d. Retrying...",
                        type(exc).__name__, model_name, attempt, _MAX_RETRIES
                    )
                    await asyncio.sleep(_RETRY_DELAY)
                else:
                    logger.warning(
                        "Gemini API timed out on model %s. Trying next fallback model...",
                        model_name
                    )
                    break

            except Exception as exc:
                logger.warning("Gemini API error on model %s: %s. Trying next model...", model_name, exc)
                break

    logger.warning("All Gemini API models exhausted. Relying on local phonetic engine.")
    return []

