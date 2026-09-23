# ============================================================
# CHALDEAN NAME CORRECTION ENGINE
# General-purpose MVP
#
# Input:
#   Full Name
#   DOB
#
# Output:
#   Birth Number
#   Destiny Number
#   Target Name Number
#   Current Name Number
#   Top suggested spellings
#
# IMPORTANT:
# This is a numerology-based heuristic, not a scientifically
# validated method.
# ============================================================

import re
from itertools import product
from difflib import SequenceMatcher


# ============================================================
# CHALDEAN TABLE
# ============================================================

CHALDEAN = {
    "A": 1, "I": 1, "J": 1, "Q": 1, "Y": 1,
    "B": 2, "K": 2, "R": 2,
    "C": 3, "G": 3, "L": 3, "S": 3,
    "D": 4, "M": 4, "T": 4,
    "E": 5, "H": 5, "N": 5, "X": 5,
    "U": 6, "V": 6, "W": 6,
    "O": 7, "Z": 7,
    "F": 8, "P": 8
}


# ============================================================
# NUMBER FUNCTIONS
# ============================================================

def reduce_number(n: int) -> int:
    """Reduce a number to a single digit (1-9)."""
    while n > 9:
        n = sum(int(x) for x in str(n))
    return n


def chaldean_number(name: str) -> int:
    """Return the compound (unreduced) Chaldean number for a name."""
    return sum(CHALDEAN.get(c, 0) for c in name.upper() if c.isalpha())


def name_numbers(name: str) -> tuple:
    """Return (compound, root) Chaldean numbers."""
    compound = chaldean_number(name)
    root = reduce_number(compound)
    return compound, root


# ============================================================
# DOB  --  FIX: use raw digit sum, not zero-padded string
# ============================================================

def birth_number(day: int) -> int:
    """Driver / Birth number = day of birth reduced to single digit."""
    return reduce_number(day)


def destiny_number(day: int, month: int, year: int) -> int:
    """
    Destiny (Conductor) number = sum of every individual digit
    in the date of birth, reduced to single digit.

    FIX: We sum the actual digits of each component rather than
    zero-padding the components into a string, which would add
    phantom '0' digits (e.g., day=7 -> "07" -> 0+7 instead of 7).
    """
    total = (
        sum(int(d) for d in str(day))
        + sum(int(d) for d in str(month))
        + sum(int(d) for d in str(year))
    )
    return reduce_number(total)


# ============================================================
# CLEAN NAME
# ============================================================

def clean_name(name: str) -> str:
    """Strip non-alpha characters and normalise whitespace."""
    name = re.sub(r"[^A-Za-z ]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip().upper()


# ============================================================
# PHONETIC NORMALISATION
#
# Used ONLY for similarity comparisons, not for name generation.
# Order matters: longer patterns must be replaced before shorter
# ones to avoid partial matches (e.g., SH before S).
# ============================================================

def phonetic_key(word: str) -> str:
    """
    Collapse a word to a pronunciation-representative key
    for fuzzy similarity comparisons.
    """
    w = word.lower()

    # Longer patterns first to avoid prefix conflicts
    replacements = [
        ("tch", "ch"),
        ("sch", "sh"),
        ("ph",  "f"),
        ("gh",  "g"),
        ("kh",  "k"),
        ("dh",  "d"),
        ("th",  "t"),
        ("bh",  "b"),
        ("jh",  "j"),
        ("sh",  "s"),
        ("ch",  "c"),
        ("ck",  "k"),
        ("qu",  "k"),
        ("aa",  "a"),
        ("ee",  "i"),
        ("ii",  "i"),
        ("oo",  "u"),
        ("ou",  "u"),
        ("au",  "o"),
    ]

    for old, new in replacements:
        w = w.replace(old, new)

    # Collapse duplicate characters for comparison only
    w = re.sub(r"(.)\1+", r"\1", w)

    return w


# ============================================================
# VALIDITY CHECKS
#
# FIX 1: The original code rejected all doubled letters,
#         including "AA", "EE", "OO" that the generator itself
#         produces.  We now only reject CONSONANT doubles that
#         are not phonetically meaningful.
#
# FIX 2: The consonant-cluster check was too aggressive and
#         would block digraphs like "SH", "PH", "TH" etc. that
#         are produced by the replacement engine.  We now allow
#         known digraphs before applying the 3-consonant rule.
# ============================================================

# Doubled forms that are valid in names
_ALLOWED_DOUBLES = {"AA", "EE", "OO", "OU", "SH", "TH", "PH", "KH", "GH", "BH", "DH"}

# Known digraphs that count as a single sound
_DIGRAPHS = {"SH", "TH", "PH", "KH", "GH", "BH", "DH", "CH", "CK", "QU"}


def has_bad_double(word: str) -> bool:
    """
    Reject consecutive identical characters UNLESS they belong
    to an allowed phonetic double (AA, EE, OO, etc.).
    """
    w = word.upper()
    i = 0
    while i < len(w) - 1:
        pair = w[i:i+2]
        if w[i] == w[i+1] and pair not in _ALLOWED_DOUBLES:
            return True
        i += 1
    return False


def _collapse_digraphs(word: str) -> str:
    """
    Replace known digraphs with a single placeholder consonant
    so the cluster check works correctly on the remaining letters.
    """
    w = word.upper()
    for dg in sorted(_DIGRAPHS, key=len, reverse=True):
        w = w.replace(dg, "X")   # X is a single consonant stand-in
    return w


def has_bad_consonant_cluster(word: str) -> bool:
    """
    Reject three or more consecutive consonants AFTER collapsing
    known digraphs into a single character.
    """
    collapsed = _collapse_digraphs(word)
    return bool(re.search(r"[BCDFGHJKLMNPQRSTVWXYZ]{3,}", collapsed))


def valid_word(word: str) -> bool:
    """Return True if the word is a plausible name spelling."""
    if not word:
        return False
    if not word.isalpha():
        return False
    if has_bad_double(word):
        return False
    if has_bad_consonant_cluster(word):
        return False
    if len(word) > 20:
        return False
    return True


# ============================================================
# PHONETIC SIMILARITY
# ============================================================

def phonetic_similarity(original: str, candidate: str) -> float:
    """SequenceMatcher ratio on phonetic keys."""
    return SequenceMatcher(
        None,
        phonetic_key(original),
        phonetic_key(candidate)
    ).ratio()


# ============================================================
# GENERATE PHONETIC VARIATIONS
#
# FIX: The original used str.replace(old, new) on the entire
#      word, which corrupted words containing the pattern at
#      multiple positions (e.g., "DAVID" -> replace "D" with "DH"
#      could affect both D's at once).  We now apply each
#      replacement at each specific position independently.
# ============================================================

def _apply_replacement_at_positions(word: str, old: str, new: str) -> list:
    """
    Apply the phonetic replacement old->new at every
    non-overlapping occurrence of old in word, one at a time.
    Returns a list of new candidate strings.
    """
    results = []
    start = 0
    while True:
        idx = word.find(old, start)
        if idx == -1:
            break
        candidate = word[:idx] + new + word[idx + len(old):]
        results.append(candidate)
        start = idx + len(old)
    return results


def generate_word_variations(word: str) -> list:
    """
    Generate phonetically equivalent spelling variants for one
    name token.  Only small, controlled changes are applied.
    """
    word = word.upper()
    candidates = {word}

    # --------------------------------------------------------
    # VOWEL TRANSFORMATIONS
    # --------------------------------------------------------
    vowel_map = {
        "A": ["A", "AA"],
        "E": ["E", "EE"],
        "I": ["I", "II"],
        "O": ["O", "OO"],
        "U": ["U", "OU"],      # removed "OO" -- OO valid but causes bad doubles
    }

    for i, char in enumerate(word):
        if char in vowel_map:
            for replacement in vowel_map[char]:
                new_word = word[:i] + replacement + word[i + 1:]
                candidates.add(new_word)

    # --------------------------------------------------------
    # POSITIONAL PHONETIC REPLACEMENTS
    # (applied one occurrence at a time to avoid corruption)
    # --------------------------------------------------------
    replacements = {
        "PH": "F",
        "F":  "PH",
        "TH": "T",
        "T":  "TH",
        "DH": "D",
        "D":  "DH",
        "BH": "B",
        "B":  "BH",
        "KH": "K",
        "K":  "KH",
        "SH": "S",
        "S":  "SH",
        "CH": "C",
        "C":  "CH",
        "GH": "G",
        "G":  "GH",
    }

    for old, new in replacements.items():
        for variant in _apply_replacement_at_positions(word, old, new):
            candidates.add(variant)

    # --------------------------------------------------------
    # ENDING VARIATIONS
    # --------------------------------------------------------
    if word.endswith("A"):
        candidates.add(word[:-1])        # drop trailing A
        candidates.add(word + "H")       # e.g., RASHA -> RASHAH

    if word.endswith("E"):
        candidates.add(word[:-1])        # drop trailing E

    # --------------------------------------------------------
    # STARTING VOWEL VARIATIONS
    # --------------------------------------------------------
    if word.startswith("A"):
        candidates.add("AA" + word[1:])

    if word.startswith("E"):
        candidates.add("EE" + word[1:])

    if word.startswith("O"):
        candidates.add("OO" + word[1:])

    # --------------------------------------------------------
    # FILTER: validity + phonetic similarity
    # --------------------------------------------------------
    valid = []
    for candidate in candidates:
        if not valid_word(candidate):
            continue
        sim = phonetic_similarity(word, candidate)
        if sim < 0.70:
            continue
        valid.append(candidate)

    return valid


# ============================================================
# FULL NAME CANDIDATES
# ============================================================

def generate_name_candidates(full_name: str) -> set:
    """
    Combine per-token variations into full-name candidates.

    IMPORTANT: Only the FIRST name token receives phonetic variations.
    The surname (all tokens after the first) is kept completely unchanged.
    This matches the FastAPI engine's behaviour and prevents the surname
    from being accidentally mutated.
    """
    parts = full_name.split()
    if not parts:
        return set()

    _MAX_PER_WORD = 15

    # Vary only the first name token
    first_variants = generate_word_variations(parts[0])[:_MAX_PER_WORD]
    # Surname(s) are always preserved verbatim
    surname = " ".join(parts[1:]) if len(parts) > 1 else ""

    candidates: set = set()
    original_key = phonetic_key(full_name.replace(" ", ""))

    for first_var in first_variants:
        if not valid_word(first_var):
            continue

        candidate = f"{first_var} {surname}".strip()
        candidate_key = phonetic_key(candidate.replace(" ", ""))
        sim = SequenceMatcher(None, original_key, candidate_key).ratio()
        if sim >= 0.70:
            candidates.add(candidate)

    return candidates


# ============================================================
# TARGET NUMBER SELECTION
# ============================================================

def determine_target_number(birth: int, destiny: int) -> int:
    """
    Select the numerological target number.
    If Birth == Destiny, use that number.
    Otherwise prefer Destiny (Conductor).
    """
    if birth == destiny:
        return birth
    return destiny


# ============================================================
# COMPATIBILITY SCORE
# ============================================================

def compatibility_score(
    root: int,
    birth: int,
    destiny: int,
    target: int,
) -> float:
    """
    Score a candidate name's root number against birth / destiny.
    Higher = more compatible.
    """
    score = 0.0

    if root == target:
        score += 100

    if root == birth:
        score += 40

    if root == destiny:
        score += 40

    # Traditional Chaldean compatibility heuristic
    compatible = {
        1: {1, 2, 3, 5, 9},
        2: {1, 2, 4, 6, 7},
        3: {1, 3, 5, 6, 9},
        4: {2, 4, 6, 7, 8},
        5: {1, 3, 5, 6},
        6: {2, 3, 6, 9},
        7: {2, 4, 7},
        8: {1, 3, 4, 5, 6, 8},   # FIX: broadened per standard Chaldean texts
        9: {1, 3, 6, 9},
    }

    if root in compatible.get(birth, set()):
        score += 10

    if root in compatible.get(destiny, set()):
        score += 10

    return score


def _score_to_stars(score: float) -> str:
    """
    Convert the internal compatibility score to a 1-5 star string.

    Thresholds (empirical -- adjust to taste):
      *****  score >= 150   (exact target hit + strong similarity)
      ****   score >= 100   (target hit or very high compatibility)
      ***    score >= 60    (good compatibility / friendly number)
      **     score >= 30    (neutral / minor similarity only)
      *       below 30
    """
    if score >= 150:
        return "*****"
    if score >= 100:
        return "****"
    if score >= 60:
        return "***"
    if score >= 30:
        return "**"
    return "*"



def rank_candidates(
    original_name: str,
    candidates: set,
    birth: int,
    destiny: int,
    target: int,
) -> list:
    """
    Score every candidate and return a list sorted best-first.
    Each entry includes a 'stars' relevance field (1–5★).
    """
    results = []
    original_clean = original_name.replace(" ", "")

    for candidate in candidates:
        compound, root = name_numbers(candidate)
        score = compatibility_score(root, birth, destiny, target)

        candidate_clean = candidate.replace(" ", "")

        # Phonetic string similarity bonus
        similarity = SequenceMatcher(
            None, original_clean, candidate_clean
        ).ratio()
        score += similarity * 30

        # Penalty for length difference
        length_difference = abs(len(original_clean) - len(candidate_clean))
        score -= length_difference * 5

        final_score = round(score, 2)

        results.append({
            "name":                candidate.title(),
            "compound":            compound,
            "root":                root,
            "score":               final_score,
            "phonetic_similarity": round(similarity, 3),
            "stars":               _score_to_stars(final_score),
        })

    results.sort(key=lambda x: (-x["score"], -x["phonetic_similarity"]))
    return results


# ============================================================
# MAIN CORRECTION ENGINE
# ============================================================

def correct_name(
    name: str,
    day: int,
    month: int,
    year: int,
    top: int = 5,
) -> dict:
    """
    Full pipeline:
      clean -> calculate DOB numbers -> generate variants
      -> score -> return top-N suggestions.
    """
    name = clean_name(name)

    birth   = birth_number(day)
    destiny = destiny_number(day, month, year)

    current_compound, current_root = name_numbers(name)
    target = determine_target_number(birth, destiny)

    candidates = generate_name_candidates(name)
    ranked     = rank_candidates(name, candidates, birth, destiny, target)

    return {
        "name":             name.title(),
        "birth":            birth,
        "destiny":          destiny,
        "target":           target,
        "current_compound": current_compound,
        "current_root":     current_root,
        "suggestions":      ranked[:top],
    }


# ============================================================
# DISPLAY
# ============================================================

def display(result: dict) -> None:
    print("\n")
    print("=" * 65)
    print("          CHALDEAN NAME CORRECTION")
    print("=" * 65)

    print(f"\nOriginal Name   : {result['name']}")
    print(f"Birth Number    : {result['birth']}")
    print(f"Destiny Number  : {result['destiny']}")
    print(f"Target Number   : {result['target']}")
    print(
        f"Current Name    : "
        f"{result['current_compound']}/"
        f"{result['current_root']}"
    )

    print("\nRECOMMENDED NAMES")
    print("-" * 65)
    print(f"  {'#':<3} {'Name':<25} {'Compound/Root':<16} {'Stars':<10} Score")
    print("-" * 65)

    for i, item in enumerate(result["suggestions"], 1):
        print(
            f"  {i:<3} "
            f"{item['name']:<25} "
            f"{item['compound']}/{item['root']:<12} "
            f"{item['stars']:<10} "
            f"{item['score']}"
        )

    print("-" * 65)
    print(
        "\nNote: Results are based on configurable "
        "Chaldean-numerology heuristics."
    )


# ============================================================
# PROGRAM
# ============================================================

def _parse_dob(dob: str) -> tuple:
    """
    Accept DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, YYYY/MM/DD.
    Returns (day, month, year).
    """
    parts = re.split(r"[/\-]", dob.strip())
    if len(parts) != 3:
        raise ValueError("Expected 3 date components.")
    a, b, c = int(parts[0]), int(parts[1]), int(parts[2])
    if a > 1000:            # YYYY-MM-DD
        year, month, day = a, b, c
    elif c > 1000:          # DD/MM/YYYY
        day, month, year = a, b, c
    else:
        raise ValueError("Cannot determine date format.")
    return day, month, year


if __name__ == "__main__":
    print("\nCHALDEAN NAME CORRECTION")
    print("-" * 40)

    name_input = input("Enter full name: ").strip()
    dob_input  = input("Enter DOB (DD/MM/YYYY or YYYY-MM-DD): ").strip()

    try:
        day, month, year = _parse_dob(dob_input)

        if not (1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100):
            raise ValueError("Date values out of range.")

        result = correct_name(name_input, day, month, year, top=5)
        display(result)

    except ValueError as e:
        print(
            f"\nInvalid input: {e}"
            "\nAccepted formats: DD/MM/YYYY  or  YYYY-MM-DD"
            "\nExample: 07/04/2003  or  2003-04-07"
        )
