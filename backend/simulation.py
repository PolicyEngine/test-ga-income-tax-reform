"""
GA Income Tax Reform Calculator — simulation logic.

Pure business logic with policyengine imports at module level (snapshotted
into the Modal image at build time via _image_setup.py).
"""

from __future__ import annotations

import bisect
from typing import Optional

import numpy as np
from pydantic import BaseModel
from policyengine_us import Simulation, Microsimulation
from policyengine_core.reforms import Reform

# ---------------------------------------------------------------------------
# Pydantic models (shared with gateway via dict serialization)
# ---------------------------------------------------------------------------


class ReformParams(BaseModel):
    ga_tax_rate: float = 0.0519
    standard_deduction: Optional[float] = None
    ctc_amount: float = 250
    ctc_max_age: int = 6
    ctc_refundable: bool = False
    ctc_phaseout_threshold: Optional[float] = None
    ctc_phaseout_rate: Optional[float] = None


class HouseholdImpactRequest(BaseModel):
    filing_status: str = "single"
    head_age: int = 40
    spouse_age: Optional[int] = 40
    dependent_ages: list[int] = []
    income: float = 50000
    reform: ReformParams = ReformParams()


class StatewideImpactRequest(BaseModel):
    reform: ReformParams = ReformParams()


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

YEAR = 2026
NUM_POINTS = 101
MAX_EARNINGS = 500_000
EARNINGS_AXIS = [round(i * MAX_EARNINGS / (NUM_POINTS - 1)) for i in range(NUM_POINTS)]

FILING_STATUS_MAP = {
    "single": "SINGLE",
    "joint": "JOINT",
    "head_of_household": "HEAD_OF_HOUSEHOLD",
}

GA_TAX_BRACKET_PATHS = {
    "single": "gov.states.ga.tax.income.main.single",
    "joint": "gov.states.ga.tax.income.main.joint",
    "head_of_household": "gov.states.ga.tax.income.main.head_of_household",
    "separate": "gov.states.ga.tax.income.main.separate",
    "surviving_spouse": "gov.states.ga.tax.income.main.surviving_spouse",
}

GA_STANDARD_DEDUCTION_PATH = "gov.states.ga.tax.income.deductions.standard.amount"
GA_CTC_AMOUNT_PATH = "gov.states.ga.tax.income.credits.ctc.amount"
GA_CTC_AGE_PATH = "gov.states.ga.tax.income.credits.ctc.age_threshold"

NUM_GA_TAX_BRACKETS = 6


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def build_situation(
    filing_status: str,
    head_age: int,
    spouse_age: int | None,
    dependent_ages: list[int],
    income: float,
) -> dict:
    pe_filing_status = FILING_STATUS_MAP.get(filing_status, "SINGLE")
    is_joint = filing_status == "joint"

    people = {}
    members = []

    people["head"] = {
        "age": {str(YEAR): head_age},
        "employment_income": {str(YEAR): income},
        "is_tax_unit_head": {str(YEAR): True},
    }
    members.append("head")

    if is_joint and spouse_age is not None:
        people["spouse"] = {
            "age": {str(YEAR): spouse_age},
            "employment_income": {str(YEAR): 0},
            "is_tax_unit_spouse": {str(YEAR): True},
        }
        members.append("spouse")

    for i, age in enumerate(dependent_ages):
        dep_name = f"dependent_{i}"
        people[dep_name] = {
            "age": {str(YEAR): age},
            "is_tax_unit_dependent": {str(YEAR): True},
        }
        members.append(dep_name)

    situation = {
        "people": people,
        "tax_units": {
            "tax_unit": {
                "members": members,
                "filing_status": {str(YEAR): pe_filing_status},
            }
        },
        "families": {"family": {"members": members}},
        "spm_units": {"spm_unit": {"members": members}},
        "marital_units": {},
        "households": {
            "household": {
                "members": members,
                "state_code": {str(YEAR): "GA"},
            }
        },
    }

    if is_joint and spouse_age is not None:
        situation["marital_units"]["marital_unit"] = {
            "members": ["head", "spouse"],
        }
    else:
        situation["marital_units"]["marital_unit"] = {
            "members": ["head"],
        }
    for i in range(len(dependent_ages)):
        dep_name = f"dependent_{i}"
        situation["marital_units"][f"marital_unit_{dep_name}"] = {
            "members": [dep_name],
        }

    return situation


def build_axes_situation(
    filing_status: str,
    head_age: int,
    spouse_age: int | None,
    dependent_ages: list[int],
) -> dict:
    situation = build_situation(
        filing_status, head_age, spouse_age, dependent_ages, income=0
    )
    situation["axes"] = [
        [
            {
                "name": "employment_income",
                "min": 0,
                "max": MAX_EARNINGS,
                "count": NUM_POINTS,
                "period": str(YEAR),
            }
        ]
    ]
    return situation


def build_reform_object(reform_params: ReformParams):
    period_key = f"{YEAR}-01-01.2100-12-31"
    reform_dict = {}

    for fs, path in GA_TAX_BRACKET_PATHS.items():
        for i in range(NUM_GA_TAX_BRACKETS):
            reform_dict[f"{path}[{i}].rate"] = {
                period_key: reform_params.ga_tax_rate
            }

    if reform_params.standard_deduction is not None:
        reform_dict[GA_STANDARD_DEDUCTION_PATH] = {
            period_key: reform_params.standard_deduction
        }

    reform_dict[GA_CTC_AMOUNT_PATH] = {
        period_key: reform_params.ctc_amount
    }

    reform_dict[GA_CTC_AGE_PATH] = {
        period_key: reform_params.ctc_max_age
    }

    return Reform.from_dict(reform_dict, "policyengine_us")


def run_household_sim(situation: dict, reform: ReformParams | None, filing_status: str):
    if reform is not None:
        reform_obj = build_reform_object(reform)
        sim = Simulation(situation=situation, reform=reform_obj)
    else:
        sim = Simulation(situation=situation)

    net_income = sim.calculate("household_net_income", YEAR).tolist()
    state_tax = sim.calculate("state_income_tax", YEAR).tolist()
    ga_ctc = sim.calculate("ga_ctc", YEAR).tolist()

    return net_income, state_tax, ga_ctc


def compute_mtr(net_incomes: list[float], earnings: list[float]) -> list[float]:
    mtrs = []
    for i in range(len(earnings)):
        if i == 0:
            if len(earnings) > 1 and earnings[1] != earnings[0]:
                delta_earnings = earnings[1] - earnings[0]
                delta_net = net_incomes[1] - net_incomes[0]
                mtrs.append(round(1 - delta_net / delta_earnings, 4))
            else:
                mtrs.append(0.0)
        else:
            delta_earnings = earnings[i] - earnings[i - 1]
            if delta_earnings == 0:
                mtrs.append(mtrs[-1] if mtrs else 0.0)
            else:
                delta_net = net_incomes[i] - net_incomes[i - 1]
                mtrs.append(round(1 - delta_net / delta_earnings, 4))
    return mtrs


def find_summary_at_income(
    income: float,
    earnings: list[float],
    net_incomes: list[float],
    state_taxes: list[float],
    ctcs: list[float],
) -> dict:
    idx = bisect.bisect_left(earnings, income)
    if idx >= len(earnings):
        idx = len(earnings) - 1
    elif idx > 0 and abs(earnings[idx - 1] - income) < abs(earnings[idx] - income):
        idx -= 1

    return {
        "net_income": float(net_incomes[idx]),
        "state_tax": float(state_taxes[idx]),
        "ctc": float(ctcs[idx]),
    }


# ---------------------------------------------------------------------------
# Entry-point functions (called by app.py worker wrappers)
# ---------------------------------------------------------------------------


def run_household(params: dict) -> dict:
    """Compute household-level tax/benefit results across earnings levels."""
    req = HouseholdImpactRequest(**params)

    situation = build_axes_situation(
        filing_status=req.filing_status,
        head_age=req.head_age,
        spouse_age=req.spouse_age if req.filing_status == "joint" else None,
        dependent_ages=req.dependent_ages,
    )

    baseline_net, baseline_tax, baseline_ctc = run_household_sim(
        situation, reform=None, filing_status=req.filing_status
    )
    reform_net, reform_tax, reform_ctc = run_household_sim(
        situation, reform=req.reform, filing_status=req.filing_status
    )

    baseline_mtr = compute_mtr(baseline_net, EARNINGS_AXIS)
    reform_mtr = compute_mtr(reform_net, EARNINGS_AXIS)

    bl_summary = find_summary_at_income(
        req.income, EARNINGS_AXIS, baseline_net, baseline_tax, baseline_ctc
    )
    rf_summary = find_summary_at_income(
        req.income, EARNINGS_AXIS, reform_net, reform_tax, reform_ctc
    )

    return {
        "earnings_axis": EARNINGS_AXIS,
        "baseline_net_income": [round(v, 2) for v in baseline_net],
        "reform_net_income": [round(v, 2) for v in reform_net],
        "baseline_mtr": baseline_mtr,
        "reform_mtr": reform_mtr,
        "summary": {
            "baseline_state_tax": round(bl_summary["state_tax"], 2),
            "reform_state_tax": round(rf_summary["state_tax"], 2),
            "baseline_ctc": round(bl_summary["ctc"], 2),
            "reform_ctc": round(rf_summary["ctc"], 2),
            "baseline_net_income": round(bl_summary["net_income"], 2),
            "reform_net_income": round(rf_summary["net_income"], 2),
            "net_change": round(
                rf_summary["net_income"] - bl_summary["net_income"], 2
            ),
        },
    }


def run_statewide(params: dict) -> dict:
    """Run microsimulation comparing baseline to reform."""
    req = StatewideImpactRequest(**params)
    reform_obj = build_reform_object(req.reform)

    baseline = Microsimulation()
    baseline_net = baseline.calc("household_net_income", period=YEAR, map_to="person").values
    baseline_tax = baseline.calc("state_income_tax", period=YEAR, map_to="person").values
    baseline_person_weight = baseline.calc("person_weight", period=YEAR).values
    baseline_poverty = baseline.calc("in_poverty", period=YEAR, map_to="person").values
    baseline_is_child = baseline.calc("is_child", period=YEAR).values
    baseline_decile = baseline.calc("household_income_decile", period=YEAR, map_to="person").values

    reform = Microsimulation(reform=reform_obj)
    reform_net = reform.calc("household_net_income", period=YEAR, map_to="person").values
    reform_tax = reform.calc("state_income_tax", period=YEAR, map_to="person").values
    reform_poverty = reform.calc("in_poverty", period=YEAR, map_to="person").values

    revenue_change = float(
        np.sum((reform_tax - baseline_tax) * baseline_person_weight)
    )

    net_diff = reform_net - baseline_net
    winners = int(np.sum(baseline_person_weight[net_diff > 1]))
    losers = int(np.sum(baseline_person_weight[net_diff < -1]))
    unchanged = int(np.sum(baseline_person_weight[np.abs(net_diff) <= 1]))

    baseline_poverty_rate = float(
        np.average(baseline_poverty, weights=baseline_person_weight)
    )
    reform_poverty_rate = float(
        np.average(reform_poverty, weights=baseline_person_weight)
    )
    poverty_rate_change = round(reform_poverty_rate - baseline_poverty_rate, 4)

    child_mask = baseline_is_child > 0
    if child_mask.sum() > 0:
        child_weights = baseline_person_weight[child_mask]
        bl_child_pov = float(
            np.average(baseline_poverty[child_mask], weights=child_weights)
        )
        rf_child_pov = float(
            np.average(reform_poverty[child_mask], weights=child_weights)
        )
        child_poverty_rate_change = round(rf_child_pov - bl_child_pov, 4)
    else:
        child_poverty_rate_change = 0.0

    decile_impacts = []
    for d in range(1, 11):
        mask = baseline_decile == d
        if mask.sum() > 0:
            weights_d = baseline_person_weight[mask]
            diff_d = net_diff[mask]
            avg_change = float(np.average(diff_d, weights=weights_d))
            bl_avg = float(
                np.average(baseline_net[mask], weights=weights_d)
            )
            pct = avg_change / bl_avg if bl_avg != 0 else 0.0
            decile_impacts.append(
                {
                    "decile": d,
                    "avg_income_change": round(avg_change, 2),
                    "pct_change": round(pct, 6),
                }
            )
        else:
            decile_impacts.append(
                {"decile": d, "avg_income_change": 0, "pct_change": 0}
            )

    return {
        "revenue_change": round(revenue_change, 2),
        "winners": winners,
        "losers": losers,
        "unchanged": unchanged,
        "poverty_rate_change": poverty_rate_change,
        "child_poverty_rate_change": child_poverty_rate_change,
        "decile_impacts": decile_impacts,
    }
