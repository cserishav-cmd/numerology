import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.numerology.calculations import calculate_name_number, load_chaldean_chart
from app.numerology.suitability import check_suitability, PLANET_TABLE, DC_MATRIX
from app.numerology.variant_generation import generate_and_rank_variants
from app.services.payment import (
    create_razorpay_order,
    verify_razorpay_signature,
    record_verified_payment,
    is_payment_verified,
)
from app.services.email_service import send_numerology_report_email
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["numerology"])

class CreateOrderRequest(BaseModel):
    name: Optional[str] = Field(None, description="User full name")
    dob: Optional[str] = Field(None, description="Date of birth")
    email: Optional[str] = Field(None, description="User contact email")
    contact: Optional[str] = Field(None, description="User phone number")
    amount: Optional[int] = Field(None, description="Amount in paise")
    product_type: Optional[str] = Field("harmonization", description="'harmonization' (99) or 'matrix_chart' (199)")

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(..., description="Razorpay Order ID")
    razorpay_payment_id: str = Field(..., description="Razorpay Payment ID")
    razorpay_signature: str = Field(..., description="HMAC SHA256 Signature")
    name: Optional[str] = Field(None, description="User full name")
    dob: Optional[str] = Field(None, description="User date of birth")
    email: Optional[str] = Field(None, description="Customer email address")
    gender: Optional[str] = Field("Male", description="Gender")
    send_email: Optional[bool] = Field(True, description="Whether to dispatch email dossier")
    product_type: Optional[str] = Field("harmonization", description="'harmonization' or 'matrix_chart'")
    analysis_data: Optional[dict] = Field(None, description="Analysis snapshot")
    suggestions: Optional[list] = Field(None, description="Suggested names")

class SendEmailRequest(BaseModel):
    email: str = Field(..., description="Target email address")
    name: str = Field(..., description="User full name")
    dob: str = Field(..., description="User date of birth")
    gender: Optional[str] = Field("Male", description="Gender")
    payment_id: Optional[str] = Field("Direct", description="Payment reference")
    amount: Optional[int] = Field(99, description="Amount in INR")
    analysis_data: Optional[dict] = Field(None, description="Analysis snapshot")
    suggestions: Optional[list] = Field(None, description="Generated suggestions")
    product_type: Optional[str] = Field("harmonization", description="Report type")



class CheckSuitabilityRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Person's full name")
    dob: str = Field(..., min_length=8, description="Date of birth (YYYY-MM-DD or DD/MM/YYYY)")
    gender: Optional[str] = Field(None, description="Gender (Male, Female, Non-Binary, Other)")

class GenerateVariantsRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Person's full name")
    dob: str = Field(..., min_length=8, description="Date of birth (YYYY-MM-DD or DD/MM/YYYY)")
    gender: Optional[str] = Field(None, description="Gender")
    limit: Optional[int] = Field(5, ge=1, le=100, description="Max number of variants")
    payment_id: Optional[str] = Field(None, description="Verified Razorpay Payment ID")

class QuickCalcRequest(BaseModel):
    text: str = Field(..., description="Text or custom name to calculate Chaldean value for")

@router.post("/payment/create-order")
async def api_create_order(req: CreateOrderRequest):
    try:
        product_type = req.product_type or "harmonization"
        amount = (
            settings.MATRIX_CHART_PRICE_PAISE
            if product_type == "matrix_chart"
            else settings.HARMONIZATION_PRICE_PAISE
        )

        notes = {"product_type": product_type}
        if req.name:
            notes["customer_name"] = req.name
        if req.dob:
            notes["dob"] = req.dob
        if req.email:
            notes["email"] = req.email

        order = await create_razorpay_order(
            amount_in_paise=amount,
            currency="INR",
            notes=notes
        )
        order["product_type"] = product_type
        return {
            "success": True,
            "data": order
        }
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to initialize payment gateway.")

@router.post("/payment/verify")
async def api_verify_payment(req: VerifyPaymentRequest):
    try:
        # Verify cryptographic signature
        is_valid = verify_razorpay_signature(
            order_id=req.razorpay_order_id,
            payment_id=req.razorpay_payment_id,
            signature=req.razorpay_signature
        )

        if not is_valid:
            logger.warning(
                "Signature verification rejected for order %s and payment %s",
                req.razorpay_order_id,
                req.razorpay_payment_id
            )
            raise HTTPException(status_code=400, detail="Invalid payment signature. Verification failed.")

        product_type = req.product_type or "harmonization"
        amount_paid = settings.MATRIX_CHART_PRICE_INR if product_type == "matrix_chart" else settings.HARMONIZATION_PRICE_INR

        record = record_verified_payment(
            order_id=req.razorpay_order_id,
            payment_id=req.razorpay_payment_id,
            client_data={
                "name": req.name,
                "dob": req.dob,
                "email": req.email,
                "product_type": product_type
            }
        )

        # Automated Email Dispatch if email was provided and consent granted
        email_sent = False
        if req.email and req.send_email and "@" in req.email:
            try:
                analysis_data = req.analysis_data
                if not analysis_data and req.name and req.dob:
                    analysis_data = check_suitability(req.name, req.dob, req.gender or "Male")

                suggestions = req.suggestions
                if not suggestions and req.name and req.dob:
                    try:
                        max_limit = 5
                        var_res = await generate_and_rank_variants(
                            original_name=req.name,
                            dob=req.dob,
                            gender=req.gender or "Male",
                            max_results=max_limit
                        )
                        suggestions = var_res.get("suggestions", [])
                    except Exception as var_err:
                        logger.warning(f"Could not auto-generate variants for email: {var_err}")

                subject_title = (
                    "✦ Your Numerology O Fortune Master All-In-One Combo Dossier"
                    if product_type == "matrix_chart"
                    else "✦ Your Numerology O Fortune Auspicious Name Dossier & Evidence"
                )
                email_sent = await send_numerology_report_email(
                    to_email=req.email,
                    subject=subject_title,
                    name=req.name or "Seeker",
                    dob=req.dob or "",
                    gender=req.gender or "Male",
                    analysis_data=analysis_data,
                    suggestions=suggestions,
                    payment_info={
                        "payment_id": req.razorpay_payment_id,
                        "order_id": req.razorpay_order_id,
                        "amount": amount_paid
                    },
                    report_type=product_type
                )
            except Exception as mail_err:
                logger.error("Error dispatching automated dossier email: %s", mail_err)

        return {
            "success": True,
            "message": "Payment verified successfully.",
            "data": {
                "order_id": req.razorpay_order_id,
                "payment_id": req.razorpay_payment_id,
                "amount": amount_paid,
                "product_type": product_type,
                "email_sent": email_sent,
                "status": "paid"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying Razorpay payment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error verifying payment receipt.")

@router.post("/payment/send-email")
async def api_send_email_dossier(req: SendEmailRequest):
    try:
        product_type = req.product_type or "harmonization"
        subject = (
            "✦ Your Numerology O Fortune 9×9 Matrix & Master Chart Dossier"
            if product_type == "matrix_chart"
            else "✦ Your Numerology O Fortune Auspicious Name Dossier & Evidence"
        )
        
        analysis_data = req.analysis_data
        if not analysis_data and req.name and req.dob:
            analysis_data = check_suitability(req.name, req.dob, req.gender or "Male")

        suggestions = req.suggestions
        if not suggestions and req.name and req.dob:
            try:
                max_limit = 5
                var_res = await generate_and_rank_variants(
                    original_name=req.name,
                    dob=req.dob,
                    gender=req.gender or "Male",
                    max_results=max_limit
                )
                suggestions = var_res.get("suggestions", [])
            except Exception as var_err:
                logger.warning(f"Could not auto-generate variants for resend email: {var_err}")

        sent = await send_numerology_report_email(
            to_email=req.email,
            subject=subject,
            name=req.name,
            dob=req.dob,
            gender=req.gender or "Male",
            analysis_data=analysis_data,
            suggestions=suggestions,
            payment_info={"payment_id": req.payment_id, "amount": req.amount},
            report_type=product_type
        )
        if sent:
            return {"success": True, "message": f"Dossier successfully sent to {req.email}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to deliver email. Please verify the address.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error sending dossier email: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to send email dossier.")



@router.post("/check")
async def api_check_suitability(req: CheckSuitabilityRequest):
    try:
        result = check_suitability(name=req.name, dob=req.dob, gender=req.gender)
        return {"success": True, "data": result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in api_check_suitability: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to calculate numerology suitability.")

@router.post("/variants")
async def api_generate_variants(req: GenerateVariantsRequest):
    try:
        result = await generate_and_rank_variants(
            original_name=req.name,
            dob=req.dob,
            gender=req.gender,
            max_results=min(req.limit or 5, 5)
        )
        return {"success": True, "data": result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in api_generate_variants: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate name variants.")

@router.post("/quick-calc")
async def api_quick_calc(req: QuickCalcRequest):
    try:
        calc_result = calculate_name_number(req.text)
        return {"success": True, "data": calc_result}
    except Exception as e:
        logger.error(f"Error in quick calc: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to calculate name number.")

@router.get("/chart")
async def api_get_chart():
    return {
        "success": True,
        "data": {
            "chaldean_chart": load_chaldean_chart(),
            "planet_table": PLANET_TABLE
        }
    }

@router.get("/matrix")
async def api_get_matrix():
    return {
        "success": True,
        "data": DC_MATRIX
    }

@router.get("/config")
async def api_get_public_config():
    """
    Exposes non-sensitive public runtime configuration (Razorpay Key ID and package prices)
    so changes in .env are dynamically fetched by the frontend UI and checkout logic.
    Secret credentials (RAZORPAY_KEY_SECRET, SMTP_PASSWORD, GEMINI_API_KEY) remain strictly protected.
    """
    return {
        "success": True,
        "data": {
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "harmonization_price_inr": settings.HARMONIZATION_PRICE_INR,
            "harmonization_price_paise": settings.HARMONIZATION_PRICE_PAISE,
            "matrix_chart_price_inr": settings.MATRIX_CHART_PRICE_INR,
            "matrix_chart_price_paise": settings.MATRIX_CHART_PRICE_PAISE,
        }
    }
