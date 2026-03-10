"""
GA Income Tax Reform Calculator — Modal worker app.

Only `modal` at module level. All policyengine/pydantic imports live in
simulation.py and are captured in the image snapshot via _image_setup.py.
"""

import modal
from pathlib import Path
from _image_setup import snapshot_models

_BACKEND_DIR = Path(__file__).parent

app = modal.App("ga-income-tax-reform-workers")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("policyengine-us==1.592.4", "pydantic")
    .run_function(snapshot_models)
    .add_local_file(str(_BACKEND_DIR / "simulation.py"), remote_path="/root/simulation.py")
)


@app.function(image=image, cpu=8.0, memory=32768, timeout=3600)
def compute_household(params: dict) -> dict:
    from simulation import run_household

    return run_household(params)


@app.function(image=image, cpu=8.0, memory=32768, timeout=3600)
def compute_statewide(params: dict) -> dict:
    from simulation import run_statewide

    return run_statewide(params)
