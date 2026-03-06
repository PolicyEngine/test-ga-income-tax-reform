"use client";

import {
  InputGroup,
  NumberInput,
  SliderInput,
  CheckboxInput,
  CurrencyInput,
} from "@policyengine/ui-kit";
import type { ReformInputs } from "@/lib/api/types";

interface ReformParamsProps {
  value: ReformInputs;
  onChange: (value: ReformInputs) => void;
  filingStatus: string;
}

export default function ReformParams({
  value,
  onChange,
  filingStatus,
}: ReformParamsProps) {
  const update = (patch: Partial<ReformInputs>) =>
    onChange({ ...value, ...patch });

  const fmtPercent = (v: number) => `${(v * 100).toFixed(2)}%`;

  return (
    <InputGroup label="Reform parameters">
      {/* Georgia income tax */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">
          Georgia income tax
        </h4>

        <SliderInput
          label="Flat income tax rate"
          value={value.ga_tax_rate}
          onChange={(v) => update({ ga_tax_rate: v })}
          min={0}
          max={0.0575}
          step={0.0001}
          formatValue={fmtPercent}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Current law: 5.19% (2025)
        </p>

        <CurrencyInput
          label="Standard deduction"
          value={
            value.standard_deduction ??
            (filingStatus === "joint" ? 24000 : 12000)
          }
          onChange={(v) => update({ standard_deduction: v })}
          min={0}
          max={100000}
          step={100}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Current law: $12,000 single / $24,000 joint
        </p>
      </div>

      {/* Georgia child tax credit */}
      <div className="flex flex-col gap-3 mt-2">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">
          Georgia Child Tax Credit
        </h4>

        <CurrencyInput
          label="Credit amount per child"
          value={value.ctc_amount}
          onChange={(v) => update({ ctc_amount: v })}
          min={0}
          max={10000}
          step={50}
        />

        <NumberInput
          label="Maximum qualifying age"
          value={value.ctc_max_age}
          onChange={(v) => update({ ctc_max_age: v })}
          min={1}
          max={18}
        />

        <CheckboxInput
          label="Make credit refundable"
          checked={value.ctc_refundable}
          onChange={(v) => update({ ctc_refundable: v })}
        />

        <CurrencyInput
          label="AGI phase-out threshold"
          value={value.ctc_phaseout_threshold ?? 0}
          onChange={(v) =>
            update({ ctc_phaseout_threshold: v === 0 ? null : v })
          }
          min={0}
          max={500000}
          step={1000}
        />
        {value.ctc_phaseout_threshold === null && (
          <p className="text-xs text-muted-foreground -mt-2">
            Set to 0 or leave at $0 for no phase-out
          </p>
        )}

        {value.ctc_phaseout_threshold !== null && (
          <NumberInput
            label="Phase-out rate"
            value={value.ctc_phaseout_rate ?? 0}
            onChange={(v) =>
              update({ ctc_phaseout_rate: v === 0 ? null : v })
            }
            min={0}
            max={1}
            step={0.01}
          />
        )}
      </div>
    </InputGroup>
  );
}
