import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class EmployeeService:
    def __init__(self):
        self.employees = {}
    
    def calculate_risk_score(self, employee_data):
        score = 0
        if employee_data.get("hire_date"):
            hire_date = datetime.fromisoformat(employee_data["hire_date"])
            tenure_days = (datetime.utcnow() - hire_date).days
            if tenure_days < 90:
                score += 30
            elif tenure_days < 365:
                score += 15
        return min(max(score, 0), 100)
    
    def get_status_from_score(self, score):
        if score >= 70:
            return "HIGH_RISK"
        elif score >= 40:
            return "AT_RISK"
        else:
            return "STABLE"
    
    def create_employee(self, employee_data, user_id):
        employee_id = f"emp_{len(self.employees) + 1}"
        risk_score = self.calculate_risk_score(employee_data)
        status = self.get_status_from_score(risk_score)
        employee = {
            "id": employee_id,
            "user_id": user_id,
            "name": employee_data.get("name", ""),
            "email": employee_data.get("email", ""),
            "role": employee_data.get("role", ""),
            "risk_score": risk_score,
            "status": status,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        self.employees[employee_id] = employee
        return employee
    
    def get_employees(self, user_id):
        return [e for e in self.employees.values() if e["user_id"] == user_id]
    
    def predict_turnover(self, employee_id, user_id):
        if employee_id not in self.employees:
            return None
        employee = self.employees[employee_id]
        if employee["user_id"] != user_id:
            return None
        probability = employee["risk_score"] / 100.0
        return {"probability": probability, "risk_level": employee["status"]}
    
    def batch_predict(self, user_id):
        predictions = []
        for emp_id, emp in self.employees.items():
            if emp["user_id"] != user_id:
                continue
            predictions.append({"employee_id": emp_id, **self.predict_turnover(emp_id, user_id)})
        return {"predictions": predictions}