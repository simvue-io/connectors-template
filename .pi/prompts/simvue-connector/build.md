# /simvue-connector build — run the full connector pipeline

Run `/simvue-connector setup` → `/simvue-connector investigate` → `/simvue-connector plan` → `/simvue-connector implement` in order, each in a fresh context.

## Precondition — check first, abort if not met
- Must be run from (or pointed at) the `connectors-template` repo.
- Ask the user for the simulation software name if not provided, and confirm where the new repo should be created (default: beside the template). Do not start before both are confirmed.

## Steps
For each stage, in order — `setup`, `investigate`, `plan`, `implement`:
1. Spawn a fresh subagent (new context window) whose task is the full contents of `.pi/prompts/simvue-connector/<stage>.md`, with this appended context:
   - `setup`: the software name.
   - stages 2–4: working directory = the new repo path (recorded from the `setup` stage's report).
2. Wait for the stage to finish, then verify its completion artifact before proceeding:
   - `setup` → `connectors-<software>/` exists and contains `CONNECTOR.md`
   - `investigate` → `docs/investigation.md` exists in the new repo
   - `plan` → `docs/plan.md` exists in the new repo
   - `implement` → connector implemented and `pytest tests/unit/` passes
3. If a stage aborts, fails, or leaves its artifact missing: **stop the pipeline**, report the stage's output, and tell the user how to re-run just that stage (e.g. run `/simvue-connector investigate` in the new repo). Never skip or reorder stages.

Final report: summary of all four stages, the new repo path, and what remains for the user (e.g. integration tests that need the software installed, deployment).
