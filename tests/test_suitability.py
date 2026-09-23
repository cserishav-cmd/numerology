import pytest
from app.numerology.suitability import check_suitability, PLANET_TABLE, DC_MATRIX

def test_planet_data_integrity():
    # Verify Data integrity rule: friendly(n) == {1..9} - enemy(n)
    all_digits = set(range(1, 10))
    for num_str, planet_info in PLANET_TABLE.items():
        enemies = set(planet_info["enemy_numbers"])
        friendly = set(planet_info["friendly_numbers"])
        good_best = set(planet_info["good_best_numbers"])
        
        # Rule check: friendly == all_digits - enemies
        expected_friendly = all_digits - enemies
        assert friendly == expected_friendly, f"Planet {num_str} ({planet_info['name']}) friendly mismatch"
        
        # Good/best must be subset of friendly
        assert good_best.issubset(friendly), f"Planet {num_str} good_best is not subset of friendly"

def test_dc_matrix_symmetry():
    # Verify matrix[i][j] == matrix[j][i]
    for i in range(1, 10):
        for j in range(1, 10):
            row_i = DC_MATRIX.get(str(i), {})
            row_j = DC_MATRIX.get(str(j), {})
            val_ij = set(row_i.get(str(j), []))
            val_ji = set(row_j.get(str(i), []))
            assert val_ij == val_ji, f"Matrix asymmetry between ({i},{j}) and ({j},{i})"

def test_suitability_worked_example_subrata():
    # Spec example: SUBRATA HALDAR -> Name Number 8, Driver Number 7 (16/07/1990)
    # Neptune/Ketu enemies: [3, 6, 7, 8, 9] -> 8 is an enemy -> poor
    res = check_suitability("SUBRATA HALDAR", "16/07/1990", gender="Male")
    assert res["name_details"]["root_number"] == 8
    assert res["driver_details"]["driver_number"] == 7
    assert res["suitability"]["tier"] == "poor"
    assert res["suitability"]["stars"] <= 2
    assert res["suitability"]["requires_correction"] is True

def test_suitability_excellent():
    # Driver 1 (Sun): Good/best numbers are [3, 5, 9]
    # Name with root 5: e.g. "NEEL" -> N(5)+E(5)+E(5)+L(3) = 18 -> 9
    # Sun good/best includes 9 -> excellent (5★)
    res = check_suitability("NEEL", "01/01/2000", gender="Male")
    assert res["driver_details"]["driver_number"] == 1
    assert res["name_details"]["root_number"] == 9
    assert res["suitability"]["tier"] == "excellent"
    assert res["suitability"]["stars"] == 5
    assert res["suitability"]["is_recommended"] is True
