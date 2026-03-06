"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartContainer, MetricCard } from "@policyengine/ui-kit";
import { useStatewideImpact } from "@/lib/hooks/useCalculation";
import type { ReformInputs } from "@/lib/api/types";

interface StatewideImpactTabProps {
  reform: ReformInputs;
}

const fmtCurrency = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function formatCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) {
    return (v / 1_000_000_000).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
    }) + "B";
  }
  if (Math.abs(v) >= 1_000_000) {
    return (v / 1_000_000).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
    }) + "M";
  }
  return fmtCurrency(v);
}

function formatCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

const TOOLTIP_STYLE = {
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "0.5rem 0.75rem",
};

export default function StatewideImpactTab({ reform }: StatewideImpactTabProps) {
  const { data, isLoading, isFetching, error } = useStatewideImpact(reform);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <span className="text-sm">Running microsimulation...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        <div className="text-center">
          <p className="font-semibold">Failed to load statewide impact data</p>
          <p className="text-sm text-muted-foreground mt-1">
            Microsimulation may take up to 60 seconds. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const povertyPp = (v: number) =>
    `${v > 0 ? "+" : ""}${v.toFixed(2)} pp`;

  return (
    <div className={`flex flex-col gap-8 transition-opacity duration-200${isFetching ? " opacity-60" : ""}`}>
      {/* Summary metrics */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Statewide impact summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Revenue change"
            value={formatCompact(data.revenue_change)}
            trend={
              data.revenue_change > 0
                ? "positive"
                : data.revenue_change < 0
                  ? "negative"
                  : "neutral"
            }
          />
          <MetricCard
            label="Winners"
            value={formatCount(data.winners)}
          />
          <MetricCard
            label="Losers"
            value={formatCount(data.losers)}
          />
          <MetricCard
            label="Poverty rate change"
            value={povertyPp(data.poverty_rate_change)}
            trend={
              data.poverty_rate_change < 0
                ? "positive"
                : data.poverty_rate_change > 0
                  ? "negative"
                  : "neutral"
            }
          />
        </div>
      </section>

      {/* Poverty detail */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Poverty impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Overall poverty rate change"
            value={povertyPp(data.poverty_rate_change)}
            trend={
              data.poverty_rate_change < 0
                ? "positive"
                : data.poverty_rate_change > 0
                  ? "negative"
                  : "neutral"
            }
          />
          <MetricCard
            label="Child poverty rate change"
            value={povertyPp(data.child_poverty_rate_change)}
            trend={
              data.child_poverty_rate_change < 0
                ? "positive"
                : data.child_poverty_rate_change > 0
                  ? "negative"
                  : "neutral"
            }
          />
        </div>
      </section>

      {/* Decile chart */}
      <ChartContainer
        title="Average income change by decile"
        subtitle="Shows how the reform affects households across the income distribution"
      >
        <div className="h-72 sm:h-80 overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.decile_impacts}
            margin={{ left: 10, right: 10, top: 10, bottom: 20 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="decile"
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={fmtCurrency}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              separator=": "
              formatter={(v: number) => [fmtCurrency(v), "Avg. change"]}
              labelFormatter={(v) => `Decile ${v}`}
            />
            <Bar dataKey="avg_income_change" name="Average income change">
              {data.decile_impacts.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.avg_income_change >= 0
                      ? "var(--chart-1)"
                      : "var(--destructive)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
