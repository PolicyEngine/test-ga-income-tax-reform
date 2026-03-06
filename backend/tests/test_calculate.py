"""
Tests for the GA Income Tax Reform Calculator backend.

Tests are derived from plan.yaml api_tests. They call the FastAPI endpoint
functions directly (no HTTP layer) using FastAPI's TestClient.
"""

import pytest
from fastapi.testclient import TestClient

from modal_app import web_app

client = TestClient(web_app)

# ---------------------------------------------------------------------------
# Household impact tests
# ---------------------------------------------------------------------------

HOUSEHOLD_RESPONSE_KEYS = {
    "earnings_axis",
    "baseline_net_income",
    "reform_net_income",
    "baseline_mtr",
    "reform_mtr",
    "summary",
}

SUMMARY_KEYS = {
    "baseline_state_tax",
    "reform_state_tax",
    "baseline_ctc",
    "reform_ctc",
    "baseline_net_income",
    "reform_net_income",
    "net_change",
}


def test_household_response_shape():
    """Household impact endpoint returns correct response structure."""
    resp = client.post(
        "/household-impact",
        json={
            "filing_status": "single",
            "head_age": 40,
            "dependent_ages": [],
            "income": 50000,
            "reform": {
                "ga_tax_rate": 0.0519,
                "standard_deduction": 12000,
                "ctc_amount": 250,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == HOUSEHOLD_RESPONSE_KEYS
    assert set(data["summary"].keys()) == SUMMARY_KEYS
    assert len(data["earnings_axis"]) == 101
    assert len(data["baseline_net_income"]) == 101
    assert len(data["reform_net_income"]) == 101
    assert len(data["baseline_mtr"]) == 101
    assert len(data["reform_mtr"]) == 101


def test_single_filer_baseline():
    """Single filer at $50k, default reform params: net_change ≈ 0."""
    resp = client.post(
        "/household-impact",
        json={
            "filing_status": "single",
            "head_age": 40,
            "dependent_ages": [],
            "income": 50000,
            "reform": {
                "ga_tax_rate": 0.0519,
                "standard_deduction": 12000,
                "ctc_amount": 250,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    data = resp.json()
    summary = data["summary"]
    assert 1000 <= summary["baseline_state_tax"] <= 3000
    assert 1000 <= summary["reform_state_tax"] <= 3000
    assert abs(summary["net_change"]) < 50  # Near zero with matching params


def test_rate_reduction_benefit():
    """Reducing rate from 5.19% to 4% should reduce tax liability."""
    resp = client.post(
        "/household-impact",
        json={
            "filing_status": "single",
            "head_age": 40,
            "dependent_ages": [],
            "income": 75000,
            "reform": {
                "ga_tax_rate": 0.04,
                "standard_deduction": 12000,
                "ctc_amount": 250,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    data = resp.json()
    summary = data["summary"]
    assert summary["reform_state_tax"] < summary["baseline_state_tax"]
    assert summary["net_change"] >= 0  # Taxpayer benefits


def test_ctc_with_young_children():
    """Family with children under 6 should receive GA CTC."""
    resp = client.post(
        "/household-impact",
        json={
            "filing_status": "joint",
            "head_age": 35,
            "spouse_age": 33,
            "dependent_ages": [3, 5, 10],
            "income": 80000,
            "reform": {
                "ga_tax_rate": 0.0519,
                "standard_deduction": 24000,
                "ctc_amount": 500,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    data = resp.json()
    summary = data["summary"]
    # Two children under 6 (ages 3 and 5) at $500 each = $1000
    assert abs(summary["reform_ctc"] - 1000) < 100


def test_zero_income_zero_tax():
    """Zero income should produce zero state tax."""
    resp = client.post(
        "/household-impact",
        json={
            "filing_status": "single",
            "head_age": 30,
            "dependent_ages": [],
            "income": 0,
            "reform": {
                "ga_tax_rate": 0.0519,
                "standard_deduction": 12000,
                "ctc_amount": 250,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    data = resp.json()
    summary = data["summary"]
    assert summary["baseline_state_tax"] == 0
    assert summary["reform_state_tax"] == 0


# ---------------------------------------------------------------------------
# Statewide impact tests
# ---------------------------------------------------------------------------

STATEWIDE_RESPONSE_KEYS = {
    "revenue_change",
    "winners",
    "losers",
    "unchanged",
    "poverty_rate_change",
    "child_poverty_rate_change",
    "decile_impacts",
}


def test_statewide_response_shape():
    """Statewide impact endpoint returns correct response structure."""
    resp = client.post(
        "/statewide-impact",
        json={
            "reform": {
                "ga_tax_rate": 0.0519,
                "ctc_amount": 250,
                "ctc_max_age": 6,
                "ctc_refundable": False,
            },
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == STATEWIDE_RESPONSE_KEYS
    assert len(data["decile_impacts"]) == 10
    for d in data["decile_impacts"]:
        assert "decile" in d
        assert "avg_income_change" in d
        assert "pct_change" in d
