import type {
  HouseholdRequest,
  HouseholdResponse,
  StatewideRequest,
  StatewideResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://policyengine--ga-income-tax-reform-fastapi-app.modal.run";

console.log("[api] API_BASE_URL:", API_BASE_URL);

/**
 * Calculate household impacts across earnings levels.
 * Calls POST /household-impact on the Modal backend.
 */
export async function calculateHouseholdImpact(
  request: HouseholdRequest,
): Promise<HouseholdResponse> {
  console.log("[api] household-impact request:", JSON.stringify(request.reform));
  const res = await fetch(`${API_BASE_URL}/household-impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Household impact API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  console.log("[api] household-impact response summary:", data.summary);
  return data;
}

/**
 * Calculate statewide impacts via microsimulation.
 * Calls POST /statewide-impact on the Modal backend.
 */
export async function calculateStatewideImpact(
  request: StatewideRequest,
  signal?: AbortSignal,
): Promise<StatewideResponse> {
  const res = await fetch(`${API_BASE_URL}/statewide-impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Statewide impact API error ${res.status}: ${text}`);
  }
  return res.json();
}
