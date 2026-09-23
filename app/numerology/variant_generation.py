import asyncio
import difflib
import logging
from typing import List, Dict, Any, Optional

from app.numerology.calculations import calculate_name_number
from app.numerology.suitability import check_suitability
from app.numerology.phonetics import generate_phonetic_variants
from app.numerology.gemini_client import get_gemini_name_variants
from app.numerology.linguistic_validation import validate_candidate_name, levenshtein_distance

logger = logging.getLogger(__name__)

def generate_diff_html(original: str, variant: str) -> str:
    """
    Generates inline HTML diff showing what changed in the spelling variant.
    Deletions are shown with a strikethrough so the user can clearly see
    that a letter was removed (e.g. RISAV vs RISHAV — the H is visibly crossed out).
    """
    matcher = difflib.SequenceMatcher(None, original.upper(), variant.upper())
    result_parts = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            result_parts.append(variant[j1:j2])
        elif tag == 'insert':
            result_parts.append(f"<span class='diff-add'>{variant[j1:j2]}</span>")
        elif tag == 'replace':
            result_parts.append(f"<span class='diff-mod'>{variant[j1:j2]}</span>")
        elif tag == 'delete':
            # Show deleted letters as strikethrough so users can clearly tell
            # e.g. RISAV is not the same as RISHAV -- the H must be visible.
            result_parts.append(f"<span class='diff-del'>{original[i1:i2]}</span>")
    return "".join(result_parts)

async def generate_and_rank_variants(
    original_name: str,
    dob: str,
    gender: Optional[str] = None,
    min_results: int = 3,
    max_results: int = 5
) -> Dict[str, Any]:
    """
    Strict two-stage pipeline:
    Stage A (Linguistic Generation & Hard Validation):
      - Generate candidate spellings (Gemini AI + local phonetic engine).
      - Apply hard linguistic validation (preserves name identity, phonetics, word count, surname, edit distance <= 2).
      - Discard any artificial / invalid spellings (e.g. 'Prieyangshu') BEFORE numerology scoring.

    Stage B (Deterministic Numerology Calculation & Ranking):
      - Independently calculate Chaldean compound & root numbers.
      - Evaluate Driver & Conductor harmonic compatibility.
      - Filter against target root recommendations.
      - Rank candidates by Tier weight, edit distance, and linguistic naturalness.
    """
    clean_original = original_name.strip().upper()
    
    # 1. Evaluate original name baseline to determine target recommendations
    original_eval = check_suitability(clean_original, dob, gender=gender)
    matrix_recs = original_eval.get("matrix_recommendations", [])
    good_best = original_eval.get("driver_details", {}).get("good_best_numbers", [])
    target_root = ", ".join(str(x) for x in matrix_recs) if matrix_recs else (
        ", ".join(str(x) for x in good_best) if good_best else "Any auspicious root"
    )

    # 2. Fetch Gemini AI candidates and local phonetic candidates concurrently
    local_candidates = generate_phonetic_variants(clean_original, max_total=30)
    ai_candidates = []
    try:
        ai_candidates = await asyncio.wait_for(
            get_gemini_name_variants(
                clean_original,
                target_root_number=target_root,
                gender=gender,
                n=8,
                timeout_sec=14.0,
            ),
            timeout=16.0   # fast hard cap so response returns quickly
        )
    except asyncio.TimeoutError:
        logger.warning("Gemini AI call timed out (16s cap). Continuing with local engine.")
        ai_candidates = []
    except Exception as exc:
        logger.warning("Gemini AI variant generation skipped: %s", exc)
        ai_candidates = []

    # 3. Linguistic Validation Filter (Stage A)
    # Reject invalid/artificial candidates (e.g. mutated surnames, unnatural clusters)
    valid_candidates_set = set()
    rejected_log = []

    for name in ai_candidates + local_candidates:
        cand = name.strip().upper()
        if not cand or cand == clean_original or len(cand) < 2:
            continue

        val_result = validate_candidate_name(clean_original, cand)
        if not val_result["is_valid"]:
            rejected_log.append((cand, val_result["reason"]))
            continue

        valid_candidates_set.add(cand)

    if rejected_log:
        logger.info(
            "Linguistic validator rejected %d candidate(s): %s",
            len(rejected_log), rejected_log[:10]
        )

    # 4. Deterministic Numerology Calculation & Scoring (Stage B)
    tier_priority = {
        "excellent": 3,
        "good": 2,
        "neutral": 1,
        "poor": 0
    }
    
    scored_candidates = []
    for cand in valid_candidates_set:
        eval_res = check_suitability(cand, dob, gender=gender)
        tier = eval_res["suitability"]["tier"]
        
        # NEVER suggest poor (enemy) numbers
        if tier == "poor":
            continue
            
        dist = levenshtein_distance(clean_original, cand)
        
        scored_candidates.append({
            "name": cand,
            "display_diff_html": generate_diff_html(clean_original, cand),
            "edit_distance": dist,
            "compound_number": eval_res["name_details"]["compound_number"],
            "root_number": eval_res["name_details"]["root_number"],
            # Debug: full per-letter breakdown for auditability
            "letter_values": [
                [item["char"], item["value"]]
                for item in eval_res["name_details"]["letter_breakdown"]
            ],
            "tier": tier,
            "stars": eval_res["suitability"]["stars"],
            "status_label": eval_res["suitability"]["status_label"],
            "reason": eval_res["suitability"]["reason"],
            "word_breakdowns": eval_res["name_details"]["word_breakdowns"],
            "tier_weight": tier_priority.get(tier, 0),
            "linguistic_validity": "Valid natural spelling"
        })
        
    # Sort candidates:
    # 1. Higher tier weight first (5★ > 4★ > 3★)
    # 2. Lower edit distance from original
    # 3. Lower length delta
    scored_candidates.sort(key=lambda x: (-x["tier_weight"], x["edit_distance"], abs(len(x["name"]) - len(clean_original))))
    
    # 5. Select only the BEST suggestions (strictly 3 to 5 names):
    # Only "excellent" (5★ peak harmonic matrix vibration) and "good" (4★ auspicious/friendly) are considered.
    # Non-peak / neutral (3★) are used ONLY as fallback if no excellent or good candidates exist at all.
    # Poor (enemy) candidates are NEVER included under any circumstances.
    best_candidates = [c for c in scored_candidates if c["tier"] in ["excellent", "good"]]
    
    # Prioritize 'excellent' (5★) candidates
    excellent_cands = [c for c in best_candidates if c["tier"] == "excellent"]
    good_cands = [c for c in best_candidates if c["tier"] == "good"]
    
    # Cap target between min_results (3) and max_results (hard capped at 5)
    effective_max = min(max_results if max_results and max_results > 0 else 5, 5)
    
    if len(excellent_cands) >= min_results:
        # If we have 3 or more 5-star excellent candidates, return only the 5-star names (up to effective_max)
        top_suggestions = excellent_cands[:effective_max]
    elif best_candidates:
        # If we have any excellent or good candidates, return only those best candidates (capped at effective_max)
        top_suggestions = (excellent_cands + good_cands)[:effective_max]
    else:
        # Fallback only when zero excellent or good candidates exist: top neutrals capped at effective_max
        neutrals = [c for c in scored_candidates if c["tier"] == "neutral"]
        top_suggestions = neutrals[:effective_max]
        
    return {
        "original_name": clean_original,
        "original_evaluation": original_eval,
        "total_candidates_analyzed": len(valid_candidates_set),
        "suggestions": top_suggestions
    }

