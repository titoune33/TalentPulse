"""
Prediction service for TalentPulse
Turnover prediction using a RandomForest model trained on synthetic data.
The model is trained automatically on first boot if no model file exists,
so the service works out of the box in any environment.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Tuple
from timeutils import utcnow
from models.talent import Talent, TalentStatus
from models.prediction import Prediction
from datetime import timedelta
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
import random

# Model artifacts live under data/ml/ so they never collide with the
# backend/models/ Python package directory.
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "data", "ml"))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(MODEL_DIR, "turnover_model.pkl"))
SCALER_PATH = os.getenv("SCALER_PATH", os.path.join(MODEL_DIR, "scaler.pkl"))


def _synthetic_dataset(n: int = 600, seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate a synthetic labelled dataset of employees.

    Features (same order as predict_turnover):
      0. performance_score  (0-1)
      1. engagement_score   (0-1)
      2. satisfaction_score (0-1)
      3. experience_years   (0-30)
      4. salary_norm        (salary / 100_000, ~0.3-3)
    """
    rng = np.random.default_rng(seed)

    performance = rng.uniform(0.15, 1.0, n)
    engagement = rng.uniform(0.1, 1.0, n)
    satisfaction = rng.uniform(0.1, 1.0, n)
    experience = rng.uniform(0, 30, n)
    salary_norm = rng.uniform(0.3, 3.0, n)

    # Risk grows with disengagement and dissatisfaction, shrinks with
    # performance, tenure and compensation. Plus noise.
    risk = (
        -0.45 * performance
        - 0.30 * engagement
        - 0.40 * satisfaction
        + 0.15 * np.clip((experience - 2.5) / 10.0, 0, 1)
        + 0.08 * np.clip(10.0 - experience, 0, None) / 10.0
        - 0.12 * (salary_norm - 1.0)
        + rng.normal(0, 0.12, n)
    )
    risk = (risk - risk.min()) / (risk.max() - risk.min())  # normalize to 0-1

    X = np.column_stack([performance, engagement, satisfaction, experience, salary_norm])
    y = (risk > 0.55).astype(int)
    return X, y


def _build_model() -> RandomForestClassifier:
    """Train a fresh model on synthetic data and persist it."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    X, y = _synthetic_dataset()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42)
    model.fit(X_scaled, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    return model, scaler


class PredictionService:
    """Service for turnover predictions."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_or_train()

    def _load_or_train(self):
        """Load persisted artifacts or train a new model."""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                return
        except Exception as e:
            print(f"[talentpulse] Could not load ML model ({e}); retraining.")

        self.model, self.scaler = _build_model()
        print(f"[talentpulse] ML model trained and saved to {MODEL_PATH}")

    def _features(self, talent: Talent) -> np.ndarray:
        """Extract the feature vector for a talent."""
        salary = talent.salary or 50000
        return np.array(
            [
                talent.performance_score or 0.0,
                talent.engagement_score or 0.0,
                talent.satisfaction_score or 0.0,
                talent.experience_years or 0,
                min(salary / 100_000, 5.0),
            ]
        ).reshape(1, -1)

    def predict_turnover(self, talent: Talent) -> Dict[str, Any]:
        """Predict the turnover probability for a talent (0-1)."""
        try:
            features_scaled = self.scaler.transform(self._features(talent))
            probability = float(self.model.predict_proba(features_scaled)[0][1])
            risk_score = round(max(0.0, min(1.0, probability)), 4)
            confidence = float(np.max(self.model.predict_proba(features_scaled)))
        except Exception as e:
            print(f"[talentpulse] Prediction error ({e}); using heuristic fallback.")
            avg = (
                (talent.performance_score or 0)
                + (talent.engagement_score or 0)
                + (talent.satisfaction_score or 0)
            ) / 3
            risk_score = round(max(0.0, min(1.0, 1.0 - avg)), 4)
            confidence = 0.6

        return {
            "probability": risk_score,
            "confidence": round(confidence, 4),
            "risk_score": risk_score,
            "features": {
                "performance": talent.performance_score,
                "engagement": talent.engagement_score,
                "satisfaction": talent.satisfaction_score,
                "experience": talent.experience_years,
                "salary": talent.salary,
            },
        }

    def create_prediction(self, db: Session, talent_id: int, prediction_type: str = "turnover") -> Prediction:
        """Create a prediction record in the database."""
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            raise ValueError("Talent not found")

        data = self.predict_turnover(talent)
        risk_score = data["risk_score"]

        db_prediction = Prediction(
            talent_id=talent_id,
            prediction_type=prediction_type,
            score=risk_score,
            confidence=data["confidence"],
            probability=data["probability"],
            features=data["features"],
            details={"model": "RandomForestClassifier", "version": "2.0"},
            recommendation=self._generate_recommendation(talent, risk_score),
            valid_until=utcnow() + timedelta(days=30),
        )

        db.add(db_prediction)
        db.flush()

        # Keep the talent's risk level in sync
        talent.turnover_risk = risk_score
        talent.status = TalentStatus.AT_RISK if risk_score >= 0.7 else TalentStatus.ACTIVE

        db.commit()
        db.refresh(db_prediction)
        return db_prediction

    # --- Read side used by the HTTP layer -----------------------------------

    def get_all_predictions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Prediction]:
        """List predictions, most recent first."""
        return (
            db.query(Prediction)
            .order_by(Prediction.predicted_at.desc(), Prediction.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_prediction(self, db: Session, prediction_id: int) -> Prediction | None:
        """Fetch a single prediction by id."""
        return db.query(Prediction).filter(Prediction.id == prediction_id).first()

    def get_recent_predictions(self, db: Session, limit: int = 200) -> List[Prediction]:
        """
        Most recent prediction rows, newest first.

        This is the raw history feed the dashboard and the analytics trend
        chart consume, so every row is returned (not deduplicated by talent).
        Use `get_latest_per_talent` for cohort-level figures.
        """
        return (
            db.query(Prediction)
            .order_by(Prediction.predicted_at.desc(), Prediction.id.desc())
            .limit(limit)
            .all()
        )

    def get_latest_per_talent(self, db: Session, limit: int = 1000) -> List[Prediction]:
        """Latest prediction of each talent, newest first (cohort snapshot)."""
        latest_ids = (
            db.query(func.max(Prediction.id))
            .group_by(Prediction.talent_id)
            .scalar_subquery()
        )
        return (
            db.query(Prediction)
            .filter(Prediction.id.in_(latest_ids))
            .order_by(Prediction.predicted_at.desc(), Prediction.id.desc())
            .limit(limit)
            .all()
        )

    def get_talent_predictions(self, db: Session, talent_id: int, limit: int = 100) -> List[Prediction]:
        """Full prediction history for one talent, newest first."""
        return (
            db.query(Prediction)
            .filter(Prediction.talent_id == talent_id)
            .order_by(Prediction.predicted_at.desc(), Prediction.id.desc())
            .limit(limit)
            .all()
        )

    def get_high_risk_predictions(self, db: Session, min_risk: float = 0.7, limit: int = 200) -> List[Prediction]:
        """Current risk picture: latest prediction per talent at or above `min_risk`."""
        return [p for p in self.get_latest_per_talent(db, limit=limit) if p.score >= min_risk]

    def get_prediction_stats(self, db: Session) -> Dict[str, Any]:
        """
        Cohort-level KPIs computed on the latest prediction of each talent,
        so a talent is never counted twice.
        """
        latest = self.get_latest_per_talent(db)
        total = len(latest)
        scores = [p.score for p in latest]
        high = len([s for s in scores if s >= 0.7])
        medium = len([s for s in scores if 0.4 <= s < 0.7])
        low = len([s for s in scores if s < 0.4])

        return {
            "total": total,
            "avg_risk_score": round(sum(scores) / total, 4) if total else 0.0,
            "high_risk": high,
            "medium_risk": medium,
            "low_risk": low,
            "predictions_total": int(db.query(func.count(Prediction.id)).scalar() or 0),
        }

    def _generate_recommendation(self, talent: Talent, risk_score: float) -> str:
        """Generate a recommendation based on the risk score."""
        name = f"{talent.first_name} {talent.last_name}".strip()
        if risk_score >= 0.8:
            return (
                f"Risque élevé : {name} présente un risque de départ de {risk_score*100:.0f}%. "
                "Intervention immédiate recommandée : entretien individuel, revue de la rémunération "
                "et plan de développement personnalisé."
            )
        if risk_score >= 0.6:
            return (
                f"Risque modéré : {name} montre des signes de désengagement ({risk_score*100:.0f}%). "
                "Pensez à des programmes de reconnaissance et des discussions d'évolution de carrière."
            )
        if risk_score >= 0.4:
            return (
                f"Risque faible : {name} est globalement satisfait ({risk_score*100:.0f}%). "
                "Maintenez des points réguliers et des opportunités de croissance."
            )
        return (
            f"Stable : {name} est bien engagé dans son poste ({risk_score*100:.0f}%). "
            "Continuez les pratiques actuelles."
        )

    def train_model(self, X: List[List[float]], y: List[int]) -> Dict[str, Any]:
        """Retrain the ML model (admin use)."""
        try:
            X_arr = np.array(X)
            y_arr = np.array(y)
            self.scaler.fit(X_arr)
            self.model.fit(self.scaler.transform(X_arr), y_arr)
            os.makedirs(MODEL_DIR, exist_ok=True)
            joblib.dump(self.model, MODEL_PATH)
            joblib.dump(self.scaler, SCALER_PATH)
            return {"status": "success", "message": "Model trained successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def retrain_from_database(self, db: Session, min_real_samples: int = 8) -> Dict[str, Any]:
        """
        Retrain the model using this instance's own workforce as ground truth.

        Labelling rule (only real, observable outcomes are used):
          - status TURNOVER            -> positive (the person actually left)
          - status ACTIVE              -> negative (still in the company)
          - status AT_RISK / INACTIVE  -> ignored (model output, not an outcome)

        If there are not enough labelled rows, or only one class is present,
        the model falls back to the synthetic reference dataset so the service
        always ends up with a usable model instead of crashing.
        """
        labelled = db.query(Talent).filter(Talent.status.in_([TalentStatus.TURNOVER, TalentStatus.ACTIVE])).all()
        positives = [t for t in labelled if t.status == TalentStatus.TURNOVER]
        negatives = [t for t in labelled if t.status == TalentStatus.ACTIVE]
        used_synthetic = False

        if len(positives) >= 1 and len(negatives) >= 1 and len(labelled) >= min_real_samples:
            X = np.vstack([self._features(t) for t in labelled])
            y = np.array([1 if t.status == TalentStatus.TURNOVER else 0 for t in labelled])
        else:
            used_synthetic = True
            X, y = _synthetic_dataset()

        try:
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            model = RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42)
            model.fit(X_scaled, y)

            os.makedirs(MODEL_DIR, exist_ok=True)
            joblib.dump(model, MODEL_PATH)
            joblib.dump(scaler, SCALER_PATH)

            # Swap the live artifacts only once both files are safely written.
            self.model = model
            self.scaler = scaler
        except Exception as e:
            return {"status": "error", "message": str(e)}

        return {
            "status": "success",
            "trained_on": "synthetic_reference" if used_synthetic else "customer_data",
            "real_samples": 0 if used_synthetic else len(labelled),
            "positive_samples": 0 if used_synthetic else len(positives),
            "negative_samples": 0 if used_synthetic else len(negatives),
            "message": (
                "Modèle réentraîné sur le jeu de données de référence "
                "(pas assez de départs confirmés dans vos données)."
                if used_synthetic
                else f"Modèle réentraîné sur {len(labelled)} collaborateurs de votre organisation."
            ),
        }


prediction_service = PredictionService()
