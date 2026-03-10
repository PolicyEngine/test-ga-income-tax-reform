"""
GA Income Tax Reform Calculator — Modal gateway.

Lightweight FastAPI app that manages job submission and polling.
No policyengine dependency — computation runs in app.py worker functions.
"""

from __future__ import annotations

import modal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = modal.App("ga-income-tax-reform")

gateway_image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "fastapi",
    "pydantic",
)

# ---------------------------------------------------------------------------
# Map endpoint names to worker function names (in ga-income-tax-reform-workers app)
# ---------------------------------------------------------------------------

WORKER_APP = "ga-income-tax-reform-workers"

FUNCTION_MAP = {
    "household-impact": "compute_household",
    "statewide-impact": "compute_statewide",
}

# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class SubmitResponse(BaseModel):
    job_id: str


class StatusResponse(BaseModel):
    status: str  # "computing" | "ok" | "error"
    result: dict | None = None
    message: str | None = None


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

web_app = FastAPI()
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@web_app.post("/submit/{endpoint}")
def submit(endpoint: str, params: dict):
    """Submit a computation job. Returns immediately with a job_id."""
    if endpoint not in FUNCTION_MAP:
        raise HTTPException(status_code=404, detail=f"Unknown endpoint: {endpoint}")
    fn_name = FUNCTION_MAP[endpoint]
    fn = modal.Function.from_name(WORKER_APP, fn_name)
    call = fn.spawn(params)
    return SubmitResponse(job_id=call.object_id)


@web_app.get("/status/{job_id}")
def status(job_id: str):
    """Poll for job completion. Returns computing/ok/error."""
    from modal.functions import FunctionCall

    call = FunctionCall.from_id(job_id)
    try:
        result = call.get(timeout=0)
        return StatusResponse(status="ok", result=result)
    except TimeoutError:
        return StatusResponse(status="computing")
    except Exception as e:
        return StatusResponse(status="error", message=str(e))


# ---------------------------------------------------------------------------
# Modal ASGI entrypoint — lightweight, no heavy image needed
# ---------------------------------------------------------------------------


@app.function(image=gateway_image)
@modal.asgi_app()
def fastapi_app():
    return web_app
