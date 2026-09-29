import asyncio
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import smtplib
from typing import Any, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Planetary table reference for email inclusion
PLANET_EMAIL_TABLE = [
    {"num": 1, "planet": "Sun", "enemy": "8", "friendly": "1, 2, 3, 4, 5, 6, 7, 9", "good": "3, 5, 9"},
    {"num": 2, "planet": "Moon", "enemy": "2, 5, 6", "friendly": "1, 3, 4, 7, 8, 9", "good": "1, 3, 9"},
    {"num": 3, "planet": "Jupiter", "enemy": "4, 7", "friendly": "1, 2, 3, 5, 6, 8, 9", "good": "1, 3, 5, 6"},
    {"num": 4, "planet": "Rahu/Uranus", "enemy": "3, 4, 8", "friendly": "1, 2, 5, 6, 7, 9", "good": "1, 5, 6"},
    {"num": 5, "planet": "Mercury", "enemy": "2", "friendly": "1, 3, 4, 5, 6, 7, 8, 9", "good": "1, 5, 6"},
    {"num": 6, "planet": "Venus", "enemy": "2, 6, 7", "friendly": "1, 3, 4, 5, 8, 9", "good": "3, 5, 9"},
    {"num": 7, "planet": "Neptune/Ketu", "enemy": "3, 6, 7, 8, 9", "friendly": "1, 2, 4, 5", "good": "1, 5"},
    {"num": 8, "planet": "Saturn", "enemy": "1, 4, 7, 8, 9", "friendly": "2, 3, 5, 6", "good": "3, 5, 6"},
    {"num": 9, "planet": "Mars", "enemy": "7, 8", "friendly": "1, 2, 3, 4, 5, 6, 9", "good": "1, 3, 5, 6"},
]

PLANET_NAME_LOOKUP: Dict[int, str] = {
    1: "Sun",
    2: "Moon",
    3: "Jupiter",
    4: "Rahu/Uranus",
    5: "Mercury",
    6: "Venus",
    7: "Neptune/Ketu",
    8: "Saturn",
    9: "Mars",
}

CHALDEAN_ALPHABET_EMAIL = [
    {"num": 1, "letters": "A, I, J, Q, Y"},
    {"num": 2, "letters": "B, K, R"},
    {"num": 3, "letters": "C, G, L, S"},
    {"num": 4, "letters": "D, M, T"},
    {"num": 5, "letters": "E, H, N, X"},
    {"num": 6, "letters": "U, V, W"},
    {"num": 7, "letters": "O, Z"},
    {"num": 8, "letters": "F, P"},
]


def generate_email_html(
    name: str,
    dob: str,
    gender: str,
    analysis_data: Optional[Dict[str, Any]] = None,
    suggestions: Optional[List[Dict[str, Any]]] = None,
    payment_info: Optional[Dict[str, Any]] = None,
    report_type: str = "harmonization",
) -> str:
    """
    Generates a luxury Obsidian & 24K Gold HTML email dossier.
    If report_type == 'matrix_chart' (All-In-One Combo ₹199):
      Includes Name Suggestions + 9x9 DC Matrix Analysis + Chaldean Sound Table + Planetary Archetypes.
    If report_type == 'harmonization' (₹99):
      Includes Name Suggestions + Core Vibrational Pillars + Planetary Harmony.
    """
    date_str = datetime.now().strftime("%B %d, %Y - %I:%M %p")
    pay_id = payment_info.get("payment_id", "N/A") if payment_info else "N/A"
    is_matrix = report_type in ("dc_matrix", "matrix")
    is_chart = report_type in ("chaldean_chart", "chart")
    is_legacy_combo = report_type == "matrix_chart"
    is_name_report = not is_matrix and not is_chart and not is_legacy_combo

    if is_matrix:
        default_price = settings.DC_MATRIX_PRICE_INR
        suite_title = "9×9 DRIVER & CONDUCTOR POWER MATRIX ARCHIVE"
        receipt_label = f"₹{default_price} INR (9×9 Symmetric Driver-Conductor Matrix Table)"
    elif is_chart:
        default_price = settings.CHALDEAN_CHART_PRICE_INR
        suite_title = "CHALDEAN SACRED SOUND VIBRATIONAL ARCHIVE"
        receipt_label = f"₹{default_price} INR (Chaldean Sacred 1–8 Sound Vibration Alphabet Chart)"
    elif is_legacy_combo:
        default_price = settings.DC_MATRIX_PRICE_INR
        suite_title = "9×9 MATRIX & CHALDEAN VIBRATIONAL ARCHIVE"
        receipt_label = f"₹{default_price} INR (9×9 Matrix & Chaldean Sound Archive)"
    else:
        default_price = settings.CHECK_NAME_PRICE_INR
        suite_title = "AUSPICIOUS NAME HARMONIZATION DOSSIER"
        receipt_label = f"₹{default_price} INR (Personalized Name Correction & Auspicious Spellings)"

    amount = str(payment_info.get("amount", default_price)) if payment_info else str(default_price)

    # Extract pillars if available
    comp_num = "-"
    root_num = "-"
    driver_num = "-"
    driver_planet = "-"
    conductor_num = "-"
    conductor_planet = "-"
    tier_label = "Personalized Numerology Analysis"
    stars_str = "★★★★★"
    suit_reason = ""
    friendly_nums = ""
    good_nums = ""
    enemy_nums = ""
    dc_match = ""
    raw_d = 1
    raw_c = 1
    nd: Dict[str, Any] = {}
    dd: Dict[str, Any] = {}
    cd: Dict[str, Any] = {}
    st: Dict[str, Any] = {}
    mat: List[int] = []

    if analysis_data:
        nd = analysis_data.get("name_details", {})
        dd = analysis_data.get("driver_details", {})
        cd = analysis_data.get("conductor_details", {})
        st = analysis_data.get("suitability", {})
        mat = analysis_data.get("matrix_recommendations", [])

        raw_d = dd.get("driver_number", 1)
        raw_c = cd.get("conductor_number", 1)

        comp_num = str(nd.get("compound_number", "-"))
        root_num = str(nd.get("root_number", "-"))
        driver_num = f"{raw_d} (Day {dd.get('day', '-')})"
        driver_planet = dd.get("planet_name", "-")
        conductor_num = f"{raw_c}"
        conductor_planet = cd.get("planet_name", "-")
        tier_label = st.get("status_label", tier_label)
        stars = st.get("stars", 5)
        stars_str = "★" * stars + "☆" * (5 - stars)
        suit_reason = st.get("reason", "")
        friendly_nums = ", ".join(map(str, dd.get("friendly_numbers", [])))
        good_nums = ", ".join(map(str, dd.get("good_best_numbers", [])))
        enemy_nums = ", ".join(map(str, dd.get("enemy_numbers", [])))
        dc_match = f"[{', '.join(map(str, mat))}]" if mat else "-"

    # Compute or enhance birth vibrations from dob if available
    conductor_step_detail = f"Conductor {raw_c}"
    if dob:
        try:
            from app.numerology.calculations import calculate_driver_number, calculate_conductor_number
            d_calc = calculate_driver_number(dob)
            c_calc = calculate_conductor_number(dob)
            raw_d = d_calc.get("driver_number", raw_d)
            raw_c = c_calc.get("conductor_number", raw_c)
            steps = c_calc.get("reduction_steps", [])
            conductor_step_detail = f"{' &rarr; '.join(map(str, steps))}" if len(steps) > 1 else f"{raw_c}"
            if driver_planet == "-":
                driver_planet = PLANET_NAME_LOOKUP.get(raw_d, "Sun")
            if conductor_planet == "-":
                conductor_planet = PLANET_NAME_LOOKUP.get(raw_c, "Jupiter")
            driver_num = f"{raw_d} (Day {d_calc.get('day', '-')})"
            conductor_num = f"{raw_c} ({conductor_step_detail})"
        except Exception:
            pass

    # Build sections strictly based on purchased product
    # 1. Name Suggestions section (Only for check_name / name reports)
    name_suggestions_section = ""
    if is_name_report:
        suggestions_cards_html = ""
        if suggestions:
            for idx, item in enumerate(suggestions, 1):
                stars_variant = "★" * item.get("stars", 5)
                suggestions_cards_html += f"""
                <div style="background: #111422; border: 1px solid #d4af37; border-radius: 12px; padding: 18px; margin-bottom: 14px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 8px;">
                    <tr>
                      <td align="left">
                        <span style="font-family: 'Georgia', serif; font-size: 18px; font-weight: bold; color: #f5c542; letter-spacing: 1px;">
                          {idx}. {item.get('name', '')}
                        </span>
                      </td>
                      <td align="right">
                        <span style="color: #f5c542; font-size: 14px;">{stars_variant}</span>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size: 13px; color: #e2d9c8; margin-bottom: 8px;">
                    <strong>Chaldean Vibration:</strong> Compound {item.get('compound_number', '')} &rarr; Root <strong style="color: #f5c542;">{item.get('root_number', '')}</strong>
                  </div>
                  <div style="font-size: 13px; color: #b8af9e; line-height: 1.5;">
                    {item.get('reason', '')}
                  </div>
                </div>
                """
        else:
            suggestions_cards_html = """
            <p style="color: #9e9686; font-size: 13px; font-style: italic;">
              Personalized Auspicious Name Spelling Variations have been recorded for your birth profile.
            </p>
            """

        name_suggestions_section = f"""
        <tr>
          <td style="padding: 20px 32px 10px;">
            <div style="background: linear-gradient(135deg, rgba(20,24,38,0.9), rgba(13,16,24,0.95)); border: 1.5px solid #d4af37; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding: 6px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #9e9686; letter-spacing: 1px;">Driver Number (Mulank)</div>
                    <div style="font-family: 'Georgia', serif; font-size: 22px; font-weight: bold; color: #38bdf8; margin: 4px 0 2px;">{driver_num}</div>
                    <div style="font-size: 12px; color: #f5c542;">Ruled by {driver_planet}</div>
                  </td>
                  <td width="50%" style="padding: 6px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #9e9686; letter-spacing: 1px;">Conductor Number (Bhagyank / Destiny)</div>
                    <div style="font-family: 'Georgia', serif; font-size: 22px; font-weight: bold; color: #c084fc; margin: 4px 0 2px;">{conductor_num}</div>
                    <div style="font-size: 12px; color: #f5c542;">Ruled by {conductor_planet}</div>
                  </td>
                </tr>
              </table>
              <div style="font-size: 12px; color: #d6cfbe; margin-top: 10px; border-top: 1px dashed rgba(212,175,55,0.3); padding-top: 8px;">
                ✦ All auspicious spelling recommendations below are specifically harmonized to empower your <strong>Driver {raw_d}</strong> and <strong>Conductor {raw_c}</strong> frequencies.
              </div>
            </div>
            <div style="font-family: 'Georgia', serif; font-size: 17px; font-weight: bold; color: #f5c542; margin-bottom: 14px; border-left: 3px solid #d4af37; padding-left: 10px;">
              Auspicious Name Spelling Recommendations (Personalized Variations)
            </div>
            {suggestions_cards_html}
          </td>
        </tr>
        """

    # 2. 9x9 DC Matrix Section (Only for dc_matrix or legacy combo)
    matrix_section = ""
    if is_matrix or is_legacy_combo:
        matrix_section = f"""
        <!-- 9x9 DC Matrix Natal Synergy Highlight -->
        <tr>
          <td style="padding: 20px 32px 10px;">
            <div style="font-family: 'Georgia', serif; font-size: 17px; font-weight: bold; color: #c084fc; margin-bottom: 12px; border-left: 3px solid #c084fc; padding-left: 10px;">
              9×9 DC Power Matrix — Natal Synergy Explorer
            </div>
            <div style="background: linear-gradient(135deg, rgba(192,132,252,0.12), rgba(245,197,66,0.08)); border: 1.5px solid #c084fc; border-radius: 12px; padding: 18px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 12px; text-transform: uppercase; color: #c084fc; font-weight: bold; letter-spacing: 1px;">
                      Active Natal Combination
                    </div>
                    <div style="font-family: 'Georgia', serif; font-size: 20px; font-weight: bold; color: #f5c542; margin: 4px 0 8px;">
                      Driver {raw_d} &amp; Conductor {raw_c} Synergy
                    </div>
                    <div style="font-size: 14px; color: #e2d9c8; line-height: 1.5;">
                      Recommended Name Vibrations: <strong style="color: #34d399; font-size: 16px;">{dc_match}</strong>
                    </div>
                    <div style="font-size: 12px; color: #9e9686; margin-top: 6px;">
                      Derived via the sacred 81-intersection symmetric Driver &amp; Conductor power matrix.
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        """

    # 3. Chaldean Alphabet & Personal Breakdown Section (Only for chaldean_chart or legacy combo)
    chaldean_section = ""
    if is_chart or is_legacy_combo:
        # Build personal letter breakdown chips
        letter_chips_html = ""
        breakdown_items = nd.get("letter_breakdown", [])
        if not breakdown_items and name:
            try:
                from app.numerology.calculations import calculate_name_number
                calc_res = calculate_name_number(name)
                breakdown_items = calc_res.get("letter_breakdown", [])
                comp_num = str(calc_res.get("compound_number", comp_num))
                root_num = str(calc_res.get("root_number", root_num))
            except Exception:
                pass

        if breakdown_items:
            chips = []
            for item in breakdown_items:
                ch = item.get("char", "")
                val = item.get("value", 0)
                chips.append(
                    f'<span style="display: inline-block; background: #111422; border: 1.5px solid #d4af37; border-radius: 8px; padding: 6px 12px; margin: 4px; text-align: center; min-width: 24px;">'
                    f'<span style="font-size: 16px; font-weight: bold; color: #fdfbf7; display: block;">{ch}</span>'
                    f'<span style="font-size: 12px; color: #f5c542; display: block; margin-top: 2px;">{val}</span>'
                    f'</span>'
                )
            letter_chips_html = "".join(chips)

        personal_block = ""
        if letter_chips_html:
            personal_block = f"""
            <!-- Personalized Name Chaldean Frequency Breakdown -->
            <tr>
              <td style="padding: 15px 32px 10px;">
                <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #f5c542; margin-bottom: 10px; border-left: 3px solid #d4af37; padding-left: 10px;">
                  ✦ Chaldean Sound Frequency Analysis for "{name.upper()}"
                </div>
                <div style="background: #111422; border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 18px; margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #b8af9e; margin-bottom: 10px;">
                    Letter-by-letter Babylonian sound vibration frequencies:
                  </div>
                  <div style="margin-bottom: 14px;">
                    {letter_chips_html}
                  </div>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid rgba(212,175,55,0.2); padding-top: 10px; text-align: center;">
                    <tr>
                      <td width="33%" style="font-size: 13px; color: #e2d9c8;">
                        Compound: <strong style="color: #f5c542; font-size: 15px;">{comp_num}</strong>
                      </td>
                      <td width="33%" style="font-size: 13px; color: #e2d9c8;">
                        Root Number: <strong style="color: #34d399; font-size: 15px;">{root_num}</strong>
                      </td>
                      <td width="33%" style="font-size: 13px; color: #e2d9c8;">
                        Ruling: <strong style="color: #f5c542; font-size: 13px;">{driver_planet}</strong>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            """

        # Build alphabet grid rows (2 columns of 4)
        alpha_rows_html = ""
        for i in range(0, len(CHALDEAN_ALPHABET_EMAIL), 2):
            c1 = CHALDEAN_ALPHABET_EMAIL[i]
            c2 = CHALDEAN_ALPHABET_EMAIL[i + 1] if i + 1 < len(CHALDEAN_ALPHABET_EMAIL) else None
            c2_content = ""
            if c2 is not None:
                c2_content = f"""
                <div style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 18px; font-weight: bold; color: #f5c542;">{c2['num']}</span> &nbsp;&mdash;&nbsp;
                  <span style="font-size: 13px; color: #fdfbf7; font-weight: bold; letter-spacing: 1px;">{c2['letters']}</span>
                </div>
                """
            alpha_rows_html += f"""
            <tr>
              <td width="50%" style="padding: 6px;">
                <div style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 18px; font-weight: bold; color: #f5c542;">{c1['num']}</span> &nbsp;&mdash;&nbsp;
                  <span style="font-size: 13px; color: #fdfbf7; font-weight: bold; letter-spacing: 1px;">{c1['letters']}</span>
                </div>
              </td>
              <td width="50%" style="padding: 6px;">
                {c2_content}
              </td>
            </tr>
            """

        chaldean_section = f"""
        {personal_block}
        <!-- Chaldean Alphabet Vibration Table -->
        <tr>
          <td style="padding: 10px 32px 15px;">
            <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #f5c542; margin-bottom: 10px; border-left: 3px solid #d4af37; padding-left: 10px;">
              Chaldean Sacred Vibrational Alphabet Chart (1–8)
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              {alpha_rows_html}
            </table>
          </td>
        </tr>
        """

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Numerology O Fortune Dossier</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #fdfbf7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07080b; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="640" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; background: #0d1018; border: 1.5px solid #d4af37; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #181c2c 0%, #0d1018 100%); padding: 35px 25px 25px; border-bottom: 1px solid rgba(212,175,55,0.3);">
              <div style="font-family: 'Georgia', serif; font-size: 22px; font-weight: bold; letter-spacing: 2.5px; color: #f5c542; text-transform: uppercase;">
                NUMEROLOGY O FORTUNE
              </div>
              <div style="font-size: 11px; letter-spacing: 2px; color: #d8cfbc; text-transform: uppercase; margin-top: 5px;">
                {suite_title}
              </div>
            </td>
          </tr>

          <!-- Profile Snapshot -->
          <tr>
            <td style="padding: 28px 32px 10px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #121624; border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 18px;">
                <tr>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #f5c542;">Name:</strong> {name}
                  </td>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #f5c542;">Date of Birth:</strong> {dob}
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #38bdf8;">Driver (Mulank):</strong> {driver_num} &bull; {driver_planet}
                  </td>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #c084fc;">Conductor (Bhagyank):</strong> {conductor_num} &bull; {conductor_planet}
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #f5c542;">Gender:</strong> {gender}
                  </td>
                  <td width="50%" style="font-size: 14px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #f5c542;">Issue Date:</strong> {date_str}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Verification Evidence -->
          <tr>
            <td style="padding: 10px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.35); border-radius: 10px; padding: 14px;">
                <tr>
                  <td style="font-size: 13px; color: #34d399;">
                    <strong>&#10003; Payment Verified &amp; Secured:</strong> {receipt_label}
                    <div style="font-size: 12px; color: #a7f3d0; margin-top: 4px;">
                      Razorpay Payment Reference: <code>{pay_id}</code> &bull; Lifetime Personal Access Evidence
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {name_suggestions_section}
          {matrix_section}
          {chaldean_section}

          <!-- Certificate Blessing Note -->
          <tr>
            <td style="padding: 10px 32px 25px;">
              <div style="background: #141828; border: 1px dashed rgba(212,175,55,0.4); border-radius: 12px; padding: 16px; text-align: center;">
                <p style="font-family: 'Georgia', serif; font-style: italic; font-size: 13.5px; color: #f5c542; line-height: 1.6; margin: 0;">
                  &ldquo;May your harmonized vibrational frequency bestow prosperity, mental clarity, and unimpeded spiritual and material growth.&rdquo;
                </p>
                <div style="font-size: 11px; color: #8e8779; margin-top: 8px;">
                  Numerology O Fortune System
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background: #08090f; padding: 24px; border-top: 1px solid rgba(212,175,55,0.25);">
              <p style="font-size: 12px; color: #8c8577; margin: 0 0 6px;">
                &copy; 2026 Numerology O Fortune. All Rights Reserved.
              </p>
              <p style="font-size: 11px; color: #6b6457; margin: 0 0 10px;">
                Inspired by Chaldean numerology principles.
              </p>
              <p style="font-size: 10px; color: #524d43; line-height: 1.4; margin: 0; max-width: 500px;">
                Numerology is a traditional metaphysical practice. Results are intended for personal guidance and are not scientifically validated.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return html


def _send_email_sync(
    to_email: str,
    subject: str,
    html_content: str,
) -> bool:
    """Synchronous sender using standard smtplib for reliability."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Numerology O Fortune <{settings.MAIL_FROM}>"
        msg["To"] = to_email

        # Attach HTML
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        host = settings.SMTP_HOST
        port = settings.SMTP_PORT
        user = settings.SMTP_USER
        password = settings.SMTP_PASSWORD

        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(settings.MAIL_FROM, [to_email], msg.as_string())

        logger.info("Numerology report email sent successfully to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc, exc_info=True)
        return False


async def send_numerology_report_email(
    to_email: str,
    subject: str,
    name: str,
    dob: str,
    gender: str = "Male",
    analysis_data: Optional[Dict[str, Any]] = None,
    suggestions: Optional[List[Dict[str, Any]]] = None,
    payment_info: Optional[Dict[str, Any]] = None,
    report_type: str = "harmonization",
) -> bool:
    """
    Asynchronously triggers email sending in a background thread to prevent blocking.
    """
    if not to_email or "@" not in to_email:
        logger.warning("Invalid destination email: %s", to_email)
        return False

    html = generate_email_html(
        name=name,
        dob=dob,
        gender=gender,
        analysis_data=analysis_data,
        suggestions=suggestions,
        payment_info=payment_info,
        report_type=report_type,
    )

    return await asyncio.to_thread(_send_email_sync, to_email, subject, html)


# Alias for backwards compatibility
send_report_email = send_numerology_report_email


def generate_gemstone_order_email_html(
    customer_name: str,
    phone: str,
    email: str,
    address: str,
    city: str,
    state: str,
    pincode: str,
    product_name: str,
    product_id: str,
    gemstones: str,
    mulank: str,
    dob: str,
    wrist_size: str,
    order_id: str,
    payment_id: str,
    amount_paid: int = 1499,
) -> str:
    """
    Generates a luxury 24K Gold & Obsidian HTML order confirmation & tax receipt
    for sacred gemstone bracelet purchases.
    """
    date_str = datetime.now().strftime("%B %d, %Y - %I:%M %p IST")
    clean_name = customer_name.strip() if customer_name else "Honored Seeker"
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sacred Order Confirmation — {product_name}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #080706;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E8E2D5;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      background: radial-gradient(circle at 50% 0%, #1c150c 0%, #080706 70%);
      padding: 40px 15px;
      box-sizing: border-box;
    }}
    .container {{
      max-width: 640px;
      margin: 0 auto;
      background-color: #120e0a;
      border: 1.5px solid #D4AF37;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.2);
    }}
    .header {{
      background: linear-gradient(135deg, #22180c 0%, #352512 50%, #22180c 100%);
      padding: 35px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    }}
    .brand-title {{
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #FFFFFF;
      margin: 0 0 6px 0;
    }}
    .brand-sub {{
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #D4AF37;
      margin: 0;
    }}
    .content {{
      padding: 35px 30px;
    }}
    .badge-paid {{
      display: inline-block;
      background: rgba(37, 211, 102, 0.15);
      border: 1px solid #25D366;
      color: #25D366;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    .greeting {{
      font-size: 20px;
      color: #FFFFFF;
      margin: 0 0 14px 0;
      font-weight: 700;
    }}
    .intro-text {{
      font-size: 14px;
      line-height: 1.6;
      color: #C7BFA7;
      margin-bottom: 25px;
    }}
    .receipt-box {{
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }}
    .receipt-row {{
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
    }}
    .receipt-row:last-child {{
      border-bottom: none;
    }}
    .label {{
      color: #9E9584;
    }}
    .val {{
      color: #FFFFFF;
      font-weight: 600;
      text-align: right;
    }}
    .highlight-gold {{
      color: #F4DFB0;
      font-size: 16px;
      font-weight: 700;
    }}
    .section-title {{
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #D4AF37;
      margin: 25px 0 12px 0;
      border-bottom: 1px dashed rgba(212, 175, 55, 0.2);
      padding-bottom: 6px;
    }}
    .details-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }}
    .details-table td {{
      padding: 8px 0;
      vertical-align: top;
    }}
    .details-table td.col-lbl {{
      color: #9E9584;
      width: 38%;
    }}
    .details-table td.col-val {{
      color: #FFFFFF;
      font-weight: 500;
    }}
    .ritual-box {{
      background: linear-gradient(135deg, rgba(29, 23, 15, 0.8), rgba(18, 14, 10, 0.8));
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 10px;
      padding: 16px;
      margin: 25px 0;
      font-size: 12.5px;
      color: #D0C6B0;
      line-height: 1.6;
    }}
    .no-login-note {{
      background: rgba(212, 175, 55, 0.08);
      border-left: 3px solid #D4AF37;
      padding: 12px 16px;
      font-size: 12px;
      color: #F4DFB0;
      margin-bottom: 25px;
      line-height: 1.5;
    }}
    .btn-wa {{
      display: block;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      text-align: center;
      padding: 14px 20px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin: 25px 0 10px 0;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
    }}
    .footer {{
      background: #090806;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 25px 30px;
      text-align: center;
      font-size: 11px;
      color: #7D7566;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <h1 class="brand-title">NUMEROLOGY FORTUNE</h1>
        <p class="brand-sub">Sacred Gemstone Atelier • Consecrated Talismans</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        
        <div style="text-align: center;">
          <span class="badge-paid">✓ PAID VIA RAZORPAY — CONSECRATION IN PROGRESS</span>
        </div>

        <h2 class="greeting">Hari Om, {clean_name}! 🙏</h2>
        <p class="intro-text">
          Thank you for choosing <strong>Numerology Fortune</strong>. Your sacred order has been confirmed and consecrated in your name. We have successfully received your payment of <strong>₹{amount_paid}/-</strong> via Razorpay.
        </p>

        <!-- Receipt Box -->
        <div class="receipt-box">
          <div class="receipt-row">
            <span class="label">Razorpay Order ID:</span>
            <span class="val" style="font-family: monospace;">{order_id}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Razorpay Payment ID:</span>
            <span class="val" style="font-family: monospace; color: #25D366;">{payment_id}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Transaction Date:</span>
            <span class="val">{date_str}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Total Paid (Inclusive of all taxes):</span>
            <span class="val highlight-gold">₹{amount_paid}/- INR</span>
          </div>
        </div>

        <!-- No Login Note for Future Reference -->
        <div class="no-login-note">
          📌 <strong>Future Reference (No Login Required):</strong> Please keep this email and your <strong>Order ID ({order_id})</strong> saved for tracking, insured warranty, and transit coordination. You do not need to create or remember any account passwords!
        </div>

        <!-- Product Details -->
        <div class="section-title">✦ Consecrated Product Specifications</div>
        <table class="details-table">
          <tr>
            <td class="col-lbl">Product Item:</td>
            <td class="col-val"><strong>{product_name}</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Product SKU / ID:</td>
            <td class="col-val" style="color: #D4AF37;">{product_id}</td>
          </tr>
          <tr>
            <td class="col-lbl">Sacred Mulank / Planet:</td>
            <td class="col-val">Mulank {mulank}</td>
          </tr>
          <tr>
            <td class="col-lbl">Natural Crystals:</td>
            <td class="col-val">{gemstones}</td>
          </tr>
          <tr>
            <td class="col-lbl">Birth Date for Consecration:</td>
            <td class="col-val">{dob or "General Auspicious Consecration"}</td>
          </tr>
          <tr>
            <td class="col-lbl">Wrist Size:</td>
            <td class="col-val">{wrist_size}</td>
          </tr>
        </table>

        <!-- Shipping Address Details -->
        <div class="section-title">✦ Insured Delivery Address</div>
        <table class="details-table">
          <tr>
            <td class="col-lbl">Recipient Name:</td>
            <td class="col-val">{clean_name}</td>
          </tr>
          <tr>
            <td class="col-lbl">Contact Phone:</td>
            <td class="col-val">{phone}</td>
          </tr>
          <tr>
            <td class="col-lbl">Delivery Street:</td>
            <td class="col-val">{address}</td>
          </tr>
          <tr>
            <td class="col-lbl">City & State:</td>
            <td class="col-val">{city}, {state} — PIN: {pincode}</td>
          </tr>
        </table>

        <!-- Consecration Ritual Info -->
        <div class="ritual-box">
          🕉️ <strong>Vedic Pran Pratishtha Ritual:</strong><br>
          Your gemstone beads are currently undergoing the 3-step sacred consecration ceremony:
          (1) Ganga Jal & Himalayan Salt cleansing, (2) 108 recitations of the ruling planetary Beej Mantra, and (3) Personalized Sankalpa in your name & birth date. Your package will include a physical <em>Certificate of Consecration & Authenticity</em> inside the luxury presentation velvet box.
        </div>

        <!-- WhatsApp Support Action -->
        <a href="https://api.whatsapp.com/send?phone=919836394217&text=Hello%20Numerology%20Fortune%2C%20my%20Paid%20Order%20ID%20is%20{order_id}.%20Please%20confirm%20dispatch%20timeline." 
           class="btn-wa" target="_blank">
          📲 Connect on WhatsApp for Live Dispatch Tracking (+91 98363 94217)
        </a>

      </div>

      <!-- Footer -->
      <div class="footer">
        © {datetime.now().year} Numerology Fortune. All Rights Reserved.<br>
        Vedic Gemstone Atelier & Planetary Harmonization Services.<br>
        WhatsApp Support: +91 98363 94217 | Email: {settings.MAIL_FROM}
      </div>

    </div>
  </div>
</body>
</html>"""


async def send_gemstone_order_email(
    to_email: str,
    customer_name: str,
    phone: str,
    address: str,
    city: str,
    state: str,
    pincode: str,
    product_name: str,
    product_id: str,
    gemstones: str,
    mulank: str,
    dob: str,
    wrist_size: str,
    order_id: str,
    payment_id: str,
    amount_paid: int = 1499,
) -> bool:
    """
    Asynchronously sends an official order confirmation & tax receipt email
    for gemstone bracelet purchases.
    """
    if not to_email or "@" not in to_email:
        logger.warning("Invalid destination email for gemstone order: %s", to_email)
        return False

    subject = f"✦ Order Confirmed: {product_name} ({product_id}) — Consecration in Progress"

    html = generate_gemstone_order_email_html(
        customer_name=customer_name,
        phone=phone,
        email=to_email,
        address=address,
        city=city,
        state=state,
        pincode=pincode,
        product_name=product_name,
        product_id=product_id,
        gemstones=gemstones,
        mulank=mulank,
        dob=dob,
        wrist_size=wrist_size,
        order_id=order_id,
        payment_id=payment_id,
        amount_paid=amount_paid,
    )

    return await asyncio.to_thread(_send_email_sync, to_email, subject, html)


