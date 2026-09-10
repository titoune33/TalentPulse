"""Billing tests. Stripe is intentionally unconfigured: demo mode is exercised."""

from conftest import unique_email


def test_plans_catalogue_is_public(client):
    response = client.get("/api/billing/plans")

    assert response.status_code == 200
    body = response.json()
    assert body["stripe_configured"] is False
    ids = [p["id"] for p in body["plans"]]
    assert ids == ["starter", "pro", "enterprise"]
    # Without a Stripe key no price id can be sold.
    assert all(p["price_id"] is None for p in body["plans"])


def test_current_plan_requires_authentication(client):
    assert client.get("/api/billing/plan").status_code == 401


def test_current_plan_is_free_for_a_brand_new_account(client, admin_headers):
    fresh = client.post(
        "/api/auth/register",
        json={"email": unique_email("billing"), "name": "Nouveau Client", "password": "motdepasse123"},
    ).json()
    headers = {"Authorization": f"Bearer {fresh['access_token']}"}

    response = client.get("/api/billing/plan", headers=headers)

    assert response.status_code == 200
    assert response.json()["plan"] == "free"


def test_checkout_without_stripe_key_activates_demo_mode(client):
    fresh = client.post(
        "/api/auth/register",
        json={"email": unique_email("demo"), "name": "Compte Démo", "password": "motdepasse123"},
    ).json()
    headers = {"Authorization": f"Bearer {fresh['access_token']}"}

    response = client.post(
        "/api/billing/create-checkout-session",
        json={"price_id": "price_inexistant"},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["demo"] is True
    assert body["url"] is None
    # The plan really changed on the account.
    assert client.get("/api/billing/plan", headers=headers).json()["plan"] == "pro"


def test_checkout_requires_authentication(client):
    response = client.post("/api/billing/create-checkout-session", json={"price_id": "price_x"})

    assert response.status_code == 401


def test_webhook_refuses_to_run_when_stripe_is_not_configured(client):
    response = client.post("/api/billing/webhook", json={"type": "checkout.session.completed"})

    assert response.status_code == 503
    assert "non configurée" in response.json()["detail"]


def test_removed_subscribe_alias_no_longer_exists(client, admin_headers):
    """The ambiguous /billing/subscribe alias was dropped in favour of one path."""
    assert client.post("/api/billing/subscribe", headers=admin_headers).status_code == 404
