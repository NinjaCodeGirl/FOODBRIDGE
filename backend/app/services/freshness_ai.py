import hashlib
import json
import logging
from datetime import datetime, timezone
from app.config import settings
from app.models.schemas import FreshnessEvaluationResult

logger = logging.getLogger(__name__)

# Attempt to configure Gemini AI client with fallback model list
gemini_model = None
if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        for model_candidate in ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro']:
            try:
                gemini_model = genai.GenerativeModel(model_candidate)
                break
            except Exception:
                continue
    except Exception as e:
        logger.warning(f"Could not initialize Gemini AI model: {e}")

class AzureFreshnessAIEngine:
    """
    AI-Powered Freshness & Shelf-Life Assessment Service.
    Combines Gemini AI natural language food inspection with physical temperature
    decay curves to evaluate remaining shelf life, allergen tags, and safety scores.
    """
    
    BASE_SHELF_LIFE = {
        "COOKED_MEALS": 6.0,  # 6 hours at room temp
        "BAKERY": 24.0,       # 24 hours
        "PRODUCE": 48.0,      # 48 hours
        "PACKAGED": 72.0,     # 72 hours
        "DAIRY": 12.0         # 12 hours
    }
    
    STORAGE_MULTIPLIERS = {
        "REFRIGERATED": 2.5,
        "HEATED": 1.2,
        "ROOM_TEMP": 1.0
    }

    @classmethod
    def evaluate_freshness(
        cls,
        food_title: str,
        food_category: str,
        preparation_timestamp: datetime,
        storage_condition: str,
        classification: str = "CATEGORY_A",
        ambient_temp_c: float = 28.0
    ) -> FreshnessEvaluationResult:
        # Calculate elapsed hours since preparation
        now = datetime.now(timezone.utc)
        if preparation_timestamp.tzinfo is None:
            preparation_timestamp = preparation_timestamp.replace(tzinfo=timezone.utc)
            
        elapsed_hours = (now - preparation_timestamp).total_seconds() / 3600.0
        elapsed_hours = max(0.1, elapsed_hours)

        # Calculate base shelf life adjusted by storage
        base = cls.BASE_SHELF_LIFE.get(food_category, 6.0)
        multiplier = cls.STORAGE_MULTIPLIERS.get(storage_condition, 1.0)
        
        # Category B (Cold Chain Required) penalty if stored at room temp
        if classification == "CATEGORY_B" and storage_condition == "ROOM_TEMP":
            multiplier *= 0.4 # Significant shelf life drop for cold-chain items left out
            
        total_shelf_life = base * multiplier
        remaining_hours = max(0.0, total_shelf_life - elapsed_hours)
        
        # Base Freshness Score (0 to 100)
        score = (remaining_hours / total_shelf_life) * 100.0
        score = round(min(100.0, max(0.0, score)), 2)

        # Default allergen and recommendation inference
        allergens = []
        lower_title = food_title.lower()
        if any(w in lower_title for w in ["paneer", "milk", "cheese", "curd", "butter", "cream", "makhani"]):
            allergens.append("Dairy")
        if any(w in lower_title for w in ["roti", "bread", "naan", "wheat", "flour", "pasta", "cake"]):
            allergens.append("Gluten")
        if any(w in lower_title for w in ["peanut", "nut", "cashew", "almond"]):
            allergens.append("Nuts")
        if any(w in lower_title for w in ["egg", "omelette"]):
            allergens.append("Egg")

        # Try enhancing via Gemini AI if available
        gemini_recommendation = None
        gemini_risk = None
        if gemini_model:
            try:
                prompt = (
                    f"Analyze this surplus food donation for safety and freshness assessment:\n"
                    f"Food Item: {food_title}\n"
                    f"Category: {food_category}\n"
                    f"Storage: {storage_condition}\n"
                    f"Hours since preparation: {round(elapsed_hours, 1)}\n\n"
                    f"Respond ONLY in raw valid JSON format with keys:\n"
                    f'{{"ai_score_adjustment": 0, "risk_level": "LOW|MEDIUM|HIGH|CRITICAL", '
                    f'"allergens": ["Gluten", "Dairy"], "recommendation": "Short safety advice text"}}'
                )
                response = gemini_model.generate_content(prompt)
                resp_text = response.text.strip()
                if "```json" in resp_text:
                    resp_text = resp_text.split("```json")[1].split("```")[0].strip()
                elif "```" in resp_text:
                    resp_text = resp_text.split("```")[1].split("```")[0].strip()
                
                ai_json = json.loads(resp_text)
                if "ai_score_adjustment" in ai_json:
                    score = max(0.0, min(100.0, score + float(ai_json["ai_score_adjustment"])))
                    score = round(score, 2)
                if "allergens" in ai_json and isinstance(ai_json["allergens"], list):
                    allergens = list(set(allergens + ai_json["allergens"]))
                gemini_recommendation = ai_json.get("recommendation")
                gemini_risk = ai_json.get("risk_level")
            except Exception as e:
                logger.warning(f"Gemini API evaluation skipped: {e}")

        # Categorize Safety & Risk
        if score >= 75.0:
            category = "HIGHLY_FRESH"
            risk_level = gemini_risk or "LOW"
            recommendation = gemini_recommendation or "Optimal freshness! Direct distribution to any community shelter."
        elif score >= 45.0:
            category = "MODERATE_RESCUE"
            risk_level = gemini_risk or "MEDIUM"
            recommendation = gemini_recommendation or "Good condition. Priority dispatch within 2 hours recommended."
        elif score >= 20.0:
            category = "URGENT_DISPATCH"
            risk_level = gemini_risk or "HIGH"
            recommendation = gemini_recommendation or "Urgent dispatch needed within 45 mins to immediate nearby shelter."
        else:
            category = "EXPIRED"
            risk_level = "CRITICAL"
            recommendation = gemini_recommendation or "Quality score below safety threshold. Listing auto-blocked."

        # Issue Validation Hash (SHA256)
        raw_payload = f"{food_title}:{food_category}:{preparation_timestamp.isoformat()}:{storage_condition}:{score}:{remaining_hours}"
        validation_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

        return FreshnessEvaluationResult(
            freshness_score=score,
            estimated_shelf_life_hours=round(remaining_hours, 1),
            safety_category=category,
            risk_level=risk_level,
            allergens=allergens,
            validation_hash=validation_hash,
            ai_recommendation=recommendation
        )
