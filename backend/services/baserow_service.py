"""
Baserow service for TalentPulse
Replaces Airtable with Baserow via direct API calls
"""

import os
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()


class BaserowService:
    """
    Service for interacting with Baserow (self-hosted Airtable alternative)
    """

    def __init__(self):
        self.base_url = os.getenv("BASEROW_BASE_URL", "https://api.baserow.io")
        self.api_key = os.getenv("BASEROW_API_KEY")
        self.database_id = os.getenv("BASEROW_DATABASE_ID")
        self.client = httpx.Client()

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Baserow API"""
        return {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "application/json",
        }

    async def get_table_rows(self, table_id: str) -> List[Dict[str, Any]]:
        """Get all rows from a Baserow table"""
        url = f"{self.base_url}/api/database/rows/table/{table_id}/"
        try:
            response = self.client.get(url, headers=self._get_headers())
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            print(f"Error fetching rows from table {table_id}: {e}")
            return []

    async def create_row(self, table_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new row in a Baserow table"""
        url = f"{self.base_url}/api/database/rows/table/{table_id}/"
        try:
            response = self.client.post(url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating row in table {table_id}: {e}")
            raise e

    async def update_row(self, table_id: str, row_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a row in a Baserow table"""
        url = f"{self.base_url}/api/database/rows/table/{table_id}/{row_id}/"
        try:
            response = self.client.patch(url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error updating row {row_id} in table {table_id}: {e}")
            raise e

    async def delete_row(self, table_id: str, row_id: int) -> bool:
        """Delete a row from a Baserow table"""
        url = f"{self.base_url}/api/database/rows/table/{table_id}/{row_id}/"
        try:
            response = self.client.delete(url, headers=self._get_headers())
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Error deleting row {row_id} from table {table_id}: {e}")
            return False

    async def get_user_by_email(self, table_id: str, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email from a Baserow table"""
        rows = await self.get_table_rows(table_id)
        for row in rows:
            if row.get("email") == email:
                return row
        return None

    async def create_user(self, table_id: str, email: str, name: str, password: str, company: str = None) -> Dict[str, Any]:
        """Create a new user in Baserow"""
        data = {
            "email": email,
            "name": name,
            "password": password,
            "company": company,
            "role": "USER"
        }
        return await self.create_row(table_id, data)

    async def get_employees(self, table_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all employees for a user from Baserow"""
        rows = await self.get_table_rows(table_id)
        return [row for row in rows if row.get("user_id") == user_id]

    async def create_employee(self, table_id: str, user_id: str, name: str, email: str, role: str, department: str = None) -> Dict[str, Any]:
        """Create a new employee in Baserow"""
        data = {
            "name": name,
            "email": email,
            "role": role,
            "department": department,
            "risk_score": 0,
            "status": "STABLE",
            "user_id": user_id
        }
        return await self.create_row(table_id, data)


baserow_service = BaserowService()
