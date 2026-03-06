import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateHouseholdImpact, calculateStatewideImpact } from "../client";
import type { HouseholdRequest, StatewideRequest } from "../types";

const mockHouseholdResponse = {
  earnings_axis: [0, 5000, 10000],
  baseline_net_income: [0, 4500, 9000],
  reform_net_income: [0, 4600, 9100],
  baseline_mtr: [0, 0.32, 0.32],
  reform_mtr: [0, 0.31, 0.31],
  summary: {
    baseline_state_tax: 1972,
    reform_state_tax: 1780,
    baseline_ctc: 0,
    reform_ctc: 0,
    baseline_net_income: 42028,
    reform_net_income: 42220,
    net_change: 192,
  },
};

const mockStatewideResponse = {
  revenue_change: -450000000,
  winners: 3200000,
  losers: 150000,
  unchanged: 1800000,
  poverty_rate_change: -0.002,
  child_poverty_rate_change: -0.004,
  decile_impacts: Array.from({ length: 10 }, (_, i) => ({
    decile: i + 1,
    avg_income_change: (i + 1) * 50,
    pct_change: 0.01,
  })),
};

const householdRequest: HouseholdRequest = {
  filing_status: "single",
  head_age: 40,
  dependent_ages: [],
  income: 50000,
  reform: {
    ga_tax_rate: 0.0519,
    standard_deduction: 12000,
    ctc_amount: 250,
    ctc_max_age: 6,
    ctc_refundable: false,
    ctc_phaseout_threshold: null,
    ctc_phaseout_rate: null,
  },
};

const statewideRequest: StatewideRequest = {
  reform: {
    ga_tax_rate: 0.0519,
    standard_deduction: null,
    ctc_amount: 250,
    ctc_max_age: 6,
    ctc_refundable: false,
    ctc_phaseout_threshold: null,
    ctc_phaseout_rate: null,
  },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("calculateHouseholdImpact", () => {
  it("sends correct request and parses response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockHouseholdResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await calculateHouseholdImpact(householdRequest);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/household-impact");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });

    const body = JSON.parse(options?.body as string);
    expect(body.filing_status).toBe("single");
    expect(body.income).toBe(50000);
    expect(body.reform.ga_tax_rate).toBe(0.0519);

    expect(result.earnings_axis).toHaveLength(3);
    expect(result.summary.net_change).toBe(192);
  });

  it("throws on non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    );

    await expect(calculateHouseholdImpact(householdRequest)).rejects.toThrow(
      "Household impact API error 500"
    );
  });
});

describe("calculateStatewideImpact", () => {
  it("sends correct request and parses response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatewideResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await calculateStatewideImpact(statewideRequest);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/statewide-impact");

    const body = JSON.parse(options?.body as string);
    expect(body.reform.ga_tax_rate).toBe(0.0519);

    expect(result.revenue_change).toBe(-450000000);
    expect(result.decile_impacts).toHaveLength(10);
    expect(result.winners).toBe(3200000);
  });

  it("throws on non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Bad Request", { status: 400 })
    );

    await expect(calculateStatewideImpact(statewideRequest)).rejects.toThrow(
      "Statewide impact API error 400"
    );
  });
});

describe("type conformance", () => {
  it("household response has all expected fields", () => {
    const resp = mockHouseholdResponse;
    expect(resp).toHaveProperty("earnings_axis");
    expect(resp).toHaveProperty("baseline_net_income");
    expect(resp).toHaveProperty("reform_net_income");
    expect(resp).toHaveProperty("baseline_mtr");
    expect(resp).toHaveProperty("reform_mtr");
    expect(resp).toHaveProperty("summary");
    expect(resp.summary).toHaveProperty("baseline_state_tax");
    expect(resp.summary).toHaveProperty("reform_state_tax");
    expect(resp.summary).toHaveProperty("baseline_ctc");
    expect(resp.summary).toHaveProperty("reform_ctc");
    expect(resp.summary).toHaveProperty("net_change");
  });

  it("statewide response has all expected fields", () => {
    const resp = mockStatewideResponse;
    expect(resp).toHaveProperty("revenue_change");
    expect(resp).toHaveProperty("winners");
    expect(resp).toHaveProperty("losers");
    expect(resp).toHaveProperty("unchanged");
    expect(resp).toHaveProperty("poverty_rate_change");
    expect(resp).toHaveProperty("child_poverty_rate_change");
    expect(resp).toHaveProperty("decile_impacts");
    expect(resp.decile_impacts[0]).toHaveProperty("decile");
    expect(resp.decile_impacts[0]).toHaveProperty("avg_income_change");
    expect(resp.decile_impacts[0]).toHaveProperty("pct_change");
  });
});
