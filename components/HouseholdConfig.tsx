"use client";

import {
  InputGroup,
  SelectInput,
  NumberInput,
  SliderInput,
} from "@policyengine/ui-kit";
import type { HouseholdInputs } from "@/lib/api/types";

const FILING_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "joint", label: "Married filing jointly" },
  { value: "head_of_household", label: "Head of household" },
];

interface HouseholdConfigProps {
  value: HouseholdInputs;
  onChange: (value: HouseholdInputs) => void;
}

export default function HouseholdConfig({ value, onChange }: HouseholdConfigProps) {
  const update = (patch: Partial<HouseholdInputs>) => {
    const next = { ...value, ...patch };
    if ("num_dependents" in patch) {
      const n = patch.num_dependents ?? 0;
      const ages = [...next.dependent_ages];
      while (ages.length < n) ages.push(5);
      next.dependent_ages = ages.slice(0, n);
    }
    onChange(next);
  };

  const fmtCurrency = (v: number) =>
    v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <InputGroup label="Household configuration">
      <SelectInput
        label="Filing status"
        options={FILING_STATUS_OPTIONS}
        value={value.filing_status}
        onChange={(v) =>
          update({ filing_status: v as HouseholdInputs["filing_status"] })
        }
      />

      <NumberInput
        label="Your age"
        value={value.head_age}
        onChange={(v) => update({ head_age: v })}
        min={18}
        max={100}
      />

      {value.filing_status === "joint" && (
        <NumberInput
          label="Spouse's age"
          value={value.spouse_age}
          onChange={(v) => update({ spouse_age: v })}
          min={18}
          max={100}
        />
      )}

      <NumberInput
        label="Number of dependents"
        value={value.num_dependents}
        onChange={(v) => update({ num_dependents: v })}
        min={0}
        max={10}
      />

      {value.dependent_ages.map((age, i) => (
        <NumberInput
          key={i}
          label={`Dependent ${i + 1} age`}
          value={age}
          onChange={(v) => {
            const ages = [...value.dependent_ages];
            ages[i] = v;
            update({ dependent_ages: ages });
          }}
          min={0}
          max={18}
        />
      ))}

      <SliderInput
        label="Annual employment income"
        value={value.income}
        onChange={(v) => update({ income: v })}
        min={0}
        max={500000}
        step={1000}
        formatValue={fmtCurrency}
      />
    </InputGroup>
  );
}
