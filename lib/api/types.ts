export interface HouseholdInputs {
  filing_status: "single" | "joint" | "head_of_household";
  head_age: number;
  spouse_age: number;
  num_dependents: number;
  dependent_ages: number[];
  income: number;
}

export interface ReformInputs {
  ga_tax_rate: number;
  standard_deduction: number | null;
  ctc_amount: number;
  ctc_max_age: number;
  ctc_refundable: boolean;
  ctc_phaseout_threshold: number | null;
  ctc_phaseout_rate: number | null;
}

export interface HouseholdSummary {
  baseline_state_tax: number;
  reform_state_tax: number;
  baseline_ctc: number;
  reform_ctc: number;
  baseline_net_income: number;
  reform_net_income: number;
  net_change: number;
}

export interface HouseholdRequest {
  filing_status: HouseholdInputs["filing_status"];
  head_age: number;
  spouse_age?: number;
  dependent_ages: number[];
  income: number;
  reform: ReformInputs;
}

export interface HouseholdResponse {
  earnings_axis: number[];
  baseline_net_income: number[];
  reform_net_income: number[];
  baseline_mtr: number[];
  reform_mtr: number[];
  summary: HouseholdSummary;
}

export interface DecileImpact {
  decile: number;
  avg_income_change: number;
  pct_change: number;
}

export interface StatewideRequest {
  reform: ReformInputs;
}

export interface StatewideResponse {
  revenue_change: number;
  winners: number;
  losers: number;
  unchanged: number;
  poverty_rate_change: number;
  child_poverty_rate_change: number;
  decile_impacts: DecileImpact[];
}
