"""
Talent service for TalentPulse
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from models.talent import Talent, TalentStatus
from schemas.talent import TalentCreate, TalentUpdate
from fastapi import HTTPException, status


class TalentService:
    """
    Service for managing talents
    """

    def __init__(self):
        pass

    def get_all_talents(self, db: Session, skip: int = 0, limit: int = 100) -> List[Talent]:
        """Get all talents with pagination"""
        return db.query(Talent).offset(skip).limit(limit).all()

    def get_talent_by_id(self, db: Session, talent_id: int) -> Optional[Talent]:
        """Get a talent by ID"""
        return db.query(Talent).filter(Talent.id == talent_id).first()

    def get_talent_by_email(self, db: Session, email: str) -> Optional[Talent]:
        """Get a talent by email"""
        return db.query(Talent).filter(Talent.email == email).first()

    def create_talent(self, db: Session, talent_data: TalentCreate, user_id: Optional[int] = None) -> Talent:
        """Create a new talent"""
        # Check if email already exists
        existing_talent = self.get_talent_by_email(db, talent_data.email)
        if existing_talent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un talent avec cet email existe déjà",
            )

        talent_dict = talent_data.model_dump()
        talent_dict["user_id"] = user_id

        db_talent = Talent(**talent_dict)
        db.add(db_talent)
        db.commit()
        db.refresh(db_talent)
        return db_talent

    def update_talent(self, db: Session, talent_id: int, talent_data: TalentUpdate) -> Optional[Talent]:
        """Update a talent"""
        db_talent = self.get_talent_by_id(db, talent_id)
        if not db_talent:
            return None

        update_data = talent_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_talent, key, value)

        db.commit()
        db.refresh(db_talent)
        return db_talent

    def delete_talent(self, db: Session, talent_id: int) -> bool:
        """Delete a talent"""
        db_talent = self.get_talent_by_id(db, talent_id)
        if not db_talent:
            return False

        db.delete(db_talent)
        db.commit()
        return True

    def search_talents(self, db: Session, query: str, limit: int = 50) -> List[Talent]:
        """Search talents by name, email, position, or department"""
        like = f"%{query}%"
        return db.query(Talent).filter(
            (Talent.first_name.ilike(like)) |
            (Talent.last_name.ilike(like)) |
            (Talent.email.ilike(like)) |
            (Talent.position.ilike(like)) |
            (Talent.department.ilike(like))
        ).order_by(Talent.turnover_risk.desc()).limit(limit).all()

    def get_talents_at_risk(self, db: Session, min_risk: float = 0.7) -> List[Talent]:
        """Get talents with high turnover risk, most at risk first"""
        return db.query(Talent).filter(
            Talent.turnover_risk >= min_risk
        ).order_by(Talent.turnover_risk.desc()).all()

    # --- Aliases / aggregates used by the HTTP layer -------------------------
    # The routes layer calls these names; they are kept thin and explicit so
    # the public API contract and the service API cannot drift apart again.

    def get_talent(self, db: Session, talent_id: int) -> Optional[Talent]:
        """Alias of get_talent_by_id (public API name)."""
        return self.get_talent_by_id(db, talent_id)

    def get_at_risk_talents(self, db: Session, min_risk: float = 0.7) -> List[Talent]:
        """Alias of get_talents_at_risk (public API name)."""
        return self.get_talents_at_risk(db, min_risk=min_risk)

    def get_talent_stats(self, db: Session) -> Dict[str, object]:
        """
        Aggregate workforce statistics exposed on GET /api/talents/stats.

        `active` / `at_risk` / `turnover` are status counts; the `avg_*`
        values are 0-1 scores so the frontend can format them with pct().
        """
        total = db.query(func.count(Talent.id)).scalar() or 0

        status_counts = dict(
            db.query(Talent.status, func.count(Talent.id)).group_by(Talent.status).all()
        )
        # Enum keys come back as TalentStatus members on some drivers and as
        # plain strings on others — normalise both to the raw value.
        def _count(status_value: TalentStatus) -> int:
            for key, value in status_counts.items():
                raw = key.value if isinstance(key, TalentStatus) else key
                if raw == status_value.value:
                    return int(value)
            return 0

        avg_performance = db.query(func.avg(Talent.performance_score)).scalar() or 0.0
        avg_engagement = db.query(func.avg(Talent.engagement_score)).scalar() or 0.0
        avg_satisfaction = db.query(func.avg(Talent.satisfaction_score)).scalar() or 0.0
        avg_turnover_risk = db.query(func.avg(Talent.turnover_risk)).scalar() or 0.0

        departments = dict(
            db.query(Talent.department, func.count(Talent.id))
            .filter(Talent.department.isnot(None))
            .group_by(Talent.department)
            .all()
        )

        at_risk_count = (
            db.query(func.count(Talent.id)).filter(Talent.turnover_risk >= 0.7).scalar() or 0
        )

        return {
            "total": int(total),
            "active": _count(TalentStatus.ACTIVE),
            "at_risk": int(at_risk_count),
            "turnover": _count(TalentStatus.TURNOVER),
            "inactive": _count(TalentStatus.INACTIVE),
            "avg_performance": round(float(avg_performance), 4),
            "avg_engagement": round(float(avg_engagement), 4),
            "avg_satisfaction": round(float(avg_satisfaction), 4),
            "avg_turnover_risk": round(float(avg_turnover_risk), 4),
            "departments": departments,
        }


talent_service = TalentService()
