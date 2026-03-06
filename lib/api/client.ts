import type {
  HouseholdRequest,
  HouseholdResponse,
  StatewideRequest,
  StatewideResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://policyengine--ga-income-tax-reform-fastapi-app.modal.run";

/**
 * Calculate household impacts across earnings levels.
 * Calls POST /household-impact on the Modal backend.
 */
export async function calculateHouseholdImpact(
  request: HouseholdRequest
): Promise<HouseholdResponse> {
  const res = await fetch(`${API_BASE_URL}/household-impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Household impact API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Calculate statewide impacts via microsimulation.
 * Calls POST /statewide-impact on the Modal backend.
 */
export async function calculateStatewideImpact(
  request: StatewideRequest
): Promise<StatewideResponse> {
  const res = await fetch(`${API_BASE_URL}/statewide-impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Statewide impact API error ${res.status}: ${text}`);
  }
  return res.json();
}
