import json
from pathlib import Path
from typing import Dict, Any, Optional

from app.config import settings
from app.numerology.calculations import (
    calculate_name_number,
    calculate_driver_number,
    calculate_conductor_number
)

def load_planet_table(table_path: Optional[Path] = None) -> Dict[str, Any]:
    path = table_path or (settings.DATA_DIR / "planet_table.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_dc_matrix(matrix_path: Optional[Path] = None) -> Dict[str, Any]:
    path = matrix_path or (settings.DATA_DIR / "dc_matrix.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

PLANET_TABLE = load_planet_table()
DC_MATRIX = load_dc_matrix()

def check_suitability(name: str, dob: str, gender: Optional[str] = None) -> Dict[str, Any]:
    """
    Checks whether a name is numerologically suitable for a given DOB.
    Evaluates:
    - Name Number (N)
    - Driver Number (D) & Planet
    - Conductor Number (C) & Planet
    - Suitability Tier: Excellent (5★), Good (4★), Neutral (3★), Poor (1-2★)
    """
    name_data = calculate_name_number(name)
    driver_data = calculate_driver_number(dob)
    conductor_data = calculate_conductor_number(dob)
    
    n = name_data["root_number"]
    d = driver_data["driver_number"]
    c = conductor_data["conductor_number"]
    
    d_str = str(d)
    c_str = str(c)
    
    driver_planet_info = PLANET_TABLE.get(d_str, {
        "name": f"Planet {d}",
        "enemy_numbers": [],
        "friendly_numbers": [],
        "good_best_numbers": []
    })
    
    conductor_planet_info = PLANET_TABLE.get(c_str, {
        "name": f"Planet {c}",
        "enemy_numbers": [],
        "friendly_numbers": [],
        "good_best_numbers": []
    })
    
    enemy_numbers = driver_planet_info.get("enemy_numbers", [])
    good_best_numbers = driver_planet_info.get("good_best_numbers", [])
    friendly_numbers = driver_planet_info.get("friendly_numbers", [])
    
    matrix_row = DC_MATRIX.get(d_str, {})
    best_dc_numbers = matrix_row.get(c_str, [])
    
    # 1. Enemy Check (Poor)
    if n in enemy_numbers:
        tier = "poor"
        stars = 2
        status_label = "Conflicting / Poor Vibration"
        is_recommended = False
        reason = (
            f"Name root number {n} is an ENEMY number for Driver planet {driver_planet_info['name']} "
            f"(Ruling Number {d}). This conflict can attract unnecessary struggles and discord."
        )
    # 2. Good/Best List Check (Excellent)
    elif n in good_best_numbers:
        tier = "excellent"
        stars = 5
        status_label = "Excellent / Highly Auspicious"
        is_recommended = True
        reason = (
            f"Name root number {n} is in the Good/Best harmonic vibration for Driver planet "
            f"{driver_planet_info['name']} (Ruling Number {d}). Brings high positive resonance and prosperity."
        )
    # 3. Friendly + D/C Matrix Check (Good or Neutral)
    elif n in friendly_numbers:
        if n in best_dc_numbers:
            tier = "good"
            stars = 4
            status_label = "Good / Auspicious Alignment"
            is_recommended = True
            reason = (
                f"Name root number {n} is friendly with Driver planet {driver_planet_info['name']} (Number {d}) "
                f"and activates the optimal Driver-Conductor ({d} & {c}) power matrix combination."
            )
        else:
            tier = "neutral"
            stars = 3
            status_label = "Neutral / Moderate Alignment"
            is_recommended = False
            reason = (
                f"Name root number {n} is friendly with Driver planet {driver_planet_info['name']} (Number {d}), "
                f"but does not specifically trigger the peak Driver-Conductor ({d} & {c}) synergy matrix."
            )
    else:
        tier = "neutral"
        stars = 3
        status_label = "Neutral Vibration"
        is_recommended = False
        reason = f"Name root number {n} has a neutral interaction with Driver planet {driver_planet_info['name']}."

    return {
        "name_details": name_data,
        "driver_details": {
            **driver_data,
            "planet_name": driver_planet_info["name"],
            "enemy_numbers": enemy_numbers,
            "friendly_numbers": friendly_numbers,
            "good_best_numbers": good_best_numbers
        },
        "conductor_details": {
            **conductor_data,
            "planet_name": conductor_planet_info["name"]
        },
        "matrix_recommendations": best_dc_numbers,
        "suitability": {
            "tier": tier,
            "stars": stars,
            "status_label": status_label,
            "is_recommended": is_recommended,
            "reason": reason,
            "requires_correction": tier in ["poor", "neutral"]
        },
        "gender": gender
    }
