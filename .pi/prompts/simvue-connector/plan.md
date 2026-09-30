# /simvue-connector plan — plan the connector implementation

Turn the research in `docs/investigation.md` into a concrete implementation plan for this connector.

## Precondition — check first, abort if not met
- `docs/investigation.md` must exist in this repo. If not: **abort** and say to run `/simvue-connector investigate` first (which itself requires `/simvue-connector setup`).

## Steps
1. Read `docs/investigation.md`, `CONNECTOR.md`, the module's `connector.py`, and `examples/connector_example.py`.
2. Read the Simvue docs (https://docs.simvue.io) and python-api code for supported features (Metrics, Events, Metadata, Tags, Alerts, files/Artifacts).
3. Look at existing examples of connectors, eg the FDS connector or MOOSE connector.
4. Write `docs/plan.md` in this repo containing:
   - **Class design**: `<SoftwareName>Run(WrappedRun)`; `launch(...)` signature mirroring how a user actually starts the software (paths, parameters); whether to support `load(...)` for existing results.
   - **Feature mapping**: a table mapping each key output/quantity from the investigation to a Simvue feature and mechanism, using at least:
     - time series → `log_metrics` with `time`/`step`, via `file_monitor.tail`/`scan` + multiparser (or a custom parser in `extras/`)
     - pre-run facts (inputs, parameters, versions) → Metadata/Tags via `init`/`update_metadata`
     - status changes, warnings, errors, completion → Events
     - input/log/result files → `save_file` artifacts (state category and when: pre/during/post)
     - process launch → `add_process` (executable + args per `CONNECTOR.md`, `completion_trigger=self._trigger`)
     - threshold alerts for critical metrics, if warranted
   - **Parsers**: multiparser built-ins to use, or custom parsers to write in `extras/` (input format → parsed fields).
   - **Files to create/modify**: module files, `extras/`, `examples/` (replace the template examples with real ones), `tests/unit/`, `tests/integration/`, `.github/workflows/test_integration.yml` (docker/install steps), `pyproject.toml`, README, CHANGELOG.
   - **Test plan**: unit tests — each parser and connector method, mocked process, sample data files bundled in the repo, no software required; integration tests — end-to-end via the example, parametrised over offline/online, requiring the software + a Simvue server connection.
   - **Milestones**: ordered tasks, each small enough for one session.
3. If beads is active in this repo (`bd where` succeeds; skip entirely if it errors), create one issue per milestone, chained with blocked-by in plan order.
4. Report: `docs/plan.md` written (plus issue ids if created), and that the next step is `/simvue-connector implement`.

## Rules
- No code changes. The only writes are `docs/plan.md` (and beads issues, if in use).
