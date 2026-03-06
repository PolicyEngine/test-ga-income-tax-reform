"use client";

import { useState } from "react";
import HouseholdConfig from "@/components/HouseholdConfig";
import ReformParams from "@/components/ReformParams";
import HouseholdImpactTab from "@/components/HouseholdImpactTab";
import StatewideImpactTab from "@/components/StatewideImpactTab";
import type { HouseholdInputs, ReformInputs } from "@/lib/api/types";

const DEFAULT_HOUSEHOLD: HouseholdInputs = {
  filing_status: "single",
  head_age: 40,
  spouse_age: 40,
  num_dependents: 0,
  dependent_ages: [],
  income: 50000,
};

const DEFAULT_REFORM: ReformInputs = {
  ga_tax_rate: 0.0519,
  standard_deduction: 12000,
  ctc_amount: 250,
  ctc_max_age: 6,
  ctc_refundable: false,
  ctc_phaseout_threshold: null,
  ctc_phaseout_rate: null,
};

export default function Home() {
  const [household, setHousehold] = useState<HouseholdInputs>(DEFAULT_HOUSEHOLD);
  const [reform, setReform] = useState<ReformInputs>(DEFAULT_REFORM);
  const [activeTab, setActiveTab] = useState<"household" | "statewide">("household");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">
          Georgia income tax & child tax credit reform calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Model the impact of Georgia&apos;s flat income tax rate and Child Tax Credit on your household and statewide
        </p>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-sidebar border-r border-border bg-card p-4 overflow-y-auto md:min-h-[calc(100vh-73px)]">
          <HouseholdConfig value={household} onChange={setHousehold} />
          <ReformParams
            value={reform}
            onChange={setReform}
            filingStatus={household.filing_status}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "household"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("household")}
            >
              Household impact
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "statewide"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("statewide")}
            >
              Statewide impact
            </button>
          </div>

          {activeTab === "household" ? (
            <HouseholdImpactTab household={household} reform={reform} />
          ) : (
            <StatewideImpactTab reform={reform} />
          )}
        </main>
      </div>
    </div>
  );
}
