"""Turnover prediction tests: model output, persistence and cohort KPIs."""

from conftest import SEEDED_PREDICTION_COUNT, SEEDED_TALENT_COUNT


# --- Authorization ---------------------------------------------------------


def test_predictions_require_authentication(client):
    assert client.get("/api/predictions/").status_code == 401


def test_employee_cannot_read_predictions(client, employee_headers):
    assert client.get("/api/predictions/", headers=employee_headers).status_code == 403


def test_employee_cannot_run_predictions(client, employee_headers, new_talent):
    response = client.post(f"/api/predictions/talents/{new_talent['id']}", headers=employee_headers)

    assert response.status_code == 403


# --- Listing ---------------------------------------------------------------


def test_all_predictions_are_seeded_and_sorted(client, admin_headers):
    response = client.get("/api/predictions/", params={"limit": 1000}, headers=admin_headers)

    assert response.status_code == 200
    predictions = response.json()
    assert len(predictions) == SEEDED_PREDICTION_COUNT
    timestamps = [p["predicted_at"] for p in predictions]
    assert timestamps == sorted(timestamps, reverse=True)


def test_recent_predictions_respect_the_limit(client, admin_headers):
    response = client.get("/api/predictions/recent", params={"limit": 25}, headers=admin_headers)

    assert response.status_code == 200
    assert len(response.json()) == 25


def test_get_single_prediction(client, admin_headers):
    first = client.get("/api/predictions/", headers=admin_headers).json()[0]

    response = client.get(f"/api/predictions/{first['id']}", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["score"] == first["score"]


def test_get_unknown_prediction_returns_404(client, admin_headers):
    assert client.get("/api/predictions/999999", headers=admin_headers).status_code == 404


# --- Running a prediction --------------------------------------------------


def test_running_a_prediction_persists_it_and_syncs_the_talent(client, admin_headers, new_talent):
    response = client.post(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers)

    assert response.status_code == 200
    prediction = response.json()
    assert 0.0 <= prediction["score"] <= 1.0
    assert 0.0 <= prediction["confidence"] <= 1.0
    assert prediction["talent_id"] == new_talent["id"]
    assert prediction["recommendation"]
    assert prediction["features"]["engagement"] == new_talent["engagement_score"]

    # The talent's own risk fields must reflect the new prediction.
    talent = client.get(f"/api/talents/{new_talent['id']}", headers=admin_headers).json()
    assert talent["turnover_risk"] == prediction["score"]
    expected_status = "at_risk" if prediction["score"] >= 0.7 else "active"
    assert talent["status"] == expected_status


def test_running_a_prediction_on_an_unknown_talent_returns_404(client, admin_headers):
    response = client.post("/api/predictions/talents/999999", headers=admin_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Talent non trouvé"


def test_a_new_prediction_shows_up_first_in_the_recent_feed(client, admin_headers, new_talent):
    created = client.post(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers).json()

    recent = client.get("/api/predictions/recent", params={"limit": 5}, headers=admin_headers).json()

    assert recent[0]["id"] == created["id"]


def test_disfavourable_metrics_score_higher_than_favourable_ones(client, admin_headers):
    """Sanity check on model direction: disengaged and underpaid scores higher."""
    import uuid

    def make(suffix, engagement, satisfaction, salary):
        payload = {
            "first_name": "Profil",
            "last_name": suffix,
            "email": f"profil.{suffix.lower()}.{uuid.uuid4().hex[:8]}@talentpulse-qa.com",
            "salary": salary,
            "experience_years": 3,
            "performance_score": 0.8,
            "engagement_score": engagement,
            "satisfaction_score": satisfaction,
        }
        talent = client.post("/api/talents/", json=payload, headers=admin_headers).json()
        score = client.post(f"/api/predictions/talents/{talent['id']}", headers=admin_headers).json()["score"]
        client.delete(f"/api/talents/{talent['id']}", headers=admin_headers)
        return score

    risky = make("Risque", engagement=0.15, satisfaction=0.1, salary=38000)
    safe = make("Stable", engagement=0.95, satisfaction=0.95, salary=75000)

    assert risky > safe


# --- History ---------------------------------------------------------------


def test_talent_history_only_contains_that_talent(client, admin_headers, new_talent):
    client.post(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers)
    client.post(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers)

    history = client.get(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers)

    assert history.status_code == 200
    rows = history.json()
    assert len(rows) == 2
    assert all(r["talent_id"] == new_talent["id"] for r in rows)
    assert [r["predicted_at"] for r in rows] == sorted([r["predicted_at"] for r in rows], reverse=True)


def test_history_of_a_talent_without_prediction_is_empty(client, admin_headers, new_talent):
    assert client.get(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers).json() == []


# --- Cohort statistics -----------------------------------------------------


def test_stats_count_each_talent_once(client, admin_headers):
    stats = client.get("/api/predictions/stats", headers=admin_headers).json()

    assert stats["total"] == SEEDED_TALENT_COUNT
    assert stats["high_risk"] + stats["medium_risk"] + stats["low_risk"] == stats["total"]
    assert 0.0 <= stats["avg_risk_score"] <= 1.0
    # The raw history is much larger than the cohort itself.
    assert stats["predictions_total"] >= stats["total"]


def test_high_risk_endpoint_is_thresholded_and_deduplicated(client, admin_headers):
    response = client.get("/api/predictions/high-risk", params={"min_risk": 0.7}, headers=admin_headers)

    assert response.status_code == 200
    rows = response.json()
    assert all(r["score"] >= 0.7 for r in rows)
    talent_ids = [r["talent_id"] for r in rows]
    assert len(talent_ids) == len(set(talent_ids)), "a talent must appear at most once"


def test_high_risk_with_a_low_threshold_returns_the_whole_cohort(client, admin_headers):
    rows = client.get("/api/predictions/high-risk", params={"min_risk": 0.0}, headers=admin_headers).json()

    assert len(rows) == SEEDED_TALENT_COUNT


def test_stats_ignore_an_out_of_range_threshold(client, admin_headers):
    assert client.get("/api/predictions/high-risk", params={"min_risk": 2}, headers=admin_headers).status_code == 422


# --- Retraining ------------------------------------------------------------


def test_admin_can_retrain_the_model_and_it_still_predicts(client, admin_headers, new_talent):
    response = client.post("/api/predictions/train", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["trained_on"] in {"synthetic_reference", "customer_data"}

    # The freshly trained model must still serve predictions.
    after = client.post(f"/api/predictions/talents/{new_talent['id']}", headers=admin_headers)
    assert after.status_code == 200
    assert 0.0 <= after.json()["score"] <= 1.0


def test_employee_cannot_retrain_the_model(client, employee_headers):
    assert client.post("/api/predictions/train", headers=employee_headers).status_code == 403
