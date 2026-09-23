#!/bin/bash
echo "========================================================"
echo "  Starting Numerology O Fortune Server"
echo "========================================================"

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH!"
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "[*] Creating virtual environment (.venv)..."
    python3 -m venv .venv
fi

source .venv/bin/activate
echo "[*] Installing/Verifying dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "========================================================"
echo "  Server is running at: http://localhost:3000"
echo "  Press Ctrl+C to stop the server"
echo "========================================================"
echo ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
