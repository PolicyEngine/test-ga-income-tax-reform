"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateHouseholdImpact, calculateStatewideImpact } from "@/lib/api/client";
import type {
  HouseholdInputs,
  ReformInputs,
  HouseholdResponse,
  StatewideResponse,
} from "@/lib/api/types";

export function useHouseholdImpact(
  household: HouseholdInputs,
  reform: ReformInputs
) {
  return useQuery<HouseholdResponse>({
    queryKey: ["household-impact", household, reform],
    queryFn: () =>
      calculateHouseholdImpact({
        filing_status: household.filing_status,
        head_age: household.head_age,
        spouse_age: household.filing_status === "joint" ? household.spouse_age : undefined,
        dependent_ages: household.dependent_ages,
        income: household.income,
        reform,
      }),
  });
}

export function useStatewideImpact(reform: ReformInputs) {
  return useQuery<StatewideResponse>({
    queryKey: ["statewide-impact", reform],
    queryFn: () => calculateStatewideImpact({ reform }),
  });
}
