"""Authentication, account lifecycle and authorization tests."""

import pytest

from conftest import DEMO_EMAIL, DEMO_PASSWORD, unique_email


# --- Login -----------------------------------------------------------------


def test_login_with_valid_credentials_returns_token_and_user(client):
    response = client.post("/api/auth/token", data={"username": DEMO_EMAIL, "password": DEMO_PASSWORD})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == DEMO_EMAIL
    assert body["user"]["role"] == "admin"


@pytest.mark.parametrize(
    "email,password",
    [
        (DEMO_EMAIL, "wrong-password"),
        ("inconnu@talentpulse.app", "motdepasse123"),
    ],
)
def test_login_with_bad_credentials_is_rejected(client, email, password):
    response = client.post("/api/auth/token", data={"username": email, "password": password})

    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


# --- Registration ----------------------------------------------------------


def test_public_registration_creates_workspace_owner_and_logs_in(client):
    email = unique_email("signup")
    response = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Marie Dupont", "password": "motdepasse123"},
    )

    assert response.status_code == 201
    body = response.json()
    # The frontend stores this payload directly: it must be a full auth response.
    assert body["access_token"]
    assert body["user"]["email"] == email
    assert body["user"]["role"] == "admin"

    # The returned token must actually work.
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_registration_ignores_a_client_supplied_role(client):
    """A public signup must never be able to choose its own privileges."""
    email = unique_email("escalation")
    response = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Escalade", "password": "motdepasse123", "role": "employee"},
    )

    assert response.status_code == 201
    assert response.json()["user"]["role"] == "admin"


def test_registration_rejects_a_duplicate_email(client):
    response = client.post(
        "/api/auth/register",
        json={"email": DEMO_EMAIL, "name": "Doublon", "password": "motdepasse123"},
    )

    assert response.status_code == 400
    assert "existe déjà" in response.json()["detail"]


def test_registration_rejects_a_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={"email": unique_email("short"), "name": "Court", "password": "court"},
    )

    assert response.status_code == 422


# --- Current user ----------------------------------------------------------


def test_me_requires_a_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_rejects_a_malformed_token(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer pas-un-jwt"})

    assert response.status_code == 401
    assert "invalide" in response.json()["detail"].lower()


def test_me_returns_the_authenticated_user(client, admin_headers):
    response = client.get("/api/auth/me", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["email"] == DEMO_EMAIL


def test_update_profile_persists_the_new_name(client, admin_headers):
    original = client.get("/api/auth/me", headers=admin_headers).json()["name"]
    response = client.put("/api/auth/me", json={"name": "Démo Admin"}, headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["name"] == "Démo Admin"
    assert client.get("/api/auth/me", headers=admin_headers).json()["name"] == "Démo Admin"

    if original != "Démo Admin":  # pragma: no cover - defensive restore
        client.put("/api/auth/me", json={"name": original}, headers=admin_headers)


def test_update_profile_refuses_an_email_already_in_use(client, admin_headers):
    other = client.post(
        "/api/auth/register",
        json={"email": unique_email("taken"), "name": "Autre", "password": "motdepasse123"},
    ).json()
    taken_email = other["user"]["email"]

    response = client.put("/api/auth/me", json={"email": taken_email}, headers=admin_headers)

    assert response.status_code == 400
    assert "déjà utilisé" in response.json()["detail"]


# --- Password change -------------------------------------------------------


def test_password_change_requires_the_current_password(client, admin_headers):
    email = unique_email("pwd")
    client.post(
        "/api/auth/register",
        json={"email": email, "name": "Mot De Passe", "password": "motdepasse123"},
    )
    token = client.post("/api/auth/token", data={"username": email, "password": "motdepasse123"}).json()
    headers = {"Authorization": f"Bearer {token['access_token']}"}

    wrong = client.post(
        "/api/auth/me/password",
        json={"current_password": "mauvais", "new_password": "nouveaumdp123"},
        headers=headers,
    )
    assert wrong.status_code == 400

    good = client.post(
        "/api/auth/me/password",
        json={"current_password": "motdepasse123", "new_password": "nouveaumdp123"},
        headers=headers,
    )
    assert good.status_code == 200

    # New password works, old one no longer does.
    assert client.post("/api/auth/token", data={"username": email, "password": "nouveaumdp123"}).status_code == 200
    assert client.post("/api/auth/token", data={"username": email, "password": "motdepasse123"}).status_code == 401


# --- Admin user management -------------------------------------------------


def test_admin_can_list_users(client, admin_headers):
    response = client.get("/api/auth/users", headers=admin_headers)

    assert response.status_code == 200
    emails = [u["email"] for u in response.json()["users"]]
    assert DEMO_EMAIL in emails
    # Password hashes must never leak through the API.
    assert all("hashed_password" not in u for u in response.json()["users"])


def test_employee_cannot_list_users(client, employee_headers):
    response = client.get("/api/auth/users", headers=employee_headers)

    assert response.status_code == 403


def test_admin_creates_an_employee_with_a_linked_talent_profile(client, admin_headers):
    email = unique_email("linked")
    created = client.post(
        "/api/auth/users",
        json={"email": email, "name": "Julie Martin", "password": "motdepasse123", "role": "employee"},
        headers=admin_headers,
    )

    assert created.status_code == 201
    user_id = created.json()["id"]

    talents = client.get("/api/talents/search", params={"q": email}, headers=admin_headers).json()
    assert len(talents) == 1
    assert talents[0]["user_id"] == user_id
    assert talents[0]["first_name"] == "Julie"


def test_creating_a_user_with_an_existing_email_is_rejected(client, admin_headers):
    response = client.post(
        "/api/auth/users",
        json={"email": DEMO_EMAIL, "name": "Doublon", "password": "motdepasse123", "role": "hr_manager"},
        headers=admin_headers,
    )

    assert response.status_code == 400


def test_role_update_requires_admin(client, hr_headers):
    response = client.put("/api/auth/users/1/role", params={"role": "employee"}, headers=hr_headers)

    assert response.status_code == 403


def test_role_update_accepts_a_valid_role_and_is_persisted(client, admin_headers):
    email = unique_email("promote")
    user = client.post(
        "/api/auth/users",
        json={"email": email, "name": "À Promouvoir", "password": "motdepasse123", "role": "employee"},
        headers=admin_headers,
    ).json()

    response = client.put(f"/api/auth/users/{user['id']}/role", params={"role": "hr_manager"}, headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["role"] == "hr_manager"


def test_last_admin_cannot_be_demoted(client, admin_headers):
    """Demoting the only remaining admin must be refused."""
    # Earlier tests sign up self-serve accounts, which are admins by design.
    # Demote every admin except the demo account so the guard is deterministic.
    users = client.get("/api/auth/users", headers=admin_headers).json()["users"]
    demo_admin = next(u for u in users if u["email"] == DEMO_EMAIL)
    for user in users:
        if user["role"] == "admin" and user["id"] != demo_admin["id"]:
            assert client.put(
                f"/api/auth/users/{user['id']}/role", params={"role": "hr_manager"}, headers=admin_headers
            ).status_code == 200

    response = client.put(
        f"/api/auth/users/{demo_admin['id']}/role", params={"role": "employee"}, headers=admin_headers
    )

    assert response.status_code == 400
    assert "dernier admin" in response.json()["detail"]
    # The account is still an admin afterwards.
    assert client.get("/api/auth/me", headers=admin_headers).json()["role"] == "admin"


def test_activating_and_deactivating_a_user_toggles_access(client, admin_headers):
    email = unique_email("toggle")
    user = client.post(
        "/api/auth/users",
        json={"email": email, "name": "Togglé", "password": "motdepasse123", "role": "hr_manager"},
        headers=admin_headers,
    ).json()

    deactivated = client.put(f"/api/auth/users/{user['id']}/activate", headers=admin_headers)
    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False
    # A deactivated account can no longer log in.
    assert client.post("/api/auth/token", data={"username": email, "password": "motdepasse123"}).status_code == 403

    reactivated = client.put(f"/api/auth/users/{user['id']}/activate", headers=admin_headers)
    assert reactivated.json()["is_active"] is True
    assert client.post("/api/auth/token", data={"username": email, "password": "motdepasse123"}).status_code == 200
