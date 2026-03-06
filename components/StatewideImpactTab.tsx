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
import { useStatewideImpact } from "@/lib/hooks/useCalculation";
import type { ReformInputs } from "@/lib/api/types";

interface StatewideImpactTabProps {
  reform: ReformInputs;
}

function formatCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) {
    const b = v / 1_000_000_000;
    return `${b < 0 ? "-" : ""}$${Math.abs(b).toFixed(1)}B`;
  }
  if (Math.abs(v) >= 1_000_000) {
    const m = v / 1_000_000;
    return `${m < 0 ? "-" : ""}$${Math.abs(m).toFixed(1)}M`;
  }
  if (v < 0) return `-$${Math.abs(v).toLocaleString()}`;
  return `$${v.toLocaleString()}`;
}

function formatCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

export default function StatewideImpactTab({ reform }: StatewideImpactTabProps) {
  const { data, isLoading, error } = useStatewideImpact(reform);

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
        Failed to load statewide impact data.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary metrics */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Statewide impact summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Revenue change</p>
            <p
              className={`text-xl font-bold ${
                data.revenue_change >= 0 ? "text-teal-600" : "text-destructive"
              }`}
            >
              {formatCompact(data.revenue_change)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Winners</p>
            <p className="text-xl font-bold text-foreground">
              {formatCount(data.winners)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Losers</p>
            <p className="text-xl font-bold text-foreground">
              {formatCount(data.losers)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Poverty rate change</p>
            <p
              className={`text-xl font-bold ${
                data.poverty_rate_change <= 0 ? "text-teal-600" : "text-destructive"
              }`}
            >
              {data.poverty_rate_change > 0 ? "+" : ""}
              {data.poverty_rate_change.toFixed(2)} pp
            </p>
          </div>
        </div>
      </section>

      {/* Poverty detail */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Poverty impact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Overall poverty rate change</p>
            <p className="text-xl font-bold text-foreground">
              {data.poverty_rate_change > 0 ? "+" : ""}
              {data.poverty_rate_change.toFixed(2)} pp
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Child poverty rate change</p>
            <p className="text-xl font-bold text-foreground">
              {data.child_poverty_rate_change > 0 ? "+" : ""}
              {data.child_poverty_rate_change.toFixed(2)} pp
            </p>
          </div>
        </div>
      </section>

      {/* Decile chart */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Average income change by decile
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Shows how the reform affects households across the income distribution
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.decile_impacts}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="decile"
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              label={{ value: "Income decile", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) =>
                v < 0 ? `-$${Math.abs(v)}` : `$${v}`
              }
            />
            <Tooltip
              formatter={(v: number) =>
                v < 0 ? `-$${Math.abs(v).toLocaleString()}` : `$${v.toLocaleString()}`
              }
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
      </section>
    </div>
  );
}
