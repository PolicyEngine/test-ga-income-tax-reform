"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useHouseholdImpact } from "@/lib/hooks/useCalculation";
import type { HouseholdInputs, ReformInputs } from "@/lib/api/types";

interface HouseholdImpactTabProps {
  household: HouseholdInputs;
  reform: ReformInputs;
}

function formatCurrency(v: number): string {
  if (v < 0) return `-$${Math.abs(v).toLocaleString()}`;
  return `$${v.toLocaleString()}`;
}

export default function HouseholdImpactTab({
  household,
  reform,
}: HouseholdImpactTabProps) {
  const { data, isLoading, error } = useHouseholdImpact(household, reform);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        Failed to load household impact data.
      </div>
    );
  }

  // Prepare line chart data
  const lineData = data.earnings_axis.map((earnings, i) => ({
    earnings,
    baseline: data.baseline_net_income[i],
    reform: data.reform_net_income[i],
  }));

  // Prepare MTR chart data
  const mtrData = data.earnings_axis.map((earnings, i) => ({
    earnings,
    baseline: data.baseline_mtr[i],
    reform: data.reform_mtr[i],
  }));

  const { summary } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* Net income by earnings level */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Net income by earnings level
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Compares household net income under baseline and reform across earnings
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lineData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="earnings"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) => formatCurrency(v)}
              label={{ value: "Employment income", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) => formatCurrency(v)}
            />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="var(--chart-5)"
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="reform"
              name="Reform"
              stroke="var(--chart-1)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Summary card */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your household impact
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">State tax (baseline)</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.baseline_state_tax)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">State tax (reform)</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.reform_state_tax)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">GA CTC (baseline)</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.baseline_ctc)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">GA CTC (reform)</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.reform_ctc)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 col-span-2 md:col-span-1">
            <p className="text-sm text-muted-foreground">Net income change</p>
            <p
              className={`text-xl font-bold ${
                summary.net_change >= 0 ? "text-teal-600" : "text-destructive"
              }`}
            >
              {summary.net_change >= 0 ? "+" : ""}
              {formatCurrency(summary.net_change)}
            </p>
          </div>
        </div>
      </section>

      {/* Marginal tax rate chart */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Marginal tax rate comparison
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Shows marginal tax rates under baseline and reform across earnings
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mtrData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="earnings"
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) => formatCurrency(v)}
              label={{ value: "Employment income", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
            <Legend />
            <Bar dataKey="baseline" name="Baseline MTR" fill="var(--chart-5)" />
            <Bar dataKey="reform" name="Reform MTR" fill="var(--chart-1)" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
