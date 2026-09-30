# /simvue-connector investigate — research the simulation software

Discover what users of the target simulation software would want to upload to Simvue before, during and after a run, based on its input/output files.

## Precondition — check first, abort if not met
- Must be inside a connector repo created by `/simvue-connector setup` (i.e. `CONNECTOR.md` exists). If not: **abort** and say to run `/simvue-connector setup` first.

## Steps
1. Read `CONNECTOR.md`.
2. Research the software, preferring primary sources:
   - Documentation: local installation, official docs site, `--help`/man pages.
   - If open source: shallow-clone the codebase to a scratch location (not into this repo) and study input parsing and output writing.
   - Identify: input files a user provides; every output file (name, format, when written: before/during/after); log files; success/failure markers; key quantities with units; how progress and completion are signalled.
3. Write `docs/investigation.md` in this repo with these sections:
   - **Overview**: what the software does; a typical run (inputs → command → outputs).
   - **Before run**: inputs/settings worth uploading (Metadata/Artifact candidates).
   - **During run**: files written live; key quantities (name, units, time/step fields); progress and completion signals.
   - **After run**: final result files (Artifact candidates); summary/verdict information and error messages (Event candidates).
   - **Metric candidates**: quantities users would monitor or alert on.
   - **Open questions**: gaps to resolve during planning.
4. Report: file written, key findings, and that the next step is `/simvue-connector plan`.

## Rules
- Research only. The only write into this repo is `docs/investigation.md`.
