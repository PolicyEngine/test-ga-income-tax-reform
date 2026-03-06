// API client stubs for GA Income Tax Reform calculator
// TODO: Replace stubs with real Modal API calls when backend is deployed

import { fixtures } from "./fixtures";
import type {
  HouseholdRequest,
  HouseholdResponse,
  StatewideRequest,
  StatewideResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Stub: Calculate household impacts across earnings levels
 * Will call POST /household-impact on the Modal backend when integrated
 */
export async function calculateHouseholdImpact(
  request: HouseholdRequest
): Promise<HouseholdResponse> {
  // TODO: Replace with real Modal API call:
  // const res = await fetch(`${API_BASE_URL}/household-impact`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(request),
  // });
  // if (!res.ok) throw new Error(`API error: ${res.status}`);
  // return res.json();

  void request;
  void API_BASE_URL;
  return fixtures.defaultHouseholdResponse;
}

/**
 * Stub: Calculate statewide impacts via microsimulation
 * Will call POST /statewide-impact on the Modal backend when integrated
 */
export async function calculateStatewideImpact(
  request: StatewideRequest
): Promise<StatewideResponse> {
  // TODO: Replace with real Modal API call:
  // const res = await fetch(`${API_BASE_URL}/statewide-impact`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(request),
  // });
  // if (!res.ok) throw new Error(`API error: ${res.status}`);
  // return res.json();

  void request;
  return fixtures.defaultStatewideResponse;
}
