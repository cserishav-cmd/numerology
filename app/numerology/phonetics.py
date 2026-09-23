import re
import itertools
from typing import List, Set

from app.numerology.linguistic_validation import validate_word_linguistics

# Phonetic replacement rules for names (preserving spoken sound).
# RULE: Only swap existing patterns to phonetically equivalent alternatives.
#       Do NOT add doubled consonants where none exist -- that creates
#       invalid variants like RRISHAV from RISHAV.
#       Do NOT collapse SH to S -- in Indian names like RISHAV, SH is
#       a mandatory consonant pair, not a digraph shorthand.
#       Do NOT turn I before Y into IE/EE (e.g. PRIYANGSHU -> PRIEYANGSHU).
PHONETIC_REPLACEMENTS = [
    (r'SHH',    ['SH']),          # SHH -> SH  (reduce triple to digraph)
    (r'IY',     ['EEY']),         # IY -> EEY (e.g. PRIYA -> PREEYA, PRIYANGSHU -> PREEYANGSHU)
    (r'NGSH',   ['NGS', 'NSH']),  # Sanskrit/Bengali ংশ -> NGS or NSH transliterations
    (r'V',      ['W', 'BH']),     # V  -> W or BH
    (r'W',      ['V']),           # W  -> V
    (r'EE',     ['I', 'Y', 'IE', 'E']),
    (r'I(?!Y)', ['EE', 'Y', 'IE']),  # do not alter I to IE if followed by Y
    (r'OO',     ['U', 'OU']),
    (r'U$',     ['UH', 'OO', 'OU']), # final Sanskrit u / visarga representations
    (r'U',      ['OO', 'OU']),
    (r'TH',     ['T']),           # TH -> T
    (r'T(?!H)', ['TH']),         # T  -> TH  (only when not TH)
    (r'DH',     ['D']),
    (r'D(?!H)', ['DH']),
    (r'BH',     ['B', 'V']),
    (r'GH',     ['G']),
    (r'KH',     ['K']),
    (r'PH',     ['F']),
    (r'F',      ['PH']),
    (r'K',      ['C']),           # K  -> C
    (r'C(?!H)', ['K']),
    (r'AA',     ['A', 'AH']),
    (r'A$',     ['AH', 'AA']),
    (r'RH',     ['R']),           # RH -> R
    (r'LL',     ['L']),           # LL -> L
    (r'MM',     ['M']),           # MM -> M
    (r'NN',     ['N']),           # NN -> N
]



def generate_word_phonetic_variants(word: str, max_variants: int = 15) -> Set[str]:
    """
    Generates phonetically sound-alike spelling variants for a single name/word.
    Applies strict linguistic validation to reject any artificial or unnatural spellings.
    """
    word_upper = word.upper().strip()
    if not word_upper or not word_upper.isalpha():
        return {word_upper} if word_upper else set()

    variants = {word_upper}

    # 1. Single replacement passes
    for pattern, replacements in PHONETIC_REPLACEMENTS:
        matches = list(re.finditer(pattern, word_upper))
        for match in matches:
            start, end = match.span()
            for rep in replacements:
                var = word_upper[:start] + rep + word_upper[end:]
                if var and len(var) >= 2:
                    is_valid, _ = validate_word_linguistics(word_upper, var)
                    if is_valid:
                        variants.add(var)

    # 2. Targeted vowel tweaks (sound-preserving only)
    vowel_tweaks = [
        ('AV', 'AW'),
        ('AV', 'AUV'),
        ('AV', 'AAV'),
        ('OJ', 'OZ'),
        ('RAJ', 'RAAJ'),
        ('AT', 'AAT'),
        ('AT', 'ATH'),
    ]
    for orig, rep in vowel_tweaks:
        if orig in word_upper:
            candidate = word_upper.replace(orig, rep, 1)
            is_valid, _ = validate_word_linguistics(word_upper, candidate)
            if is_valid:
                variants.add(candidate)

    return set(list(variants)[:max_variants])


def generate_phonetic_variants(full_name: str, max_total: int = 30) -> List[str]:
    """
    Generates full name variants by applying phonetic sound-preserving transformations
    to the FIRST name only. The surname is always preserved as-is.
    """
    words = [w for w in re.split(r'\s+', full_name.strip().upper()) if w]
    if not words:
        return []

    if len(words) == 1:
        return list(generate_word_phonetic_variants(words[0], max_variants=max_total))

    first_name_variants = generate_word_phonetic_variants(words[0], max_variants=max_total)
    surname = " ".join(words[1:])

    results = set()
    for fn_var in first_name_variants:
        results.add(f"{fn_var} {surname}")

    return list(results)[:max_total]

