import type { HouseholdResponse, StatewideResponse } from "./types";

const earningsAxis = Array.from({ length: 101 }, (_, i) => i * 5000);

export const fixtures = {
  defaultHouseholdResponse: {
    earnings_axis: earningsAxis,
    baseline_net_income: earningsAxis.map((e) => e * 0.85 + 2000),
    reform_net_income: earningsAxis.map((e) => e * 0.86 + 2250),
    baseline_mtr: earningsAxis.map(() => 0.32),
    reform_mtr: earningsAxis.map(() => 0.31),
    summary: {
      baseline_state_tax: 1972,
      reform_state_tax: 1780,
      baseline_ctc: 0,
      reform_ctc: 0,
      baseline_net_income: 42028,
      reform_net_income: 42220,
      net_change: 192,
    },
  } satisfies HouseholdResponse,

  defaultStatewideResponse: {
    revenue_change: -450_000_000,
    winners: 3_200_000,
    losers: 150_000,
    unchanged: 1_800_000,
    poverty_rate_change: -0.2,
    child_poverty_rate_change: -0.4,
    decile_impacts: Array.from({ length: 10 }, (_, i) => ({
      decile: i + 1,
      avg_income_change: (i + 1) * 50 - 100,
      pct_change: ((i + 1) * 50 - 100) / ((i + 1) * 10000),
    })),
  } satisfies StatewideResponse,
};
