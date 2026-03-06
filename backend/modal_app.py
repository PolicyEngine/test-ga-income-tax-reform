"""
GA Income Tax Reform Calculator — Modal serverless backend.

Provides two endpoints:
  POST /household-impact — household-level tax/benefit calculations
  POST /statewide-impact — microsimulation for population-level impacts

TODO: Implement with policyengine-us when backend integration begins.
"""

import modal

app = modal.App("ga-income-tax-reform")

image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "policyengine-us",
)


@app.function(image=image, timeout=300)
@modal.web_endpoint(method="POST")
def household_impact(params: dict):
    """
    Calculate household-level tax and benefit results across earnings levels.

    TODO: Implement with policyengine-us Simulation.
    """
    # TODO: Replace stub with real policyengine-us calculations
    # from policyengine_us import Simulation
    #
    # Steps:
    # 1. Build household situation from params
    # 2. Create baseline Simulation
    # 3. Create reform Simulation with modified GA tax params
    # 4. Calculate net income, MTR across earnings axis
    # 5. Return structured response

    return {
        "earnings_axis": list(range(0, 505000, 5000)),
        "baseline_net_income": [],
        "reform_net_income": [],
        "baseline_mtr": [],
        "reform_mtr": [],
        "summary": {
            "baseline_state_tax": 0,
            "reform_state_tax": 0,
            "baseline_ctc": 0,
            "reform_ctc": 0,
            "baseline_net_income": 0,
            "reform_net_income": 0,
            "net_change": 0,
        },
    }


@app.function(image=image, timeout=600)
@modal.web_endpoint(method="POST")
def statewide_impact(params: dict):
    """
    Run microsimulation comparing baseline to reform.

    TODO: Implement with policyengine-us Microsimulation.
    """
    # TODO: Replace stub with real policyengine-us microsimulation
    # from policyengine_us import Microsimulation
    #
    # Steps:
    # 1. Build reform from params
    # 2. Create baseline Microsimulation
    # 3. Create reform Microsimulation
    # 4. Calculate aggregate metrics (revenue, winners/losers, poverty, deciles)
    # 5. Return structured response

    return {
        "revenue_change": 0,
        "winners": 0,
        "losers": 0,
        "unchanged": 0,
        "poverty_rate_change": 0,
        "child_poverty_rate_change": 0,
        "decile_impacts": [
            {"decile": i, "avg_income_change": 0, "pct_change": 0}
            for i in range(1, 11)
        ],
    }
