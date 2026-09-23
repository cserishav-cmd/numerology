import os
import re
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / ".env"
load_dotenv(env_file)

# Supplementary fallback parser for loose VPS key-value formatting (e.g. "samtp pass = ...")
_env_fallbacks = {}
if env_file.exists():
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                match = re.match(r"^([a-zA-Z0-9_\s]+?)\s*=\s*(.*)$", line)
                if match:
                    raw_k = match.group(1).strip().lower()
                    raw_v = match.group(2).strip()
                    # Clean optional quotes
                    if (raw_v.startswith('"') and raw_v.endswith('"')) or (raw_v.startswith("'") and raw_v.endswith("'")):
                        raw_v = raw_v[1:-1]
                    _env_fallbacks[raw_k] = raw_v
    except Exception:
        pass

def get_env_val(*keys, default=""):
    """
    Looks up standard os.environ first, then checks normalized key aliases.
    """
    for k in keys:
        val = os.getenv(k)
        if val is not None and val != "":
            return val
        norm_k = k.strip().lower()
        if norm_k in _env_fallbacks:
            return _env_fallbacks[norm_k]
    return default

class Settings:
    APP_ENV: str = get_env_val("APP_ENV", default="development")

    # Gemini AI Engine Configuration (Dynamically configured via .env)
    GEMINI_API_KEY: str = get_env_val("GEMINI_API_KEY", default="")
    GEMINI_BASE_URL: str = get_env_val("GEMINI_BASE_URL", default="https://generativelanguage.googleapis.com/v1beta")
    GEMINI_MODEL: str = get_env_val("GEMINI_MODEL")

    PORT: int = int(get_env_val("PORT", default="3000"))
    HOST: str = get_env_val("HOST", default="0.0.0.0")

    # Razorpay Payment Gateway Configuration (Dynamically configured via .env)
    RAZORPAY_KEY_ID: str = get_env_val("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = get_env_val("RAZORPAY_KEY_SECRET")

    # Dynamic Package Pricing (INR and Paise, configured via .env)
    HARMONIZATION_PRICE_INR: int = int(get_env_val("HARMONIZATION_PRICE_INR", default="99"))
    HARMONIZATION_PRICE_PAISE: int = int(
        get_env_val(
            "HARMONIZATION_PRICE_PAISE",
            default=str(int(get_env_val("HARMONIZATION_PRICE_INR", default="99")) * 100)
        )
    )
    MATRIX_CHART_PRICE_INR: int = int(get_env_val("MATRIX_CHART_PRICE_INR", default="199"))
    MATRIX_CHART_PRICE_PAISE: int = int(
        get_env_val(
            "MATRIX_CHART_PRICE_PAISE",
            default=str(int(get_env_val("MATRIX_CHART_PRICE_INR", default="199")) * 100)
        )
    )

    # SMTP Configuration (Change anytime in .env on VPS; supports aliases like 'samtp pass' or 'mail from')
    SMTP_HOST: str = get_env_val("SMTP_HOST", default="smtp.gmail.com")
    SMTP_PORT: int = int(get_env_val("SMTP_PORT", default="587"))
    SMTP_USER: str = get_env_val("SMTP_USER", "mail from", default="support.navyavastulife@gmail.com")
    SMTP_PASSWORD: str = get_env_val(
        "SMTP_PASSWORD", "samtp pass", "smtp_pass", "samtp_pass", default="jjfc siyb cekf bhod"
    ).replace(" ", "")
    MAIL_FROM: str = get_env_val(
        "MAIL_FROM", "mail from", "mail_from", default="support.navyavastulife@gmail.com"
    ).strip()

    DATA_DIR: Path = BASE_DIR / "app" / "data"

settings = Settings()
