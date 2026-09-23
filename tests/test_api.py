import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_chart():
    response = client.get("/api/chart")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "chaldean_chart" in data["data"]
    assert "planet_table" in data["data"]

def test_api_matrix():
    response = client.get("/api/matrix")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "1" in data["data"]
    assert "9" in data["data"]

def test_api_check_suitability():
    payload = {
        "name": "SUBRATA HALDAR",
        "dob": "16/07/1990",
        "gender": "Male"
    }
    response = client.post("/api/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    res = data["data"]
    assert res["name_details"]["root_number"] == 8
    assert res["driver_details"]["driver_number"] == 7
    assert res["suitability"]["tier"] == "poor"

def test_api_quick_calc():
    response = client.post("/api/quick-calc", json={"text": "RISHAV"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # R(2) + I(1) + S(3) + H(5) + A(1) + V(6) = 18 -> 9
    assert data["data"]["compound_number"] == 18
    assert data["data"]["root_number"] == 9
