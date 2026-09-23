import pytest
from app.numerology.calculations import (
    reduce_to_single_digit,
    calculate_name_number,
    calculate_driver_number,
    calculate_conductor_number,
    CHALDEAN_MAP
)

def test_chaldean_letter_map():
    # Verify exact mapping per Chaldean chart
    assert CHALDEAN_MAP["A"] == 1
    assert CHALDEAN_MAP["I"] == 1
    assert CHALDEAN_MAP["J"] == 1
    assert CHALDEAN_MAP["Q"] == 1
    assert CHALDEAN_MAP["Y"] == 1
    
    assert CHALDEAN_MAP["B"] == 2
    assert CHALDEAN_MAP["K"] == 2
    assert CHALDEAN_MAP["R"] == 2
    
    assert CHALDEAN_MAP["C"] == 3
    assert CHALDEAN_MAP["G"] == 3
    assert CHALDEAN_MAP["L"] == 3
    assert CHALDEAN_MAP["S"] == 3
    
    assert CHALDEAN_MAP["D"] == 4
    assert CHALDEAN_MAP["M"] == 4
    assert CHALDEAN_MAP["T"] == 4
    
    assert CHALDEAN_MAP["E"] == 5
    assert CHALDEAN_MAP["H"] == 5
    assert CHALDEAN_MAP["N"] == 5
    assert CHALDEAN_MAP["X"] == 5
    
    assert CHALDEAN_MAP["U"] == 6
    assert CHALDEAN_MAP["V"] == 6
    assert CHALDEAN_MAP["W"] == 6
    
    assert CHALDEAN_MAP["O"] == 7
    assert CHALDEAN_MAP["Z"] == 7
    
    assert CHALDEAN_MAP["F"] == 8
    assert CHALDEAN_MAP["P"] == 8
    
    # Verify no letter maps to 9
    assert 9 not in CHALDEAN_MAP.values()

def test_reduce_to_single_digit():
    assert reduce_to_single_digit(35)[0] == 8
    assert reduce_to_single_digit(19)[0] == 1
    assert reduce_to_single_digit(9)[0] == 9
    assert reduce_to_single_digit(55)[0] == 1  # 55 -> 10 -> 1
    assert reduce_to_single_digit(28)[0] == 1  # 28 -> 10 -> 1
    assert reduce_to_single_digit(0)[0] == 0

def test_calculate_name_number_subrata_haldar():
    res = calculate_name_number("SUBRATA HALDAR")
    # SUBRATA = S(3) + U(6) + B(2) + R(2) + A(1) + T(4) + A(1) = 19
    # HALDAR = H(5) + A(1) + L(3) + D(4) + A(1) + R(2) = 16
    # Total = 35 -> 8
    assert res["compound_number"] == 35
    assert res["root_number"] == 8
    assert len(res["word_breakdowns"]) == 2
    assert res["word_breakdowns"][0]["compound_sum"] == 19
    assert res["word_breakdowns"][1]["compound_sum"] == 16

def test_calculate_driver_number():
    # Day 16 -> 1+6 = 7
    assert calculate_driver_number("16/07/1990")["driver_number"] == 7
    # Day 7 -> 7
    assert calculate_driver_number("07-04-2003")["driver_number"] == 7
    # Day 29 -> 2+9 = 11 -> 2
    assert calculate_driver_number("1995-12-29")["driver_number"] == 2

def test_calculate_conductor_number():
    # 07/04/2003 -> 7+4+2+0+0+3 = 16 -> 1+6 = 7
    assert calculate_conductor_number("07/04/2003")["conductor_number"] == 7
    # 16/07/1990 -> 1+6+0+7+1+9+9+0 = 33 -> 6
    assert calculate_conductor_number("16/07/1990")["conductor_number"] == 6
