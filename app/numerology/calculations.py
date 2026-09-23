import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

from app.config import settings

def load_chaldean_chart(chart_path: Optional[Path] = None) -> Dict[str, int]:
    """
    Loads Chaldean mapping and inverts it to letter -> number dictionary.
    """
    path = chart_path or (settings.DATA_DIR / "chaldean_chart.json")
    with open(path, "r", encoding="utf-8") as f:
        raw_chart = json.load(f)
    
    letter_to_number: Dict[str, int] = {}
    for number_str, letters in raw_chart.items():
        val = int(number_str)
        for letter in letters:
            letter_to_number[letter.upper()] = val
    return letter_to_number

# Singleton in-memory map
CHALDEAN_MAP = load_chaldean_chart()

def reduce_to_single_digit(n: int) -> Tuple[int, List[int]]:
    """
    Repeatedly sums the digits of an integer until a single digit (1-9) is reached.
    Returns (single_digit, reduction_steps_list).
    Example: 35 -> (8, [35, 8])
             19 -> (1, [19, 10, 1])
    """
    if n <= 0:
        return 0, [n]
    
    steps = [n]
    current = n
    while current > 9:
        current = sum(int(d) for d in str(current))
        steps.append(current)
    return current, steps

def calculate_name_number(full_name: str) -> Dict[str, Any]:
    """
    Calculates the Chaldean Name Number for a given full name.
    Preserves word structure for breakdown and sums total values.
    """
    cleaned_name = full_name.strip().upper()
    words = re.split(r'\s+', cleaned_name)
    
    total_compound = 0
    word_breakdowns = []
    all_letters_breakdown = []
    
    for word in words:
        if not word:
            continue
        word_letters = []
        word_sum = 0
        for char in word:
            if char.isalpha():
                val = CHALDEAN_MAP.get(char, 0)
                word_letters.append({"char": char, "value": val})
                all_letters_breakdown.append({"char": char, "value": val})
                word_sum += val
        
        word_root, word_steps = reduce_to_single_digit(word_sum)
        word_breakdowns.append({
            "word": word,
            "letters": word_letters,
            "compound_sum": word_sum,
            "root_number": word_root,
            "steps": word_steps
        })
        total_compound += word_sum
        
    root_number, reduction_steps = reduce_to_single_digit(total_compound)
    
    return {
        "full_name": full_name,
        "clean_name": " ".join([w["word"] for w in word_breakdowns]),
        "compound_number": total_compound,
        "root_number": root_number,
        "reduction_steps": reduction_steps,
        "word_breakdowns": word_breakdowns,
        "letter_breakdown": all_letters_breakdown
    }

def parse_dob(dob_str: str) -> Tuple[int, int, int]:
    """
    Parses a date string in common formats (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD).
    Returns (day, month, year).
    """
    cleaned = re.sub(r'[^\d]', '-', dob_str.strip())
    parts = [int(p) for p in cleaned.split('-') if p]
    
    if len(parts) != 3:
        raise ValueError(f"Invalid date of birth format: {dob_str}. Expected YYYY-MM-DD or DD/MM/YYYY.")
    
    # Check if first part is Year (4 digits)
    if parts[0] > 1000:
        year, month, day = parts[0], parts[1], parts[2]
    elif parts[2] > 1000:
        day, month, year = parts[0], parts[1], parts[2]
    else:
        # Default assume DD-MM-YY
        day, month, year = parts[0], parts[1], parts[2]
        
    return day, month, year

def calculate_driver_number(dob_str: str) -> Dict[str, Any]:
    """
    Driver number (D) = day component of DOB reduced to single digit.
    Example: Day 16 -> 1+6 = 7. Day 7 -> 7. Day 29 -> 2+9=11 -> 1+1=2.
    """
    day, month, year = parse_dob(dob_str)
    root, steps = reduce_to_single_digit(day)
    return {
        "day": day,
        "driver_number": root,
        "reduction_steps": steps
    }

def calculate_conductor_number(dob_str: str) -> Dict[str, Any]:
    """
    Conductor number (C) = sum of all digits of full date (DD/MM/YYYY) reduced to single digit.
    Example: 07/04/2003 -> 7+4+2+0+0+3 = 16 -> 1+6 = 7.
    """
    digits = [int(d) for d in dob_str if d.isdigit()]
    if not digits:
        raise ValueError(f"No digits found in date of birth: {dob_str}")
    
    initial_sum = sum(digits)
    root, steps = reduce_to_single_digit(initial_sum)
    return {
        "raw_digits": digits,
        "initial_sum": initial_sum,
        "conductor_number": root,
        "reduction_steps": steps
    }
