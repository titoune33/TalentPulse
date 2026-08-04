"""
Prediction service for TalentPulse
Turnover prediction using ML models
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from models.talent import Talent
from models.prediction import Prediction
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os


class PredictionService:
    """
    Service for turnover and performance predictions
    """

    def __init__(self):
        self.model_path = "models/turnover_model.pkl"
        self.scaler_path = "models/scaler.pkl"
        self.model = self._load_model()
        self.scaler = self._load_scaler()

    def _load_model(self):
        """Load the trained ML model"""
        try:
            if os.path.exists(self.model_path):
                return joblib.load(self.model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
        
        # Return a default model if not found
        return RandomForestClassifier(n_estimators=100, random_state=42)

    def _load_scaler(self):
        """Load the feature scaler"""
        try:
            if os.path.exists(self.scaler_path):
                return joblib.load(self.scaler_path)
        except Exception as e:
            print(f"Error loading scaler: {e}")
        
        return StandardScaler()

    def predict_turnover(self, talent: Talent) -> Dict[str, Any]:
        """
        Predict turnover probability for a talent
        
        Features used:
        - performance_score
        - engagement_score
        - satisfaction_score
        - experience_years
        - salary (normalized)
        """
        try:
            # Extract features
            features = [
                talent.performance_score or 0,
                talent.engagement_score or 0,
                talent.satisfaction_score or 0,
                talent.experience_years or 0,
                (talent.salary or 50000) / 100000,  # Normalized salary
            ]
            
            # Reshape for prediction
            features_array = np.array(features).reshape(1, -1)
            
            # Scale features
            features_scaled = self.scaler.transform(features_array)
            
            # Make prediction
            prediction = self.model.predict(features_scaled)[0]
            probability = self.model.predict_proba(features_scaled)[0][1]
            
            # Calculate risk score (0-1)
            risk_score = float(probability)
            
            return {
                "prediction": int(prediction),
                "probability": risk_score,
                "confidence": float(np.max(self.model.predict_proba(features_scaled))),
                "risk_score": risk_score,
                "features": {
                    "performance": talent.performance_score,
                    "engagement": talent.engagement_score,
                    "satisfaction": talent.satisfaction_score,
                    "experience": talent.experience_years,
                    "salary": talent.salary,
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            # Fallback prediction
            avg_score = (talent.performance_score + talent.engagement_score + talent.satisfaction_score) / 3
            risk_score = 1.0 - avg_score if avg_score > 0 else 0.5
            return {
                "prediction": 1 if risk_score > 0.7 else 0,
                "probability": risk_score,
                "confidence": 0.7,
                "risk_score": risk_score,
                "features": {},
            }

    def create_prediction(self, db: Session, talent_id: int, prediction_type: str) -> Prediction:
        """Create a prediction record in the database"""
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            raise ValueError("Talent not found")

        # Make prediction
        prediction_data = self.predict_turnover(talent)

        # Create prediction record
        db_prediction = Prediction(
            talent_id=talent_id,
            prediction_type=prediction_type,
            score=prediction_data["risk_score"],
            confidence=prediction_data["confidence"],
            probability=prediction_data["probability"],
            features=prediction_data["features"],
            details={
                "model": "RandomForestClassifier",
                "version": "1.0",
            },
            recommendation=self._generate_recommendation(talent, prediction_data["risk_score"]),
            valid_until=datetime.utcnow() + timedelta(days=30),
        )

        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)

        # Update talent's turnover_risk
        talent.turnover_risk = prediction_data["risk_score"]
        talent.status = self._get_status_from_risk(prediction_data["risk_score"])
        db.commit()

        return db_prediction

    def _generate_recommendation(self, talent: Talent, risk_score: float) -> str:
        """Generate a recommendation based on risk score"""
        if risk_score > 0.8:
            return f"HIGH RISK: {talent.first_name} {talent.last_name} has a {risk_score*100:.1f}% turnover risk. Immediate intervention recommended: schedule 1:1 meeting, review compensation, and assess job satisfaction."
        elif risk_score > 0.6:
            return f"MODERATE RISK: {talent.first_name} {talent.last_name} shows signs of disengagement. Consider recognition programs and career development discussions."
        elif risk_score > 0.4:
            return f"LOW RISK: {talent.first_name} {talent.last_name} is generally satisfied. Maintain regular check-ins and growth opportunities."
        else:
            return f"STABLE: {talent.first_name} {talent.last_name} is well-engaged. Continue current practices."

    def _get_status_from_risk(self, risk_score: float) -> str:
        """Get talent status based on risk score"""
        if risk_score > 0.7:
            return "AT_RISK"
        elif risk_score > 0.4:
            return "ACTIVE"
        else:
            return "ACTIVE"

    def train_model(self, X, y):
        """Train the ML model (for admin use)"""
        try:
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            
            # Save model and scaler
            os.makedirs("models", exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            return {"status": "success", "message": "Model trained successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}


prediction_service = PredictionService()
