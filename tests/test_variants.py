import pytest
from app.numerology.phonetics import generate_phonetic_variants, generate_word_phonetic_variants
from app.numerology.variant_generation import levenshtein_distance, generate_and_rank_variants

def test_phonetic_variants_rishav():
    variants = generate_phonetic_variants("RISHAV")
    # Should include sound-alike variants like RISAV, RIESHAV, RISHAB, etc.
    assert len(variants) > 0
    upper_vars = [v.upper() for v in variants]
    assert any("RIS" in v or "RIESH" in v or "RISH" in v or "RISA" in v for v in upper_vars)

def test_levenshtein_distance():
    assert levenshtein_distance("RISHAV", "RISAV") == 1
    assert levenshtein_distance("SUBRATA", "SUBRAT") == 1
    assert levenshtein_distance("SAME", "SAME") == 0

@pytest.mark.asyncio
async def test_generate_and_rank_variants():
    # Test variant generation for SUBRATA HALDAR (DOB 16/07/1990)
    result = await generate_and_rank_variants("SUBRATA HALDAR", "16/07/1990", gender="Male")
    assert "suggestions" in result
    suggestions = result["suggestions"]
    assert len(suggestions) >= 1
    
    # Check that NO suggestion has tier == "poor"
    for s in suggestions:
        assert s["tier"] != "poor"
        assert s["stars"] >= 3
        assert "display_diff_html" in s

@pytest.mark.asyncio
async def test_generate_and_rank_variants_rishav_three_to_five_best_only():
    # Test variant generation for RISHAV MALLICK (DOB 06/06/1990)
    # Even if max_results=50 is requested, suggestions must be strictly between 3 and 5,
    # and all suggestions must be in the BEST tier (excellent/good, 5-star peak harmony).
    result = await generate_and_rank_variants("RISHAV MALLICK", "06/06/1990", gender="Male", max_results=50)
    assert "suggestions" in result
    suggestions = result["suggestions"]
    assert 3 <= len(suggestions) <= 5
    for s in suggestions:
        assert s["tier"] in ["excellent", "good"]
        assert s["stars"] >= 4
        # Verify no neutral non-peak candidates were included when best candidates exist
        assert s["tier"] != "neutral"

