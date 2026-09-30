# /setup — bootstrap a new connector repository

Create a new local connector repo from this template for a simulation software, and verify that the software can be run locally.

## Precondition — check first, abort if not met
- Must be run from (or pointed at) the `connectors-template` repo.
- If `pyproject.toml` here is no longer named `simvue-template`, setup was already done here: **abort** and say to run `/investigate` next.
- If `connectors-<software>` already exists, ask the user whether to resume in it or abort. Never overwrite.

## Steps
1. Establish the simulation software name (ask the user if not given). Naming: repo `connectors-<software_name>` (lowercase, hyphens), module `simvue-<software_name>`, class `<SoftwareName>Run`.
2. Copy this template (excluding `.git`) to `connectors-<software_name>` beside it, then `git init` inside the copy.
3. In the new repo, replace all template references (grep for `simvue_template`, `simvue-template`, `YourRun`, `your-module-name`, `your_module_name`):
   - Rename `simvue_template/` → `simvue_<software_name>/` (including `__init__.py` and imports).
   - `pyproject.toml`: `name` → `simvue-<software_name>`, description, repository URL.
   - README title/description, `CITATION.cff`, `.github/workflows/deploy.yaml`.
4. Verify the simulation software locally:
   - Locate its executable (PATH, common install locations, `--version`/`--help`).
   - If found, run a minimal quickstart simulation to confirm it works; record the exact working command line.
   - If not found or not runnable, **ask the user** to provide a way to run it (install instructions, conda/pip env, Docker image/command, or remote host). Record their answer.
5. Create `CONNECTOR.md` at the root of the new repo: software name and version, how to run it (verified command or user-provided method), quickstart input file if one exists.
6. Report: new repo path, software access status (verified / user-provided method), and that the next step is `/investigate` in the new repo.

## Rules
- No connector code. Read the template; write only inside the new repo.
