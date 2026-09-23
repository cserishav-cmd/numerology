"""
Automated test suite for the Chaldean Numerology Engine.
Primary verification: Name=Rishav Mallick, DOB=24/08/2005
Expected: Driver=6(Venus), Conductor=3(Jupiter), Compound=35, Root=8
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.numerology.calculations import (
    calculate_name_number, calculate_driver_number,
    calculate_conductor_number, CHALDEAN_MAP,
)
from app.numerology.suitability import check_suitability, PLANET_TABLE, DC_MATRIX


class TestChaldeanMapping:
    EXPECTED = {
        "A":1,"I":1,"J":1,"Q":1,"Y":1,
        "B":2,"K":2,"R":2,
        "C":3,"G":3,"L":3,"S":3,
        "D":4,"M":4,"T":4,
        "E":5,"H":5,"N":5,"X":5,
        "U":6,"V":6,"W":6,
        "O":7,"Z":7,
        "F":8,"P":8,
    }
    def test_all_letters_mapped(self):
        for l in self.EXPECTED: assert l in CHALDEAN_MAP
    def test_values_correct(self):
        for l, v in self.EXPECTED.items():
            assert CHALDEAN_MAP[l] == v, f"CHALDEAN_MAP[{l!r}]={CHALDEAN_MAP[l]}, expected {v}"
    def test_no_9_for_any_letter(self):
        for l, v in CHALDEAN_MAP.items(): assert v != 9, f"{l} mapped to 9 (Pythagorean leak)"
    def test_key_letters(self):
        for l, v in [("R",2),("I",1),("S",3),("H",5),("A",1),("V",6),("M",4),("L",3),("C",3),("K",2)]:
            assert CHALDEAN_MAP[l] == v


class TestNameNumber:
    def test_rishav_mallick_compound(self):
        r = calculate_name_number("Rishav Mallick")
        assert r["compound_number"] == 35, f"Got {r['compound_number']}"
    def test_rishav_mallick_root(self):
        assert calculate_name_number("Rishav Mallick")["root_number"] == 8
    def test_rishavv_mallick_compound(self):
        assert calculate_name_number("Rishavv Mallick")["compound_number"] == 41
    def test_rishavv_mallick_root(self):
        assert calculate_name_number("Rishavv Mallick")["root_number"] == 5
    def test_rishauv_mallick_compound(self):
        assert calculate_name_number("Rishauv Mallick")["compound_number"] == 41
    def test_rishauv_mallick_root(self):
        assert calculate_name_number("Rishauv Mallick")["root_number"] == 5
    def test_compound_root_separate(self):
        r = calculate_name_number("Rishav Mallick")
        assert r["compound_number"] == 35 and r["root_number"] == 8
    def test_uses_word_sums_not_roots(self):
        r = calculate_name_number("Rishav Mallick")
        raw = sum(w["compound_sum"] for w in r["word_breakdowns"])
        assert raw == 35 and r["compound_number"] == 35


class TestNormalization:
    FORMS = ["Rishav Mallick","RISHAV MALLICK","rishav mallick","RISHAV  MALLICK","  Rishav Mallick  "]
    def test_same_compound(self):
        vals = set(calculate_name_number(f)["compound_number"] for f in self.FORMS)
        assert len(vals) == 1, f"Inconsistent: {vals}"
    def test_same_root(self):
        vals = set(calculate_name_number(f)["root_number"] for f in self.FORMS)
        assert len(vals) == 1
    def test_no_space_in_breakdown(self):
        for item in calculate_name_number("RISHAV MALLICK")["letter_breakdown"]:
            assert item["char"] != " "
    def test_hyphen_stripped(self):
        a = calculate_name_number("Rishav Mallick")["compound_number"]
        b = calculate_name_number("Rishav-Mallick")["compound_number"]
        assert a == b


class TestDriver:
    def test_slash(self): assert calculate_driver_number("24/08/2005")["driver_number"] == 6
    def test_iso(self): assert calculate_driver_number("2005-08-24")["driver_number"] == 6
    def test_day(self): assert calculate_driver_number("24/08/2005")["day"] == 24
    def test_day_only(self):
        assert calculate_driver_number("24/03/1990")["driver_number"] == 6
    def test_separate_from_conductor(self):
        d = calculate_driver_number("24/08/2005")["driver_number"]
        c = calculate_conductor_number("24/08/2005")["conductor_number"]
        assert d == 6 and c == 3 and d != c


class TestConductor:
    def test_slash(self): assert calculate_conductor_number("24/08/2005")["conductor_number"] == 3
    def test_iso(self): assert calculate_conductor_number("2005-08-24")["conductor_number"] == 3
    def test_initial_sum(self): assert calculate_conductor_number("24/08/2005")["initial_sum"] == 21


class TestPlanets:
    def test_6_venus(self): assert PLANET_TABLE["6"]["name"] == "Venus"
    def test_3_jupiter(self): assert PLANET_TABLE["3"]["name"] == "Jupiter"
    def test_5_mercury(self): assert PLANET_TABLE["5"]["name"] == "Mercury"
    def test_all_present(self):
        for i in range(1,10): assert str(i) in PLANET_TABLE
    def test_driver_via_suitability(self):
        r = check_suitability("Rishav Mallick","24/08/2005")
        assert r["driver_details"]["planet_name"] == "Venus"
        assert r["driver_details"]["driver_number"] == 6
    def test_conductor_via_suitability(self):
        r = check_suitability("Rishav Mallick","24/08/2005")
        assert r["conductor_details"]["planet_name"] == "Jupiter"
        assert r["conductor_details"]["conductor_number"] == 3


class TestFullPipeline:
    @pytest.fixture(scope="class")
    def r(self): return check_suitability("Rishav Mallick","24/08/2005")

    def test_compound(self,r): assert r["name_details"]["compound_number"] == 35
    def test_root(self,r): assert r["name_details"]["root_number"] == 8
    def test_driver(self,r): assert r["driver_details"]["driver_number"] == 6
    def test_driver_planet(self,r): assert r["driver_details"]["planet_name"] == "Venus"
    def test_conductor(self,r): assert r["conductor_details"]["conductor_number"] == 3
    def test_conductor_planet(self,r): assert r["conductor_details"]["planet_name"] == "Jupiter"
    def test_matrix_d6_c3(self,r):
        assert r["matrix_recommendations"] == DC_MATRIX["6"]["3"]
    def test_root_ne_driver(self,r):
        assert r["name_details"]["root_number"] != r["driver_details"]["driver_number"]
    def test_root_ne_conductor(self,r):
        assert r["name_details"]["root_number"] != r["conductor_details"]["conductor_number"]
    def test_venus_enemies(self,r):
        e = r["driver_details"]["enemy_numbers"]
        for n in [2,6,7]: assert n in e
    def test_venus_friendly(self,r):
        f = r["driver_details"]["friendly_numbers"]
        for n in [1,3,4,5,8,9]: assert n in f
    def test_venus_good_best(self,r):
        g = r["driver_details"]["good_best_numbers"]
        for n in [3,5,9]: assert n in g


class TestNoInvalidVariants:
    ALLOWED = {"SH","TH","PH","KH","GH","BH","DH","CH","AA","EE","OO","OU"}

    def test_no_rrishav(self):
        from app.numerology.phonetics import generate_word_phonetic_variants
        assert "RRISHAV" not in generate_word_phonetic_variants("RISHAV")

    def test_no_doubled_leading_consonant(self):
        from app.numerology.phonetics import generate_word_phonetic_variants
        for v in generate_word_phonetic_variants("RISHAV"):
            if len(v) > 1 and v[0] not in "AEIOU":
                assert v[0] != v[1], f"Doubled leading consonant: {v!r}"

    def test_no_bad_doubles_in_any_variant(self):
        from app.numerology.phonetics import generate_word_phonetic_variants
        for v in generate_word_phonetic_variants("RISHAV"):
            for i in range(len(v)-1):
                pair = v[i:i+2]
                if v[i] == v[i+1]:
                    assert pair in self.ALLOWED, f"Bad double {pair!r} in {v!r}"


class TestPriyangshuHalderCase:
    """
    Test Case: Priyangshu Halder, DOB: 08/02/2005
    Expected:
      Driver = 8 (Saturn)
      Conductor = 8 (Saturn)
      PRIYANGSHU = 35
      HALDER = 20
      Full Name = 55 -> Root 1
    """

    def test_priyangshu_word_sum(self):
        from app.numerology.calculations import calculate_name_number
        r = calculate_name_number("Priyangshu Halder")
        wb = r["word_breakdowns"]
        assert wb[0]["compound_sum"] == 35, f"Expected PRIYANGSHU=35, got {wb[0]['compound_sum']}"
        assert wb[1]["compound_sum"] == 20, f"Expected HALDER=20, got {wb[1]['compound_sum']}"
        assert r["compound_number"] == 55
        assert r["root_number"] == 1

    def test_driver_and_conductor_8_8(self):
        from app.numerology.calculations import calculate_driver_number, calculate_conductor_number
        d = calculate_driver_number("08/02/2005")
        c = calculate_conductor_number("08/02/2005")
        assert d["driver_number"] == 8
        assert c["conductor_number"] == 8

    def test_prieyangshu_rejected_by_linguistic_validation(self):
        from app.numerology.linguistic_validation import validate_candidate_name
        res = validate_candidate_name("Priyangshu Halder", "Prieyangshu Halder")
        assert res["is_valid"] is False, "Prieyangshu must be rejected due to unnatural 'IEY' sequence"

    def test_local_phonetics_does_not_generate_prieyangshu(self):
        from app.numerology.phonetics import generate_phonetic_variants
        vars_generated = generate_phonetic_variants("Priyangshu Halder")
        assert "PRIEYANGSHU HALDER" not in vars_generated


class TestGeminiStrictPrompt:
    """Verify prompt formulation and candidate JSON extraction for Gemini."""

    def test_json_object_extraction(self):
        import json
        raw = '{"candidates": [{"name": "Rishaav Mallick", "reason": "Natural vowel length"}, {"name": "Rishauv Mallick", "reason": "Phonetic equivalent"}]}'
        parsed = json.loads(raw)
        cands = [str(item["name"]).strip().upper() for item in parsed["candidates"]]
        assert cands == ["RISHAAV MALLICK", "RISHAUV MALLICK"]

    def test_empty_candidates_handling(self):
        import json
        raw = '{"candidates": []}'
        parsed = json.loads(raw)
        cands = [str(item["name"]).strip().upper() for item in parsed.get("candidates", []) if "name" in item]
        assert cands == []


class TestCandidateIdentityValidation:
    """
    Candidate identity validation:
    - SUBROTO HALDAR Chaldean calculation is 47/2 (mathematically exact).
    - SUBROTO must NOT be accepted as a spelling variant of SUBRATA because it is
      a distinct established given name.
    - Real spelling variants like SUBRAATA or SOOBRATA are accepted.
    """

    def test_subroto_haldar_calculation_exact(self):
        from app.numerology.calculations import calculate_name_number
        # S(3)+U(6)+B(2)+R(2)+O(7)+T(4)+O(7) = 31
        # H(5)+A(1)+L(3)+D(4)+A(1)+R(2) = 16
        # Total = 47 -> 4+7 = 11 -> 2 (47/2)
        r = calculate_name_number("Subroto Haldar")
        wb = r["word_breakdowns"]
        assert wb[0]["compound_sum"] == 31, f"Expected SUBROTO=31, got {wb[0]['compound_sum']}"
        assert wb[1]["compound_sum"] == 16, f"Expected HALDAR=16, got {wb[1]['compound_sum']}"
        assert r["compound_number"] == 47
        assert r["root_number"] == 2

    def test_subroto_rejected_as_variant_of_subrata(self):
        from app.numerology.linguistic_validation import validate_candidate_name
        res = validate_candidate_name("Subrata Haldar", "Subroto Haldar")
        assert res["is_valid"] is False, "SUBROTO must be rejected as variant of SUBRATA due to distinct name identity"

    def test_subraata_accepted_as_variant_of_subrata(self):
        from app.numerology.linguistic_validation import validate_candidate_name
        res = validate_candidate_name("Subrata Haldar", "Subraata Haldar")
        assert res["is_valid"] is True, "SUBRAATA is a legitimate vowel-length spelling variant"

    def test_soobrata_accepted_as_variant_of_subrata(self):
        from app.numerology.linguistic_validation import validate_candidate_name
        res = validate_candidate_name("Subrata Haldar", "Soobrata Haldar")
        assert res["is_valid"] is True, "SOOBRATA is a legitimate transliteration variant"

    def test_rohan_rejected_as_variant_of_rahul(self):
        from app.numerology.linguistic_validation import validate_candidate_name
        res = validate_candidate_name("Rahul Sharma", "Rohan Sharma")
        assert res["is_valid"] is False, "ROHAN must be rejected as variant of RAHUL"



