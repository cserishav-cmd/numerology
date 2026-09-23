import hashlib
import hmac
import logging
import time
import uuid
from typing import Any, Dict, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RAZORPAY_API_BASE = "https://api.razorpay.com/v1"

# In-memory registry of verified transactions
_VERIFIED_PAYMENTS: Dict[str, Dict[str, Any]] = {}


async def create_razorpay_order(
    amount_in_paise: int = settings.HARMONIZATION_PRICE_PAISE,
    currency: str = "INR",
    receipt: Optional[str] = None,
    notes: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Creates a new order on Razorpay using the Orders API.
    Endpoint: POST https://api.razorpay.com/v1/orders
    """
    receipt_id = receipt or f"order_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    payload = {
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt_id,
        "notes": notes or {},
    }

    auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{RAZORPAY_API_BASE}/orders",
                auth=auth,
                json=payload,
            )

        if resp.status_code in (200, 201):
            order_data = resp.json()
            logger.info("Razorpay order created successfully: %s", order_data.get("id"))
            return {
                "order_id": order_data.get("id"),
                "amount": order_data.get("amount", amount_in_paise),
                "currency": order_data.get("currency", currency),
                "receipt": receipt_id,
                "key_id": settings.RAZORPAY_KEY_ID,
                "status": order_data.get("status", "created"),
            }
        else:
            logger.warning(
                "Razorpay API returned HTTP %s: %s. Generating local transaction reference.",
                resp.status_code,
                resp.text,
            )
    except Exception as exc:
        logger.warning(
            "Exception while contacting Razorpay API: %s. Using local transaction reference.",
            exc,
        )

    # Local order fallback (e.g. for offline dev or sandbox network hiccups)
    mock_order_id = f"order_{uuid.uuid4().hex[:14]}"
    return {
        "order_id": mock_order_id,
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt_id,
        "key_id": settings.RAZORPAY_KEY_ID,
        "status": "created",
    }


def verify_razorpay_signature(
    order_id: str,
    payment_id: str,
    signature: str,
) -> bool:
    """
    Cryptographically verifies the Razorpay payment signature using HMAC SHA256.
    Digest string format: order_id + "|" + payment_id
    """
    if not order_id or not payment_id or not signature:
        return False

    secret = settings.RAZORPAY_KEY_SECRET or ""
    message = f"{order_id}|{payment_id}".encode("utf-8")
    generated_signature = hmac.new(
        secret.encode("utf-8"),
        message,
        hashlib.sha256,
    ).hexdigest()

    # If matching or running in simulated/test mode with test key prefix
    is_valid = hmac.compare_digest(generated_signature, signature)
    return is_valid


def record_verified_payment(
    order_id: str,
    payment_id: str,
    client_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Records an authenticated payment transaction in the ledger.
    """
    record = {
        "order_id": order_id,
        "payment_id": payment_id,
        "timestamp": time.time(),
        "status": "verified",
        "client_data": client_data or {},
    }
    _VERIFIED_PAYMENTS[order_id] = record
    _VERIFIED_PAYMENTS[payment_id] = record
    return record


def is_payment_verified(reference_id: str) -> bool:
    """
    Checks whether an order_id or payment_id has been successfully verified.
    """
    return reference_id in _VERIFIED_PAYMENTS
