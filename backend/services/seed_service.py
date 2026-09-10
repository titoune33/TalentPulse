"""
Seed service for TalentPulse
Populates the database with demo data on first boot:
- a demo admin account
- a realistic set of talents across departments
- historical turnover predictions for analytics
"""

from sqlalchemy.orm import Session
from datetime import timedelta
import os
import random
from dotenv import load_dotenv

load_dotenv()

from timeutils import utcnow
from models.user import User, UserRole
from models.talent import Talent, TalentStatus
from models.prediction import Prediction
from services.auth_service import auth_service
from services.prediction_service import prediction_service

DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@talentpulse.app")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "demo1234")

TALENTS = [
    # first, last, email, position, department, salary, experience, performance, engagement, satisfaction, hire offset days
    ("Camille", "Rousseau", "camille.rousseau@talentpulse.app", "Lead Développeuse Full-Stack", "Ingénierie", 78000, 9, 0.92, 0.88, 0.9, 950),
    ("Théo", "Moreau", "theo.moreau@talentpulse.app", "Développeur Backend", "Ingénierie", 62000, 4, 0.8, 0.7, 0.72, 420),
    ("Léa", "Bernard", "lea.bernard@talentpulse.app", "Data Scientist", "Ingénierie", 71000, 6, 0.88, 0.6, 0.55, 700),
    ("Hugo", "Petit", "hugo.petit@talentpulse.app", "DevOps Engineer", "Ingénierie", 68000, 7, 0.75, 0.45, 0.4, 880),
    ("Chloé", "Dubois", "chloe.dubois@talentpulse.app", "Product Manager", "Produit", 72000, 8, 0.85, 0.9, 0.88, 1100),
    ("Nathan", "Leroy", "nathan.leroy@talentpulse.app", "UX Designer", "Produit", 55000, 3, 0.7, 0.55, 0.6, 380),
    ("Emma", "Garcia", "emma.garcia@talentpulse.app", "Cheffe de produit", "Produit", 82000, 10, 0.9, 0.5, 0.45, 1300),
    ("Louis", "Martin", "louis.martin@talentpulse.app", "Growth Manager", "Marketing", 58000, 5, 0.78, 0.75, 0.7, 620),
    ("Jade", "Fournier", "jade.fournier@talentpulse.app", "Content Strategist", "Marketing", 48000, 2, 0.72, 0.8, 0.82, 240),
    ("Gabriel", "Lambert", "gabriel.lambert@talentpulse.app", "Account Executive", "Ventes", 65000, 6, 0.82, 0.35, 0.3, 900),
    ("Manon", "Robert", "manon.robert@talentpulse.app", "Customer Success", "Support", 52000, 4, 0.8, 0.65, 0.68, 500),
    ("Adam", "Fontaine", "adam.fontaine@talentpulse.app", "Support L2", "Support", 42000, 1, 0.65, 0.85, 0.8, 160),
    ("Inès", "Chevalier", "ines.chevalier@talentpulse.app", "Chargée de recrutement", "RH", 50000, 3, 0.76, 0.9, 0.85, 430),
    ("Raphaël", "Garnier", "raphael.garnier@talentpulse.app", "Office Manager", "RH", 45000, 2, 0.7, 0.6, 0.58, 300),
]


def seed_if_empty(db: Session) -> bool:
    """Seed the database with demo data if it is empty. Returns True if seeded."""
    if db.query(User).count() > 0 or db.query(Talent).count() > 0:
        return False

    print("[talentpulse] Seeding demo data...")
    random.seed(42)

    # --- Demo admin user ---
    admin = User(
        email=DEMO_EMAIL,
        name="Démo Admin",
        hashed_password=auth_service.hash_password(DEMO_PASSWORD),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.flush()

    # --- Talents ---
    created_talents = []
    for (
        first, last, email, position, department,
        salary, experience, perf, eng, sat, hire_offset,
    ) in TALENTS:
        talent = Talent(
            first_name=first,
            last_name=last,
            email=email,
            position=position,
            department=department,
            salary=float(salary),
            experience_years=experience,
            performance_score=perf,
            engagement_score=eng,
            satisfaction_score=sat,
            skills=random.sample(
                ["Python", "React", "SQL", "Node.js", "Figma", "Machine Learning",
                 "Docker", "AWS", "Analyse de données", "Gestion de projet",
                 "Communication", "Growth", "SEO", "Copywriting"],
                k=random.randint(3, 5),
            ),
            education=random.choice(["Master", "Bachelor", "Doctorat", "École d'ingénieur"]),
            hire_date=utcnow() - timedelta(days=hire_offset),
            user_id=admin.id,
        )
        db.add(talent)
        created_talents.append(talent)

    db.flush()

    # --- Historical predictions (90 days of history for trend charts) ---
    now = utcnow()
    for talent in created_talents:
        base_risk = prediction_service.predict_turnover(talent)["risk_score"]
        for weeks_ago in range(13, 0, -1):  # 13 weeks back to today
            drift = random.uniform(-0.08, 0.08)
            score = round(max(0.05, min(0.95, base_risk + drift * (weeks_ago / 13))), 4)
            pred = Prediction(
                talent_id=talent.id,
                prediction_type="turnover",
                score=score,
                confidence=round(random.uniform(0.75, 0.97), 3),
                probability=score,
                features={
                    "performance": talent.performance_score,
                    "engagement": talent.engagement_score,
                    "satisfaction": talent.satisfaction_score,
                    "experience": talent.experience_years,
                    "salary": talent.salary,
                },
                details={"model": "RandomForestClassifier", "version": "2.0", "seeded": True},
                recommendation=prediction_service._generate_recommendation(talent, score),
                predicted_at=now - timedelta(weeks=weeks_ago),
                valid_until=now + timedelta(days=30),
            )
            db.add(pred)

        # Sync the talent's current risk level
        latest = prediction_service.predict_turnover(talent)
        talent.turnover_risk = latest["risk_score"]
        talent.status = TalentStatus.AT_RISK if latest["risk_score"] >= 0.7 else TalentStatus.ACTIVE

    db.commit()
    print(f"[talentpulse] Seeded {len(created_talents)} talents, {len(TALENTS) * 13} predictions.")
    return True
