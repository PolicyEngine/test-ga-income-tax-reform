"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  calculateHouseholdImpact,
  calculateStatewideImpact,
} from "@/lib/api/client";
import type {
  HouseholdInputs,
  ReformInputs,
  HouseholdResponse,
  StatewideResponse,
} from "@/lib/api/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useHouseholdImpact(
  household: HouseholdInputs,
  reform: ReformInputs,
) {
  const debouncedHousehold = useDebounce(household, 800);
  const debouncedReform = useDebounce(reform, 800);

  return useQuery<HouseholdResponse>({
    queryKey: ["household-impact", debouncedHousehold, debouncedReform],
    queryFn: () =>
      calculateHouseholdImpact({
        filing_status: debouncedHousehold.filing_status,
        head_age: debouncedHousehold.head_age,
        spouse_age:
          debouncedHousehold.filing_status === "joint"
            ? debouncedHousehold.spouse_age
            : undefined,
        dependent_ages: debouncedHousehold.dependent_ages,
        income: debouncedHousehold.income,
        reform: debouncedReform,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useStatewideImpact(reform: ReformInputs, enabled = true) {
  const debouncedReform = useDebounce(reform, 1000);

  return useQuery<StatewideResponse>({
    queryKey: ["statewide-impact", debouncedReform],
    queryFn: ({ signal }) =>
      calculateStatewideImpact({ reform: debouncedReform }, signal),
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled,
  });
}
