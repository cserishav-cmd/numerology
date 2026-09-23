import hashlib
import hmac
import pytest
from starlette.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.payment import (
    verify_razorpay_signature,
    record_verified_payment,
    is_payment_verified,
)

client = TestClient(app)

def test_verify_razorpay_signature():
    order_id = "order_test_12345"
    payment_id = "pay_test_67890"
    secret = settings.RAZORPAY_KEY_SECRET

    message = f"{order_id}|{payment_id}".encode("utf-8")
    valid_sig = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()

    # Valid signature must pass
    assert verify_razorpay_signature(order_id, payment_id, valid_sig) is True

    # Tampered signature must fail
    tampered_sig = valid_sig[:-4] + "ffff"
    assert verify_razorpay_signature(order_id, payment_id, tampered_sig) is False

    # Empty values must fail
    assert verify_razorpay_signature("", payment_id, valid_sig) is False
    assert verify_razorpay_signature(order_id, "", valid_sig) is False


def test_api_payment_order_create():
    response = client.post("/api/payment/create-order", json={
        "name": "Arjun Sharma",
        "dob": "1992-05-14"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "order_id" in data["data"]
    assert data["data"]["amount"] == 9900
    assert data["data"]["currency"] == "INR"
    assert data["data"]["key_id"] == settings.RAZORPAY_KEY_ID

    # Test matrix_chart order (19900 paise = ₹199)
    res_matrix = client.post("/api/payment/create-order", json={
        "name": "Arjun Sharma",
        "dob": "1992-05-14",
        "product_type": "matrix_chart"
    })
    assert res_matrix.status_code == 200
    matrix_data = res_matrix.json()
    assert matrix_data["data"]["amount"] == 19900



def test_api_payment_verify_flow():
    order_id = "order_audit_987"
    payment_id = "pay_audit_987"
    secret = settings.RAZORPAY_KEY_SECRET

    message = f"{order_id}|{payment_id}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()

    # Successful verification
    response = client.post("/api/payment/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature,
        "name": "Arjun Sharma",
        "dob": "1992-05-14"
    })
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["payment_id"] == payment_id
    assert is_payment_verified(order_id) is True
    assert is_payment_verified(payment_id) is True

    # Bad signature should return 400
    bad_response = client.post("/api/payment/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": "invalid_bad_signature_12345"
    })
    assert bad_response.status_code == 400
