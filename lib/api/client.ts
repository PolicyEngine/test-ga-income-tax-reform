import type {
  HouseholdRequest,
  HouseholdResponse,
  StatewideRequest,
  StatewideResponse,
  StatusResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://policyengine--ga-income-tax-reform-fastapi-app.modal.run";

const POLL_INTERVAL_MS = 2000;

/**
 * Submit a job to the gateway. Returns a job_id immediately.
 */
async function submitJob(endpoint: string, params: unknown): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/submit/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Submit failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.job_id;
}

/**
 * Poll the gateway for job status.
 */
async function pollStatus(jobId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE_URL}/status/${jobId}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Status check failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Wait for a poll interval.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submit a job and poll until complete. Each individual HTTP call is fast
 * (avoids Modal's ~150s gateway timeout), but the overall cycle may take
 * minutes for microsimulations.
 */
async function submitAndPoll<T>(endpoint: string, params: unknown): Promise<T> {
  const jobId = await submitJob(endpoint, params);

  while (true) {
    const status = await pollStatus(jobId);

    if (status.status === "ok") {
      return status.result as T;
    }
    if (status.status === "error") {
      throw new Error(status.message || "Computation failed");
    }

    // status === "computing" — wait and poll again
    await sleep(POLL_INTERVAL_MS);
  }
}

/**
 * Calculate household impacts across earnings levels.
 * Submits to gateway, polls for result.
 */
export async function calculateHouseholdImpact(
  request: HouseholdRequest,
): Promise<HouseholdResponse> {
  return submitAndPoll<HouseholdResponse>("household-impact", request);
}

/**
 * Calculate statewide impacts via microsimulation.
 * Submits to gateway, polls for result. May take 2-5+ minutes.
 */
export async function calculateStatewideImpact(
  request: StatewideRequest,
): Promise<StatewideResponse> {
  return submitAndPoll<StatewideResponse>("statewide-impact", request);
}
