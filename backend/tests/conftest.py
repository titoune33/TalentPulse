"""
Shared pytest fixtures for the TalentPulse backend test suite.

The suite runs against a throwaway SQLite database and a throwaway model
directory, so it never touches `backend/talentpulse.db` nor the trained
artifacts in `backend/data/ml/`.
"""

import os
import shutil
import sys
import tempfile
import uuid
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# --- Isolated runtime ------------------------------------------------------
# These must be set *before* `database` / `services.prediction_service` are
# imported, because both read their configuration at import time.
_TMP_DIR = Path(tempfile.mkdtemp(prefix="talentpulse-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DIR / 'test.db'}"
os.environ["MODEL_DIR"] = str(_TMP_DIR / "ml")
os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["DEMO_EMAIL"] = "demo@talentpulse.app"
os.environ["DEMO_PASSWORD"] = "demo1234"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
# Billing must stay in demo mode: a real key would try to reach Stripe.
for _var in ("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_ID_STARTER",
             "STRIPE_PRICE_ID_PRO", "STRIPE_PRICE_ID_ENTERPRISE"):
    os.environ.pop(_var, None)

DEMO_EMAIL = "demo@talentpulse.app"
DEMO_PASSWORD = "demo1234"
SEEDED_TALENT_COUNT = 14
SEEDED_PREDICTION_COUNT = 14 * 13


def unique_email(prefix: str = "qa") -> str:
    """
    A fresh email address for each test that creates an account.

    Uses a normal TLD on purpose: `email-validator` rejects reserved suffixes
    such as `.test` / `.invalid`, so those would fail validation, not the code
    under test.
    """
    return f"{prefix}.{uuid.uuid4().hex[:10]}@talentpulse-qa.com"


def pytest_sessionfinish(session, exitstatus):  # noqa: ARG001
    shutil.rmtree(_TMP_DIR, ignore_errors=True)


@pytest.fixture(scope="session")
def client():
    """A TestClient with the FastAPI lifespan (table creation + seeding) run."""
    from main import app
    from fastapi.testclient import TestClient

    with TestClient(app) as test_client:
        yield test_client


def _login(client, email: str, password: str) -> str:
    response = client.post("/api/auth/token", data={"username": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.fixture(scope="session")
def admin_token(client) -> str:
    return _login(client, DEMO_EMAIL, DEMO_PASSWORD)


@pytest.fixture(scope="session")
def admin_headers(admin_token) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def employee_headers(client, admin_headers) -> dict:
    """An `employee` account: authenticated but without HR privileges."""
    email = unique_email("employee")
    response = client.post(
        "/api/auth/users",
        json={"email": email, "name": "Employé Test", "password": "motdepasse123", "role": "employee"},
        headers=admin_headers,
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {_login(client, email, 'motdepasse123')}"}


@pytest.fixture(scope="session")
def hr_headers(client, admin_headers) -> dict:
    """An `hr_manager` account: full access to talents and predictions."""
    email = unique_email("hr")
    response = client.post(
        "/api/auth/users",
        json={"email": email, "name": "RH Test", "password": "motdepasse123", "role": "hr_manager"},
        headers=admin_headers,
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {_login(client, email, 'motdepasse123')}"}


@pytest.fixture()
def new_talent(client, admin_headers):
    """Create a talent for a single test and remove it afterwards."""
    payload = {
        "first_name": "Fixture",
        "last_name": "Talent",
        "email": unique_email("talent"),
        "position": "Ingénieur QA",
        "department": "Ingénierie",
        "salary": 55000,
        "experience_years": 4,
        "performance_score": 0.8,
        "engagement_score": 0.5,
        "satisfaction_score": 0.35,
    }
    created = client.post("/api/talents/", json=payload, headers=admin_headers)
    assert created.status_code == 201, created.text
    talent = created.json()
    yield talent
    client.delete(f"/api/talents/{talent['id']}", headers=admin_headers)
