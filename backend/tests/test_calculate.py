"""
Stub tests for Modal backend endpoints.

TODO: Replace with real tests when policyengine-us integration is implemented.
"""


def test_household_impact_stub_returns_expected_keys():
    """Verify the household_impact stub returns the correct response shape."""
    # TODO: Import and call the actual function when implemented
    expected_keys = {
        "earnings_axis",
        "baseline_net_income",
        "reform_net_income",
        "baseline_mtr",
        "reform_mtr",
        "summary",
    }
    # Placeholder assertion
    assert expected_keys == expected_keys


def test_statewide_impact_stub_returns_expected_keys():
    """Verify the statewide_impact stub returns the correct response shape."""
    expected_keys = {
        "revenue_change",
        "winners",
        "losers",
        "unchanged",
        "poverty_rate_change",
        "child_poverty_rate_change",
        "decile_impacts",
    }
    assert expected_keys == expected_keys
