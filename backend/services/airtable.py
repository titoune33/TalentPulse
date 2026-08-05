from pyairtable import Table
import os

class AirtableService:
    def __init__(self):
        self.base_id = os.getenv("AIRTABLE_BASE_ID")
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.table_users = Table(self.api_key, self.base_id, "Users")
        self.table_employees = Table(self.api_key, self.base_id, "Employees")
        self.table_posts = Table(self.api_key, self.base_id, "Posts")
        self.table_comments = Table(self.api_key, self.base_id, "Comments")
        self.table_subscriptions = Table(self.api_key, self.base_id, "Subscriptions")

    def get_user_by_email(self, email: str):
        try:
            records = self.table_users.all()
            for record in records:
                if record["fields"].get("email") == email:
                    return record
            return None
        except Exception as e:
            print(f"Error in get_user_by_email: {e}")
            return None

    def create_user(self, email: str, name: str, password: str, company: str = None):
        try:
            return self.table_users.create({
                "email": email,
                "name": name,
                "password": password,
                "company": company,
                "role": "USER"
            })
        except Exception as e:
            print(f"Error in create_user: {e}")
            raise e

    def get_employees(self, user_id: str):
        try:
            return self.table_employees.all(filter_by_formula=f"{{userId}}='{user_id}'")
        except Exception as e:
            print(f"Error in get_employees: {e}")
            return []

    def create_employee(self, user_id: str, name: str, email: str, role: str, department: str = None):
        try:
            return self.table_employees.create({
                "name": name,
                "email": email,
                "role": role,
                "department": department,
                "riskScore": 0,
                "status": "STABLE",
                "userId": [user_id]
            })
        except Exception as e:
            print(f"Error in create_employee: {e}")
            raise e
