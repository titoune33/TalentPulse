"""
Airtable service for TalentPulse
Replaces the old airtable.py with a more robust implementation
"""

import os
from typing import List, Dict, Any, Optional
from pyairtable import Table, Airtable
from dotenv import load_dotenv

load_dotenv()


class AirtableService:
    """
    Service for interacting with Airtable
    """

    def __init__(self):
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.base_id = os.getenv("AIRTABLE_BASE_ID", "app4Zc99qp0nMqdo7")
        
        # Initialize Airtable client
        self.airtable = Airtable(self.base_id, self.api_key)
        
        # Table references
        self.users_table = self.airtable.table("Users")
        self.talents_table = self.airtable.table("Talents")
        self.predictions_table = self.airtable.table("Predictions")

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email from Airtable"""
        try:
            records = self.users_table.all()
            for record in records:
                if record.get("fields", {}).get("Email") == email:
                    return {"id": record.get("id"), **record.get("fields", {})}
            return None
        except Exception as e:
            print(f"Error in get_user_by_email: {e}")
            return None

    def create_user(self, email: str, name: str, password: str, role: str = "EMPLOYEE", company: str = None) -> Dict[str, Any]:
        """Create a new user in Airtable"""
        try:
            data = {
                "Email": email,
                "Name": name,
                "Password": password,
                "Role": role,
                "Company": company,
                "Is Active": True
            }
            record = self.users_table.create(data)
            return {"id": record.get("id"), **record.get("fields", {})}
        except Exception as e:
            print(f"Error in create_user: {e}")
            raise e

    def get_all_talents(self) -> List[Dict[str, Any]]:
        """Get all talents from Airtable"""
        try:
            records = self.talents_table.all()
            return [{"id": record.get("id"), **record.get("fields", {})} for record in records]
        except Exception as e:
            print(f"Error in get_all_talents: {e}")
            return []

    def get_talent_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a talent by email from Airtable"""
        try:
            records = self.talents_table.all()
            for record in records:
                if record.get("fields", {}).get("Email") == email:
                    return {"id": record.get("id"), **record.get("fields", {})}
            return None
        except Exception as e:
            print(f"Error in get_talent_by_email: {e}")
            return None

    def create_talent(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new talent in Airtable"""
        try:
            record = self.talents_table.create(data)
            return {"id": record.get("id"), **record.get("fields", {})}
        except Exception as e:
            print(f"Error in create_talent: {e}")
            raise e

    def update_talent(self, talent_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a talent in Airtable"""
        try:
            record = self.talents_table.update(talent_id, data)
            return {"id": record.get("id"), **record.get("fields", {})}
        except Exception as e:
            print(f"Error in update_talent: {e}")
            raise e

    def delete_talent(self, talent_id: str) -> bool:
        """Delete a talent from Airtable"""
        try:
            self.talents_table.delete(talent_id)
            return True
        except Exception as e:
            print(f"Error in delete_talent: {e}")
            return False

    def get_employees(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all employees for a user from Airtable"""
        try:
            records = self.talents_table.all()
            return [
                {"id": record.get("id"), **record.get("fields", {})}
                for record in records
                if record.get("fields", {}).get("User ID") == user_id
            ]
        except Exception as e:
            print(f"Error in get_employees: {e}")
            return []

    def create_employee(self, user_id: str, name: str, email: str, role: str, department: str = None) -> Dict[str, Any]:
        """Create a new employee in Airtable"""
        try:
            data = {
                "First Name": name.split()[0] if name else "",
                "Last Name": name.split()[-1] if name else "",
                "Email": email,
                "Role": role,
                "Department": department,
                "Turnover Risk": 0,
                "Status": "ACTIVE",
                "User ID": user_id
            }
            record = self.talents_table.create(data)
            return {"id": record.get("id"), **record.get("fields", {})}
        except Exception as e:
            print(f"Error in create_employee: {e}")
            raise e

    def create_prediction(self, talent_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new prediction in Airtable"""
        try:
            record = self.predictions_table.create(data)
            return {"id": record.get("id"), **record.get("fields", {})}
        except Exception as e:
            print(f"Error in create_prediction: {e}")
            raise e

    def get_predictions_by_talent(self, talent_id: str) -> List[Dict[str, Any]]:
        """Get all predictions for a talent from Airtable"""
        try:
            records = self.predictions_table.all()
            return [
                {"id": record.get("id"), **record.get("fields", {})}
                for record in records
                if record.get("fields", {}).get("Talent ID") == talent_id
            ]
        except Exception as e:
            print(f"Error in get_predictions_by_talent: {e}")
            return []


# Initialize the service
airtable_service = AirtableService()
