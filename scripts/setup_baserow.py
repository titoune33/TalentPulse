"""
Script to set up Baserow for TalentPulse
This script creates the necessary tables in Baserow via its API.
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Baserow API configuration
BASEROW_API_KEY = os.getenv("BASEROW_API_KEY")
BASEROW_BASE_URL = os.getenv("BASEROW_BASE_URL", "https://api.baserow.io")

# Database name
DATABASE_NAME = "TalentPulse"

# Table definitions
TABLES = [
    {
        "name": "Users",
        "fields": [
            {"name": "Email", "type": "email"},
            {"name": "Name", "type": "text"},
            {"name": "Password", "type": "text"},
            {"name": "Role", "type": "text"},
            {"name": "Company", "type": "text"},
            {"name": "Is Active", "type": "boolean"},
        ]
    },
    {
        "name": "Talents",
        "fields": [
            {"name": "First Name", "type": "text"},
            {"name": "Last Name", "type": "text"},
            {"name": "Email", "type": "email"},
            {"name": "Phone", "type": "text"},
            {"name": "Position", "type": "text"},
            {"name": "Department", "type": "text"},
            {"name": "Hire Date", "type": "date"},
            {"name": "Salary", "type": "number"},
            {"name": "Skills", "type": "text"},
            {"name": "Experience Years", "type": "number"},
            {"name": "Education", "type": "text"},
            {"name": "Performance Score", "type": "number"},
            {"name": "Engagement Score", "type": "number"},
            {"name": "Satisfaction Score", "type": "number"},
            {"name": "Status", "type": "text"},
            {"name": "Turnover Risk", "type": "number"},
            {"name": "Is Active", "type": "boolean"},
            {"name": "User ID", "type": "number"},
        ]
    },
    {
        "name": "Predictions",
        "fields": [
            {"name": "Talent ID", "type": "number"},
            {"name": "Prediction Type", "type": "text"},
            {"name": "Score", "type": "number"},
            {"name": "Confidence", "type": "number"},
            {"name": "Probability", "type": "number"},
            {"name": "Features", "type": "text"},
            {"name": "Details", "type": "text"},
            {"name": "Recommendation", "type": "text"},
            {"name": "Predicted At", "type": "date"},
            {"name": "Valid Until", "type": "date"},
        ]
    }
]


def create_database():
    """Create a new database in Baserow"""
    url = f"{BASEROW_BASE_URL}/api/database/"
    headers = {
        "Authorization": f"Token {BASEROW_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {"name": DATABASE_NAME}
    
    client = httpx.Client()
    response = client.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error creating database: {response.text}")
        return None


def create_table(database_id, table_name, fields):
    """Create a new table in a Baserow database"""
    url = f"{BASEROW_BASE_URL}/api/database/tables/"
    headers = {
        "Authorization": f"Token {BASEROW_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "database_id": database_id,
        "name": table_name,
        "fields": fields
    }
    
    client = httpx.Client()
    response = client.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error creating table {table_name}: {response.text}")
        return None


def main():
    print("Setting up Baserow for TalentPulse...")
    
    # Create database
    print(f"Creating database '{DATABASE_NAME}'...")
    database = create_database()
    if not database:
        print("Failed to create database. It may already exist.")
        return
    
    database_id = database["id"]
    print(f"Database created with ID: {database_id}")
    
    # Create tables
    for table in TABLES:
        print(f"Creating table '{table['name']}'...")
        result = create_table(database_id, table["name"], table["fields"])
        if result:
            table_id = result["id"]
            print(f"Table '{table['name']}' created with ID: {table_id}")
        else:
            print(f"Failed to create table '{table['name']}'")
    
    print("\nBaserow setup complete!")
    print(f"Database ID: {database_id}")
    print("Table IDs will be printed above. Add them to your .env file:")
    print(f"BASEROW_DATABASE_ID={database_id}")


if __name__ == "__main__":
    main()
