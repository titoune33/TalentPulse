"""Talent CRUD, search, statistics and authorization tests."""

from conftest import SEEDED_TALENT_COUNT, unique_email


# --- Authorization ---------------------------------------------------------


def test_listing_talents_requires_authentication(client):
    assert client.get("/api/talents/").status_code == 401


def test_employee_role_cannot_read_talents(client, employee_headers):
    response = client.get("/api/talents/", headers=employee_headers)

    assert response.status_code == 403
    assert "rôle" in response.json()["detail"].lower()


def test_hr_manager_can_read_talents(client, hr_headers):
    assert client.get("/api/talents/", headers=hr_headers).status_code == 200


# --- Read ------------------------------------------------------------------


def test_list_returns_the_seeded_workforce(client, admin_headers):
    response = client.get("/api/talents/", params={"limit": 1000}, headers=admin_headers)

    assert response.status_code == 200
    talents = response.json()
    assert {"id", "first_name", "last_name", "email", "turnover_risk", "status"} <= set(talents[0])

    # Other tests create their own talents (the suite shares one database), so
    # assert on the seeded roster rather than on an exact global count.
    from services.seed_service import TALENTS

    seeded_emails = {row[2] for row in TALENTS}
    assert len(seeded_emails) == SEEDED_TALENT_COUNT
    assert seeded_emails <= {t["email"] for t in talents}


def test_list_respects_pagination(client, admin_headers):
    page = client.get("/api/talents/", params={"skip": 5, "limit": 3}, headers=admin_headers).json()

    assert len(page) == 3
    everything = client.get("/api/talents/", headers=admin_headers).json()
    assert [t["id"] for t in page] == [t["id"] for t in everything[5:8]]


def test_list_rejects_an_out_of_range_limit(client, admin_headers):
    assert client.get("/api/talents/", params={"limit": 5000}, headers=admin_headers).status_code == 422


def test_list_filters_by_department(client, admin_headers):
    response = client.get("/api/talents/", params={"department": "Ingénierie"}, headers=admin_headers)

    assert response.status_code == 200
    talents = response.json()
    assert talents
    assert all(t["department"] == "Ingénierie" for t in talents)


def test_get_single_talent(client, admin_headers):
    first = client.get("/api/talents/", headers=admin_headers).json()[0]

    response = client.get(f"/api/talents/{first['id']}", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["email"] == first["email"]


def test_get_unknown_talent_returns_404(client, admin_headers):
    response = client.get("/api/talents/999999", headers=admin_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Talent introuvable"


def test_search_matches_name_position_and_department(client, admin_headers):
    by_name = client.get("/api/talents/search", params={"q": "camille"}, headers=admin_headers).json()
    assert by_name and all("camille" in t["first_name"].lower() for t in by_name)

    by_department = client.get("/api/talents/search", params={"q": "Marketing"}, headers=admin_headers).json()
    assert by_department and all(t["department"] == "Marketing" for t in by_department)


def test_search_requires_a_query(client, admin_headers):
    assert client.get("/api/talents/search", headers=admin_headers).status_code == 422
    assert client.get("/api/talents/search", params={"q": ""}, headers=admin_headers).status_code == 422


def test_search_survives_wildcard_characters(client, admin_headers):
    """A `%` typed in the search box must not turn into a match-everything query."""
    response = client.get("/api/talents/search", params={"q": "%"}, headers=admin_headers)

    assert response.status_code == 200


# --- At risk ---------------------------------------------------------------


def test_at_risk_returns_only_high_risk_sorted_descending(client, admin_headers):
    response = client.get("/api/talents/at-risk", headers=admin_headers)

    assert response.status_code == 200
    risks = [t["turnover_risk"] for t in response.json()]
    assert all(r >= 0.7 for r in risks)
    assert risks == sorted(risks, reverse=True)


# --- Statistics ------------------------------------------------------------


def test_stats_are_consistent_with_the_talent_list(client, admin_headers):
    stats = client.get("/api/talents/stats", headers=admin_headers).json()
    talents = client.get("/api/talents/", params={"limit": 1000}, headers=admin_headers).json()

    assert stats["total"] == len(talents)
    assert set(stats["departments"]) == {t["department"] for t in talents if t["department"]}
    assert sum(stats["departments"].values()) == len([t for t in talents if t["department"]])
    assert 0.0 <= stats["avg_performance"] <= 1.0
    assert 0.0 <= stats["avg_engagement"] <= 1.0
    assert stats["at_risk"] == len([t for t in talents if t["turnover_risk"] >= 0.7])


# --- Create / Update / Delete ---------------------------------------------


def test_create_update_and_delete_a_talent(client, admin_headers):
    email = unique_email("crud")
    created = client.post(
        "/api/talents/",
        json={
            "first_name": "Nouvelle",
            "last_name": "Recrue",
            "email": email,
            "position": "Designer",
            "department": "Produit",
            "salary": 48000,
            "experience_years": 2,
            "performance_score": 0.7,
            "engagement_score": 0.6,
            "satisfaction_score": 0.65,
            "skills": ["Figma", "Design System"],
        },
        headers=admin_headers,
    )
    assert created.status_code == 201, created.text
    talent = created.json()
    assert talent["department"] == "Produit"
    assert talent["skills"] == ["Figma", "Design System"]
    assert talent["turnover_risk"] == 0.0

    updated = client.put(
        f"/api/talents/{talent['id']}",
        json={"position": "Lead Designer", "salary": 58000, "status": "at_risk"},
        headers=admin_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["position"] == "Lead Designer"
    assert updated.json()["salary"] == 58000
    assert updated.json()["status"] == "at_risk"

    deleted = client.delete(f"/api/talents/{talent['id']}", headers=admin_headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/talents/{talent['id']}", headers=admin_headers).status_code == 404


def test_create_rejects_a_duplicate_email(client, admin_headers, new_talent):
    response = client.post(
        "/api/talents/",
        json={
            "first_name": "Doublon",
            "last_name": "Email",
            "email": new_talent["email"],
        },
        headers=admin_headers,
    )

    assert response.status_code == 400
    assert "existe déjà" in response.json()["detail"]


def test_create_validates_the_payload(client, admin_headers):
    invalid = [
        {"first_name": "Sans", "last_name": "Email"},  # email is required
        {"first_name": "Email", "last_name": "Invalide", "email": "pas-un-email"},
        {"first_name": "Score", "last_name": "Hors Bornes", "email": unique_email("score"), "performance_score": 4.2},
        {"first_name": "Salaire", "last_name": "Négatif", "email": unique_email("neg"), "salary": -100},
    ]
    for payload in invalid:
        assert client.post("/api/talents/", json=payload, headers=admin_headers).status_code == 422, payload


def test_update_unknown_talent_returns_404(client, admin_headers):
    response = client.put("/api/talents/999999", json={"position": "Fantôme"}, headers=admin_headers)

    assert response.status_code == 404


def test_delete_unknown_talent_returns_404(client, admin_headers):
    assert client.delete("/api/talents/999999", headers=admin_headers).status_code == 404


def test_employee_cannot_create_or_delete_talents(client, employee_headers, new_talent):
    assert client.post(
        "/api/talents/",
        json={"first_name": "Interdit", "last_name": "Test", "email": unique_email("forbidden")},
        headers=employee_headers,
    ).status_code == 403
    assert client.delete(f"/api/talents/{new_talent['id']}", headers=employee_headers).status_code == 403
