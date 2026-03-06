"use client";

import type { ReformInputs } from "@/lib/api/types";

interface ReformParamsProps {
  value: ReformInputs;
  onChange: (value: ReformInputs) => void;
  filingStatus: string;
}

export default function ReformParams({ value, onChange, filingStatus }: ReformParamsProps) {
  const update = (patch: Partial<ReformInputs>) => onChange({ ...value, ...patch });

  return (
    <div className="mb-4">
      <details open>
        <summary className="cursor-pointer text-sm font-semibold text-foreground py-2">
          Reform parameters
        </summary>
        <div className="flex flex-col gap-4 pt-2">
          {/* Georgia income tax */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Georgia income tax
            </h4>
            <div className="flex flex-col gap-3">
              {/* Tax rate slider */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Flat income tax rate</span>
                <input
                  type="range"
                  min={0}
                  max={0.0575}
                  step={0.0001}
                  value={value.ga_tax_rate}
                  onChange={(e) => update({ ga_tax_rate: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm font-medium text-foreground">
                  {(value.ga_tax_rate * 100).toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground">Current law: 5.19% (2025)</span>
              </label>

              {/* Standard deduction */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Standard deduction</span>
                <input
                  type="number"
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  min={0}
                  max={100000}
                  step={100}
                  value={value.standard_deduction ?? (filingStatus === "joint" ? 24000 : 12000)}
                  onChange={(e) => update({ standard_deduction: Number(e.target.value) })}
                />
                <span className="text-xs text-muted-foreground">
                  Current law: $12,000 single / $24,000 joint
                </span>
              </label>
            </div>
          </div>

          {/* Georgia child tax credit */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Georgia child tax credit
            </h4>
            <div className="flex flex-col gap-3">
              {/* CTC amount */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Credit amount per child</span>
                <input
                  type="number"
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  min={0}
                  max={10000}
                  step={50}
                  value={value.ctc_amount}
                  onChange={(e) => update({ ctc_amount: Number(e.target.value) })}
                />
              </label>

              {/* Max age */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Maximum qualifying age</span>
                <input
                  type="number"
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  min={1}
                  max={18}
                  value={value.ctc_max_age}
                  onChange={(e) => update({ ctc_max_age: Number(e.target.value) })}
                />
              </label>

              {/* Refundable toggle */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.ctc_refundable}
                  onChange={(e) => update({ ctc_refundable: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Make credit refundable</span>
              </label>

              {/* Phase-out threshold */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">AGI phase-out threshold</span>
                <input
                  type="number"
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  min={0}
                  max={500000}
                  step={1000}
                  value={value.ctc_phaseout_threshold ?? ""}
                  placeholder="None (no phase-out)"
                  onChange={(e) =>
                    update({
                      ctc_phaseout_threshold:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </label>

              {/* Phase-out rate - visible when threshold is set */}
              {value.ctc_phaseout_threshold !== null && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Phase-out rate</span>
                  <input
                    type="number"
                    className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    min={0}
                    max={1}
                    step={0.01}
                    value={value.ctc_phaseout_rate ?? ""}
                    placeholder="e.g. 0.05"
                    onChange={(e) =>
                      update({
                        ctc_phaseout_rate:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
