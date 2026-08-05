import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PredictionService:
    def predict_turnover(self, employee_data):
        risk_score = employee_data.get("risk_score", 50)
        probability = risk_score / 100.0
        if probability >= 0.7:
            risk_level = "HIGH"
        elif probability >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        return {"probability": round(probability, 3), "risk_level": risk_level, "predicted_turnover": probability > 0.5}
    
    def batch_predict_turnover(self, employees):
        predictions = []
        for emp in employees:
            predictions.append({"employee_id": emp.get("id"), "employee_name": emp.get("name"), **self.predict_turnover(emp)})
        return {"predictions": predictions}