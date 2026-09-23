# Numerology O Fortune — Chaldean Numerology Web Application

A full-stack Chaldean Numerology web application with 24K gold cosmic UI, AI-powered auspicious name suggestions (Google Gemini), official Razorpay checkout integration, automated SMTP email dossier delivery, and comprehensive 9×9 Driver-Conductor matrix analysis.

---

## 🚀 Quick Start (Running on Any PC)

### Windows (1-Click Run)
Simply double-click:
```bat
run.bat
```
This script will automatically:
1. Detect Python
2. Create a clean virtual environment (`.venv`)
3. Install all required dependencies (`pip install -r requirements.txt`)
4. Start the server at **http://localhost:3000**

---

### macOS / Linux (1-Click Run)
Make the script executable and run:
```bash
chmod +x run.sh
./run.sh
```

---

### Manual Setup (Any OS)
1. **Open terminal** in this folder:
   ```bash
   cd numerology-fortune
   ```

2. **Create & activate virtual environment**:
   - **Windows**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration (.env)

The `.env` file contains your application configuration:
- `GEMINI_API_KEY`: Google Gemini API key for name analysis & suggestion generation.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay payment gateway credentials.
- `SMTP_USER` & `SMTP_PASSWORD`: Gmail App Password for sending branded HTML dossiers to customers.
- `HARMONIZATION_PRICE_INR`: Pricing for Package 1 (Default: ₹99).
- `MATRIX_CHART_PRICE_INR`: Pricing for Package 2 Combo (Default: ₹199).

---

## 🧪 Running Tests
To run the automated test suite (76 tests):
```bash
pytest tests/
```
