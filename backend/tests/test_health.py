"""Health endpoint tests."""


def test_health_is_public_and_reports_healthy(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["version"]
    assert body["uptime_seconds"] >= 0
    assert "timestamp" in body


def test_openapi_schema_is_served(client):
    response = client.get("/api/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    # Every route the frontend relies on must be documented.
    for path in (
        "/api/auth/token",
        "/api/auth/register",
        "/api/talents/",
        "/api/talents/stats",
        "/api/predictions/recent",
        "/api/predictions/stats",
        "/api/predictions/high-risk",
        "/api/predictions/talents/{talent_id}",
        "/api/billing/create-checkout-session",
    ):
        assert path in paths, f"{path} missing from the OpenAPI schema"
