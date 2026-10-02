# /simvue-connector implement — implement the connector and its tests

Implement the connector per `docs/plan.md`, conforming to the template's structure and conventions.

## Precondition — check first, abort if not met
- `docs/plan.md` must exist in this repo. If not: **abort** and say to run `/simvue-connector plan` first (which requires `/simvue-connector investigate`, which requires `/simvue-connector setup`).

## Steps
1. Read `docs/plan.md`, `docs/investigation.md`, `CONNECTOR.md`, the module's `connector.py`, `examples/`, and `CONTRIBUTING.md`.
2. Implement per the plan:
   - Connector class inheriting `WrappedRun` (`from simvue_connector.connector import WrappedRun`):
     - `_pre_simulation`: call `super()._pre_simulation()`, upload pre-run info, start the software with `self.add_process(...)` (executable/args per `CONNECTOR.md`, `completion_trigger=self._trigger`).
     - `_during_simulation`: use `self.file_monitor` + multiparser to `log_metrics` (with `time`/`step`) and log events as outputs are written.
     - `_post_simulation`: upload result files (`save_file`), log final events, then call `super()._post_simulation()`.
     - `launch(...)`: typed, `@pydantic.validate_call` (+ `@simvue.utilities.prettify_pydantic`), sets state, calls `super().launch()`; add `load(...)` if the plan calls for it.
   - Helpers/parsers in the module's `extras/`.
   - Replace `examples/` with real examples for this software: functions taking `offline: bool` and returning `run.id`, usable from tests.
3. Unit tests in `tests/unit/`: cover each parser and connector method using mocked processes and sample data files bundled in the repo. They must pass **without the simulation software installed**. Run `pytest tests/unit/` and make them pass.
4. Integration tests in `tests/integration/`: end-to-end from the example, parametrised over `offline` in `(True, False)`; they require the simulation software installed and a Simvue server connection (`SIMVUE_URL`/`SIMVUE_TOKEN`). Run them if the environment allows; otherwise state that they are gated on the software/server.
5. Housekeeping per the plan: `pyproject.toml` (name/description), `.github/workflows/test_integration.yml` (docker/install steps), README (remove the template instructions, fill in Implementation/Installation/Usage), CHANGELOG.
6. If beads issues exist for this plan, claim and close them as each milestone is completed.
7. Report: what was implemented, unit test results, integration test status, and what remains for the user (e.g. deployment steps from the README if ready).

## Rules
- Keep template conventions: full typing, ruff/pre-commit, Numpy-style docstrings. Never weaken a test to make it pass.
- When instantiating new attributes for your Connector class, be aware that it will overwrite variables with the same name used in WrappedRun or the base simvue.Run class. Make sure your attribute names do not clash with existing names in WrappedRun or simvue.Run.