"use client";

import type { HouseholdInputs } from "@/lib/api/types";

interface HouseholdConfigProps {
  value: HouseholdInputs;
  onChange: (value: HouseholdInputs) => void;
}

export default function HouseholdConfig({ value, onChange }: HouseholdConfigProps) {
  const update = (patch: Partial<HouseholdInputs>) => {
    const next = { ...value, ...patch };
    // Sync dependent_ages array length with num_dependents
    if ("num_dependents" in patch) {
      const n = patch.num_dependents ?? 0;
      const ages = [...next.dependent_ages];
      while (ages.length < n) ages.push(5);
      next.dependent_ages = ages.slice(0, n);
    }
    onChange(next);
  };

  return (
    <div className="mb-4">
      {/* TODO: Replace with ui-kit Accordion when available */}
      <details open>
        <summary className="cursor-pointer text-sm font-semibold text-foreground py-2">
          Household configuration
        </summary>
        <div className="flex flex-col gap-3 pt-2">
          {/* Filing status */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Filing status</span>
            <select
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={value.filing_status}
              onChange={(e) =>
                update({
                  filing_status: e.target.value as HouseholdInputs["filing_status"],
                })
              }
            >
              <option value="single">Single</option>
              <option value="joint">Married filing jointly</option>
              <option value="head_of_household">Head of household</option>
            </select>
          </label>

          {/* Head age */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Your age</span>
            <input
              type="number"
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              min={18}
              max={100}
              value={value.head_age}
              onChange={(e) => update({ head_age: Number(e.target.value) })}
            />
          </label>

          {/* Spouse age - visible when joint */}
          {value.filing_status === "joint" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Spouse&apos;s age</span>
              <input
                type="number"
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                min={18}
                max={100}
                value={value.spouse_age}
                onChange={(e) => update({ spouse_age: Number(e.target.value) })}
              />
            </label>
          )}

          {/* Number of dependents */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Number of dependents</span>
            <input
              type="number"
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              min={0}
              max={10}
              value={value.num_dependents}
              onChange={(e) => update({ num_dependents: Number(e.target.value) })}
            />
          </label>

          {/* Dependent ages */}
          {value.dependent_ages.map((age, i) => (
            <label key={i} className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Dependent {i + 1} age
              </span>
              <input
                type="number"
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                min={0}
                max={18}
                value={age}
                onChange={(e) => {
                  const ages = [...value.dependent_ages];
                  ages[i] = Number(e.target.value);
                  update({ dependent_ages: ages });
                }}
              />
            </label>
          ))}

          {/* Income slider */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Annual employment income
            </span>
            <input
              type="range"
              min={0}
              max={500000}
              step={1000}
              value={value.income}
              onChange={(e) => update({ income: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm font-medium text-foreground">
              ${value.income.toLocaleString()}
            </span>
          </label>
        </div>
      </details>
    </div>
  );
}
