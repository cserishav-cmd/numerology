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
    # 1. Default / check_name order (149900 paise = ₹1499)
    response = client.post("/api/payment/create-order", json={
        "name": "Arjun Sharma",
        "dob": "1992-05-14"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "order_id" in data["data"]
    assert data["data"]["amount"] == 149900
    assert data["data"]["currency"] == "INR"
    assert data["data"]["key_id"] == settings.RAZORPAY_KEY_ID

    # 2. Test dc_matrix order (19900 paise = ₹199)
    res_matrix = client.post("/api/payment/create-order", json={
        "name": "Arjun Sharma",
        "dob": "1992-05-14",
        "product_type": "dc_matrix"
    })
    assert res_matrix.status_code == 200
    matrix_data = res_matrix.json()
    assert matrix_data["data"]["amount"] == 19900

    # 3. Test chaldean_chart order (19900 paise = ₹199)
    res_chart = client.post("/api/payment/create-order", json={
        "name": "Arjun Sharma",
        "dob": "1992-05-14",
        "product_type": "chaldean_chart"
    })
    assert res_chart.status_code == 200
    chart_data = res_chart.json()
    assert chart_data["data"]["amount"] == 19900




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

    bad_response = client.post("/api/payment/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": "invalid_bad_signature_12345"
    })
    assert bad_response.status_code == 400


def test_email_exact_output_isolation():
    from app.services.email_service import generate_email_html

    sample_analysis = {
        "name_details": {"compound_number": 35, "root_number": 8},
        "driver_details": {"driver_number": 5, "day": 14, "planet_name": "Mercury"},
        "conductor_details": {"conductor_number": 4, "planet_name": "Rahu"},
        "suitability": {"status_label": "Harmonious", "stars": 5, "reason": "Good"},
        "matrix_recommendations": [1, 5, 6],
    }
    sample_suggestions = [
        {"name": "Rishav A Mallick", "compound": 37, "root": 1, "stars": 5, "reason": "Exemplary"}
    ]

    # 1. check_name: ONLY name suggestions, NO DC matrix, NO Chaldean chart, NO 3 Pillars, NO Planetary Harmony
    html_name = generate_email_html(
        name="Rishav Mallick",
        dob="1992-05-14",
        gender="Male",
        analysis_data=sample_analysis,
        suggestions=sample_suggestions,
        report_type="check_name",
    )
    assert "Auspicious Name Spelling Recommendations" in html_name
    assert "DC Power Matrix" not in html_name
    assert "Chaldean Sacred Vibrational Alphabet Chart" not in html_name
    assert "Core 3 Pillars Breakdown" not in html_name
    assert "Planetary Harmony & Compatibility Matrix" not in html_name

    # 2. dc_matrix: ONLY DC matrix, NO name suggestions, NO Chaldean chart, NO 3 Pillars, NO Planetary Harmony
    html_matrix = generate_email_html(
        name="Rishav Mallick",
        dob="1992-05-14",
        gender="Male",
        analysis_data=sample_analysis,
        suggestions=sample_suggestions,
        report_type="dc_matrix",
    )
    assert "DC Power Matrix" in html_matrix
    assert "Natal Synergy Explorer" in html_matrix
    assert "Auspicious Name Spelling Recommendations" not in html_matrix
    assert "Chaldean Sacred Vibrational Alphabet Chart" not in html_matrix
    assert "Core 3 Pillars Breakdown" not in html_matrix
    assert "Planetary Harmony & Compatibility Matrix" not in html_matrix

    # 3. chaldean_chart: ONLY Chaldean personal breakdown + Alphabet chart, NO name suggestions, NO DC matrix, NO 3 Pillars, NO Planetary Harmony
    html_chart = generate_email_html(
        name="Rishav Mallick",
        dob="1992-05-14",
        gender="Male",
        analysis_data=sample_analysis,
        suggestions=sample_suggestions,
        report_type="chaldean_chart",
    )
    assert "Chaldean Sound Frequency Analysis" in html_chart
    assert "Chaldean Sacred Vibrational Alphabet Chart" in html_chart
    assert "Auspicious Name Spelling Recommendations" not in html_chart
    assert "Planetary Harmony & Compatibility Matrix" not in html_chart


def test_birth_vibrations_calculation_for_user_dob():
    from app.numerology.calculations import calculate_driver_number, calculate_conductor_number
    from app.services.email_service import generate_email_html

    dob = "24-08-2005"
    d_res = calculate_driver_number(dob)
    c_res = calculate_conductor_number(dob)

    # 24 -> 2 + 4 = 6
    assert d_res["driver_number"] == 6
    # 24-08-2005 -> 2+4+0+8+2+0+0+5 = 21 -> 2+1 = 3
    assert c_res["conductor_number"] == 3
    assert c_res["initial_sum"] == 21

    html = generate_email_html(
        name="Rishav",
        dob=dob,
        gender="Male",
        report_type="check_name"
    )
    assert "Driver (Mulank)" in html
    assert "Conductor (Bhagyank" in html
    assert "3" in html
    assert "6" in html



