"""
Talent service for TalentPulse
"""

from sqlalchemy.orm import Session
from typing import List, Optional
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
                detail="Talent with this email already exists",
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
        """Search talents by name or email"""
        return db.query(Talent).filter(
            (Talent.first_name.ilike(f"%{query}%")) |
            (Talent.last_name.ilike(f"%{query}%")) |
            (Talent.email.ilike(f"%{query}%"))
        ).limit(limit).all()

    def get_talents_at_risk(self, db: Session, min_risk: float = 0.7) -> List[Talent]:
        """Get talents with high turnover risk"""
        return db.query(Talent).filter(
            Talent.turnover_risk >= min_risk,
            Talent.status == TalentStatus.ACTIVE
        ).order_by(Talent.turnover_risk.desc()).all()


talent_service = TalentService()
