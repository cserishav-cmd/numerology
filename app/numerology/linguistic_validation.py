import re
from typing import Dict, Any, Tuple, List


# Set of valid vowel clusters commonly found in English & Indian name transliterations
VALID_VOWEL_CLUSTERS = {
    "AA", "EE", "OO", "OU", "AI", "AU", "IE", "EI", "OA", "EA", "IA", "IO", "AY", "EY", "OY"
}

# Set of forbidden unnatural vowel / glide sequences (such as 'IEY' from 'PRIEYANGSHU')
FORBIDDEN_VOWEL_PATTERNS = [
    r"IEY", r"AEY", r"UEY", r"OEY",
    r"EYI", r"IYI", r"AYI",
    r"II", r"UU", r"YY", r"JJ",
    r"AOA", r"OEO", r"AUAU", r"EIE",
]

# Forbidden consonant sequences that are linguistically implausible
FORBIDDEN_CONSONANT_PATTERNS = [
    r"[BCDFGHJKLMNPQRSTVWXZ]{4,}",   # 4+ consonants in a row (unless legitimate Sanskrit like 'NGSH')
    r"^[BCDFGHJKLMNPQRSTVWXYZ]\1",  # doubled consonant at word start (e.g. RRISHAV)
    r"(\w)\1\1",                    # 3 of any identical character (e.g. RRR, EEE)
    r"[QX]",                        # arbitrary Q or X unless in original
]


def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes Levenshtein edit distance between two strings."""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]


def validate_word_linguistics(original_word: str, candidate_word: str) -> Tuple[bool, str]:
    """
    Validates a single candidate word against the original word.
    Returns (is_valid, rejection_reason).
    """
    orig = original_word.upper().strip()
    cand = candidate_word.upper().strip()

    if not cand.isalpha():
        return False, "Candidate contains non-alphabetic characters."

    if cand == orig:
        return True, "Identical to original."

    # 1. Edit distance constraint: maximum 2 edits per word
    dist = levenshtein_distance(orig, cand)
    if dist > 2:
        return False, f"Edit distance too large ({dist} > 2)."

    # 2. Length delta constraint: max 2 character difference
    if abs(len(orig) - len(cand)) > 2:
        return False, "Word length differs by more than 2 characters."

    # 3. Check for forbidden 3+ identical letters (e.g. RRR, EEE, SSS)
    if re.search(r"(\w)\1\1", cand):
        return False, "Contains artificial triple-repeated letters."

    # 4. Check for doubled leading consonants (e.g. RRISHAV)
    if len(cand) >= 2 and cand[0] == cand[1] and cand[0] not in "AEIOU":
        return False, f"Invalid doubled leading consonant: {cand[:2]}."

    # 5. Check for unnatural vowel / glide clusters (e.g. IEY as in 'PRIEYANGSHU')
    if "IEY" in cand or "AEY" in cand or "UEY" in cand:
        return False, "Contains unnatural vowel-glide cluster (e.g. IEY/AEY)."

    if "YY" in cand or "II" in cand or "UU" in cand:
        return False, "Contains artificial doubled glide/vowel (YY/II/UU)."


    # 6. Check 3+ vowel clusters: allowed only if legitimate known diphthong
    vowel_runs = re.findall(r"[AEIOU]{3,}", cand)
    for run in vowel_runs:
        if run not in {"AAY", "EAU", "IOU"}:
            return False, f"Unnatural vowel cluster: {run}."

    # 7. Check for arbitrary insertion of rare letters (Q, X, Z) not present in original
    for letter in ["Q", "X", "Z"]:
        if letter in cand and letter not in orig:
            return False, f"Arbitrary letter insertion: '{letter}'."

    # 8. Check first letter identity (do not change initial consonant/vowel family)
    if orig and cand and orig[0] != cand[0]:
        # Allow only direct phonetic equivalents like C/K or PH/F or V/W
        allowed_initial_pairs = {("C", "K"), ("K", "C"), ("V", "W"), ("W", "V"), ("F", "P"), ("P", "F")}
        if (orig[0], cand[0]) not in allowed_initial_pairs:
            return False, f"Initial letter changed from '{orig[0]}' to '{cand[0]}'."

    # 9. Strict Given Name Identity Preservation:
    # A candidate must represent the SAME person's name, not morph into a distinct established given name.
    # Check A: Multi-vowel cross-family mutation (e.g. SUBRATA -> SUBROTO shifts multiple A->O syllables)
    import difflib
    matcher = difflib.SequenceMatcher(None, orig, cand)
    cross_vowel_swaps = 0
    allowed_vowel_families = [
        {"A", "AA", "AH", "EA"},
        {"I", "EE", "Y", "IE", "E"},
        {"U", "OO", "OU", "UH"},
        {"O", "OH", "OA"},
    ]

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "replace":
            o_sub = orig[i1:i2]
            c_sub = cand[j1:j2]
            is_intra = any(o_sub in fam and c_sub in fam for fam in allowed_vowel_families)
            if not is_intra and set(o_sub).issubset(set("AEIOUY")) and set(c_sub).issubset(set("AEIOUY")):
                cross_vowel_swaps += 1

    if cross_vowel_swaps > 1:
        return False, f"Multiple cross-vowel substitutions ({cross_vowel_swaps}) change given name identity (e.g. SUBRATA -> SUBROTO)."

    # Check B: Core consonant skeleton preservation (e.g. RAHUL -> ROHAN replaces L with N)
    orig_consonants = re.sub(r"[AEIOU]", "", orig)
    cand_consonants = re.sub(r"[AEIOU]", "", cand)
    
    # Normalize allowable consonant variations (doubling, aspiration, C/K, W/V)
    def normalize_consonant_skeleton(c_str: str) -> str:
        s = c_str
        # reduce doubles
        s = re.sub(r"(\w)\1+", r"\1", s)
        # reduce aspiration variations
        s = re.sub(r"TH", "T", s)
        s = re.sub(r"DH", "D", s)
        s = re.sub(r"BH", "B", s)
        s = re.sub(r"GH", "G", s)
        s = re.sub(r"KH", "K", s)
        s = re.sub(r"PH", "P", s)
        s = re.sub(r"SH", "S", s)
        # phonetic equivalents
        s = s.replace("C", "K").replace("W", "V")
        return s

    norm_orig_c = normalize_consonant_skeleton(orig_consonants)
    norm_cand_c = normalize_consonant_skeleton(cand_consonants)

    if norm_orig_c != norm_cand_c:
        # Check if length differs by more than 1 core consonant
        if abs(len(norm_orig_c) - len(norm_cand_c)) > 1 or levenshtein_distance(norm_orig_c, norm_cand_c) > 1:
            return False, f"Consonant skeleton altered from '{norm_orig_c}' to '{norm_cand_c}', changing name identity."

    return True, "Passed linguistic validation."



def validate_candidate_name(original_full_name: str, candidate_full_name: str) -> Dict[str, Any]:
    """
    Validates a full candidate name against the original full name.
    Enforces word count preservation, surname locking, and per-word linguistic validity.
    """
    orig_clean = original_full_name.upper().strip()
    cand_clean = candidate_full_name.upper().strip()

    orig_words = orig_clean.split()
    cand_words = cand_clean.split()

    # Rule: Word count must be preserved exactly
    if len(orig_words) != len(cand_words):
        return {
            "is_valid": False,
            "reason": f"Word count mismatch: expected {len(orig_words)}, got {len(cand_words)}.",
            "edit_distance": levenshtein_distance(orig_clean, cand_clean),
        }

    # Rule: Surname must be preserved unchanged (unless 1-word name)
    if len(orig_words) > 1:
        orig_surname = " ".join(orig_words[1:])
        cand_surname = " ".join(cand_words[1:])
        if orig_surname != cand_surname:
            return {
                "is_valid": False,
                "reason": f"Surname was modified: '{cand_surname}' != '{orig_surname}'.",
                "edit_distance": levenshtein_distance(orig_clean, cand_clean),
            }

    # Rule: Validate first name word linguistics
    is_valid, reason = validate_word_linguistics(orig_words[0], cand_words[0])
    total_dist = levenshtein_distance(orig_clean, cand_clean)

    return {
        "is_valid": is_valid,
        "reason": reason,
        "edit_distance": total_dist,
        "original_name": orig_clean,
        "candidate_name": cand_clean,
    }
