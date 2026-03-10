"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DashboardShell,
  Header,
  SidebarLayout,
  InputPanel,
  ResultsPanel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  logos,
} from "@policyengine/ui-kit";
import HouseholdConfig from "@/components/HouseholdConfig";
import ReformParams from "@/components/ReformParams";
import HouseholdImpactTab from "@/components/HouseholdImpactTab";
import StatewideImpactTab from "@/components/StatewideImpactTab";
import { updateHash, getCountryFromHash } from "@/lib/embedding";
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
  standard_deduction: null,
  ctc_amount: 250,
  ctc_max_age: 6,
  ctc_refundable: false,
  ctc_phaseout_threshold: null,
  ctc_phaseout_rate: null,
};

export default function Home() {
  const [household, setHousehold] = useState<HouseholdInputs>(DEFAULT_HOUSEHOLD);
  const [reform, setReform] = useState<ReformInputs>(DEFAULT_REFORM);
  const [activeTab, setActiveTab] = useState("household");
  const [countryId] = useState(() => getCountryFromHash());

  const handleHouseholdChange = useCallback(
    (next: HouseholdInputs) => {
      setHousehold(next);
      updateHash(
        {
          filing_status: next.filing_status,
          income: String(next.income),
          dependents: String(next.num_dependents),
        },
        countryId,
      );
    },
    [countryId],
  );

  useEffect(() => {
    updateHash(
      {
        filing_status: household.filing_status,
        income: String(household.income),
        dependents: String(household.num_dependents),
      },
      countryId,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardShell>
      <Header
        variant="dark"
        logo={
          <img src={logos.whiteWordmark} alt="PolicyEngine" className="h-5" />
        }
      >
        <span className="ml-2 text-sm sm:text-lg font-bold text-white">
          Georgia income tax &amp; CTC reform calculator
        </span>
      </Header>
      <SidebarLayout
        sidebar={
          <InputPanel title="Settings">
            <HouseholdConfig value={household} onChange={handleHouseholdChange} />
            <ReformParams
              value={reform}
              onChange={setReform}
              filingStatus={household.filing_status}
            />
          </InputPanel>
        }
      >
        <ResultsPanel>
          <Tabs defaultValue="household" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="household">Household impact</TabsTrigger>
              <TabsTrigger value="statewide">Statewide impact</TabsTrigger>
            </TabsList>
            <TabsContent value="household">
              <HouseholdImpactTab household={household} reform={reform} />
            </TabsContent>
            <TabsContent value="statewide">
              <StatewideImpactTab reform={reform} enabled={activeTab === "statewide"} />
            </TabsContent>
          </Tabs>
        </ResultsPanel>
      </SidebarLayout>
    </DashboardShell>
  );
}
