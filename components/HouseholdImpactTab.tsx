"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, MetricCard } from "@policyengine/ui-kit";
import { useHouseholdImpact } from "@/lib/hooks/useCalculation";
import type { HouseholdInputs, ReformInputs } from "@/lib/api/types";

interface HouseholdImpactTabProps {
  household: HouseholdInputs;
  reform: ReformInputs;
}

const fmtCurrency = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtPercent = (v: number) =>
  v.toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const TOOLTIP_STYLE = {
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "0.5rem 0.75rem",
};

function niceTicks(dataMin: number, dataMax: number, targetCount = 5): number[] {
  if (dataMax <= dataMin) return [dataMin];
  const range = dataMax - dataMin;
  const rawStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let niceStep: number;
  if (normalized <= 1) niceStep = magnitude;
  else if (normalized <= 2) niceStep = 2 * magnitude;
  else if (normalized <= 2.5) niceStep = 2.5 * magnitude;
  else if (normalized <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  const niceMin = Math.floor(dataMin / niceStep) * niceStep;
  const niceMax = Math.ceil(dataMax / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax; v += niceStep) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  return ticks;
}

export default function HouseholdImpactTab({
  household,
  reform,
}: HouseholdImpactTabProps) {
  const { data, isLoading, isFetching, error } = useHouseholdImpact(household, reform);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <span className="text-sm">Calculating household impact...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        <div className="text-center">
          <p className="font-semibold">Failed to load household impact data</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try adjusting your inputs or refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  const lineData = data.earnings_axis.map((earnings, i) => ({
    earnings,
    baseline: data.baseline_net_income[i],
    reform: data.reform_net_income[i],
  }));

  const mtrData = data.earnings_axis.map((earnings, i) => ({
    earnings,
    baseline: data.baseline_mtr[i],
    reform: data.reform_mtr[i],
  }));

  const { summary } = data;

  const allNetIncomes = [...data.baseline_net_income, ...data.reform_net_income];
  const yMinIncome = Math.min(...allNetIncomes);
  const yMaxIncome = Math.max(...allNetIncomes);
  const yTicksIncome = niceTicks(yMinIncome, yMaxIncome);

  const xTicks = niceTicks(0, 500000);

  const allMtr = [...data.baseline_mtr, ...data.reform_mtr];
  const mtrMin = Math.min(0, ...allMtr);
  const mtrMax = Math.max(...allMtr);
  const yTicksMtr = niceTicks(mtrMin, mtrMax > 0.6 ? mtrMax : 0.6);

  return (
    <div className={`flex flex-col gap-8 transition-opacity duration-200${isFetching ? " opacity-60" : ""}`}>
      {/* Net income by earnings level */}
      <ChartContainer
        title="Net income by earnings level"
        subtitle="Compares household net income under baseline and reform across earnings"
      >
        <div className="h-80 sm:h-96 overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="earnings"
                type="number"
                domain={[xTicks[0], xTicks[xTicks.length - 1]]}
                ticks={xTicks}
                tickFormatter={fmtCurrency}
                tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              />
              <YAxis
                domain={[yTicksIncome[0], yTicksIncome[yTicksIncome.length - 1]]}
                ticks={yTicksIncome}
                tickFormatter={fmtCurrency}
                tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
                width={70}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                separator=": "
                formatter={(v: number) => [fmtCurrency(v)]}
                labelFormatter={(v: number) => `Income: ${fmtCurrency(v)}`}
              />
              <Legend />
              <ReferenceLine
                x={household.income}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                label={{ value: "Your income", position: "top", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline"
                stroke="var(--chart-5)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reform"
                name="Reform"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Summary cards */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your household impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label="State tax (baseline)"
            value={summary.baseline_state_tax}
            format="currency"
          />
          <MetricCard
            label="State tax (reform)"
            value={summary.reform_state_tax}
            format="currency"
          />
          <MetricCard
            label="GA CTC (baseline)"
            value={summary.baseline_ctc}
            format="currency"
          />
          <MetricCard
            label="GA CTC (reform)"
            value={summary.reform_ctc}
            format="currency"
          />
          <MetricCard
            label="Net income change"
            value={summary.net_change}
            format="currency"
            trend={
              summary.net_change > 0
                ? "positive"
                : summary.net_change < 0
                  ? "negative"
                  : "neutral"
            }
            delta={
              summary.net_change >= 0
                ? `+${fmtCurrency(summary.net_change)}`
                : fmtCurrency(summary.net_change)
            }
          />
        </div>
      </section>

      {/* Marginal tax rate comparison */}
      <ChartContainer
        title="Marginal tax rate comparison"
        subtitle="Shows marginal tax rates under baseline and reform across earnings"
      >
        <div className="h-80 sm:h-96 overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mtrData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="earnings"
                type="number"
                domain={[xTicks[0], xTicks[xTicks.length - 1]]}
                ticks={xTicks}
                tickFormatter={fmtCurrency}
                tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              />
              <YAxis
                domain={[yTicksMtr[0], yTicksMtr[yTicksMtr.length - 1]]}
                ticks={yTicksMtr}
                tickFormatter={fmtPercent}
                tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
                width={50}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                separator=": "
                formatter={(v: number) => [fmtPercent(v)]}
                labelFormatter={(v: number) => `Income: ${fmtCurrency(v)}`}
              />
              <Legend />
              <ReferenceLine
                x={household.income}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                label={{ value: "Your income", position: "top", fontSize: 12 }}
              />
              <Line
                type="stepAfter"
                dataKey="baseline"
                name="Baseline MTR"
                stroke="var(--chart-5)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="stepAfter"
                dataKey="reform"
                name="Reform MTR"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
