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
    is_combo = report_type == "matrix_chart"
    amount = str(payment_info.get("amount", settings.MATRIX_CHART_PRICE_INR if is_combo else settings.HARMONIZATION_PRICE_INR)) if payment_info else (str(settings.MATRIX_CHART_PRICE_INR) if is_combo else str(settings.HARMONIZATION_PRICE_INR))
    suite_title = "MASTER ALL-IN-ONE COMBO DOSSIER" if is_combo else "AUSPICIOUS NAME HARMONIZATION DOSSIER"
    receipt_label = f"₹{amount} INR (All-Inclusive Combo: Name Alignment + 9×9 Matrix & Master Archive)" if is_combo else f"₹{amount} INR (Auspicious Name Alignment & 3–5 Variations)"

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

    # Build suggestions HTML
    suggestions_html = ""
    if suggestions:
        for idx, item in enumerate(suggestions, 1):
            stars_variant = "★" * item.get("stars", 5)
            suggestions_html += f"""
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
        suggestions_html = """
        <p style="color: #9e9686; font-size: 13px; font-style: italic;">
          Personalized Auspicious Name Spelling Variations have been recorded for your birth profile.
        </p>
        """

    # Extra Combo Section for ₹199
    combo_matrix_section = ""
    if is_combo:
        # Build planetary table rows
        planet_rows_html = ""
        for p in PLANET_EMAIL_TABLE:
            planet_rows_html += f"""
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="padding: 8px; color: #f5c542; font-weight: bold;">{p['num']}</td>
              <td style="padding: 8px; color: #fdfbf7; font-weight: bold;">{p['planet']}</td>
              <td style="padding: 8px; color: #fb7185;">{p['enemy']}</td>
              <td style="padding: 8px; color: #38bdf8;">{p['friendly']}</td>
              <td style="padding: 8px; color: #34d399; font-weight: bold;">{p['good']}</td>
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

        combo_matrix_section = f"""
        <!-- 9x9 DC Matrix Natal Synergy Highlight -->
        <tr>
          <td style="padding: 20px 32px 10px;">
            <div style="font-family: 'Georgia', serif; font-size: 17px; font-weight: bold; color: #c084fc; margin-bottom: 12px; border-left: 3px solid #c084fc; padding-left: 10px;">
              9×9 DC Power Matrix — Your Natal Synergy
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

        <!-- Chaldean Alphabet Vibration Table -->
        <tr>
          <td style="padding: 15px 32px 10px;">
            <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #f5c542; margin-bottom: 10px; border-left: 3px solid #d4af37; padding-left: 10px;">
              Chaldean Alphabet Vibration Table (1–8)
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              {alpha_rows_html}
            </table>
          </td>
        </tr>

        <!-- 9 Planetary Archetypes Table -->
        <tr>
          <td style="padding: 15px 32px 15px;">
            <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #f5c542; margin-bottom: 10px; border-left: 3px solid #d4af37; padding-left: 10px;">
              9 Planetary Archetypes &amp; Vibrational Compatibility
            </div>
            <div style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 12px; overflow-x: auto;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1.5px solid #d4af37; color: #f5c542;">
                    <th style="padding: 8px;">#</th>
                    <th style="padding: 8px;">Planet</th>
                    <th style="padding: 8px;">Enemy</th>
                    <th style="padding: 8px;">Friendly</th>
                    <th style="padding: 8px;">Best Vibrations</th>
                  </tr>
                </thead>
                <tbody>
                  {planet_rows_html}
                </tbody>
              </table>
            </div>
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

          <!-- 3 Pillars Breakdown -->
          <tr>
            <td style="padding: 20px 32px 10px;">
              <div style="font-family: 'Georgia', serif; font-size: 17px; font-weight: bold; color: #f5c542; margin-bottom: 12px; border-left: 3px solid #d4af37; padding-left: 10px;">
                Core Vibrational Pillars
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="text-align: center;">
                <tr>
                  <!-- Pillar 1 -->
                  <td width="32%" style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 16px 8px;">
                    <div style="font-size: 11px; color: #9e9686; text-transform: uppercase;">Name Number</div>
                    <div style="font-family: 'Georgia', serif; font-size: 28px; font-weight: bold; color: #f5c542; margin: 4px 0;">{root_num}</div>
                    <div style="font-size: 11px; color: #d8cfbc;">Compound {comp_num}</div>
                  </td>
                  <td width="2%">&nbsp;</td>
                  <!-- Pillar 2 -->
                  <td width="32%" style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 16px 8px;">
                    <div style="font-size: 11px; color: #9e9686; text-transform: uppercase;">Driver Number</div>
                    <div style="font-family: 'Georgia', serif; font-size: 28px; font-weight: bold; color: #38bdf8; margin: 4px 0;">{driver_num}</div>
                    <div style="font-size: 11px; color: #d8cfbc;">{driver_planet}</div>
                  </td>
                  <td width="2%">&nbsp;</td>
                  <!-- Pillar 3 -->
                  <td width="32%" style="background: #111422; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 16px 8px;">
                    <div style="font-size: 11px; color: #9e9686; text-transform: uppercase;">Conductor Number</div>
                    <div style="font-family: 'Georgia', serif; font-size: 28px; font-weight: bold; color: #c084fc; margin: 4px 0;">{conductor_num}</div>
                    <div style="font-size: 11px; color: #d8cfbc;">{conductor_planet}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Planetary Harmony Matrix -->
          <tr>
            <td style="padding: 15px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #111422; border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 14px;">
                <tr>
                  <td width="50%" style="font-size: 13px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #38bdf8;">Friendly Numbers:</strong> {friendly_nums}
                  </td>
                  <td width="50%" style="font-size: 13px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #34d399;">Good / Best Numbers:</strong> {good_nums}
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="font-size: 13px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #fb7185;">Enemy Numbers:</strong> {enemy_nums}
                  </td>
                  <td width="50%" style="font-size: 13px; color: #b8af9e; padding: 6px;">
                    <strong style="color: #c084fc;">D/C Optimal Match:</strong> {dc_match}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Generated Suggestions (Included in both plans) -->
          <tr>
            <td style="padding: 20px 32px 10px;">
              <div style="font-family: 'Georgia', serif; font-size: 17px; font-weight: bold; color: #f5c542; margin-bottom: 14px; border-left: 3px solid #d4af37; padding-left: 10px;">
                {'Curated Auspicious Name Recommendations (Top Harmonic Variations)' if is_combo else 'Auspicious Name Spelling Recommendations (Personalized Variations)'}
              </div>
              {suggestions_html}
            </td>
          </tr>

          <!-- Extra Combo Content (Only included in ₹199 plan) -->
          {combo_matrix_section}

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
