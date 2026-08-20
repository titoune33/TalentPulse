"""
Audit log service TalentPulse
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import logging

from models.audit_log import AuditLog

logger = logging.getLogger('talentpulse')


class AuditService:
    def __init__(self):
        self.enabled = True  # Can be disabled via env var

    def log(self, db: Session, user_id: Optional[int], action: str,
            resource_type: Optional[str] = None, resource_id: Optional[str] = None,
            details: Optional[str] = None, request: Optional[object] = None):
        if not self.enabled:
            return
        try:
            ip = request.client.host if request and request.client else None
            ua = request.headers.get('user-agent') if request else None
            entry = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                ip_address=ip,
                user_agent=ua,
            )
            db.add(entry)
            db.commit()
        except Exception as e:
            logger.error(f'Audit log failed: {e}')

    def list_logs(self, db: Session, user_id: Optional[int] = None,
                  limit: int = 100, offset: int = 0):
        query = db.query(AuditLog)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()


audit_service = AuditService()
