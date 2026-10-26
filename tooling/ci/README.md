# CI operations

`tooling/ci/` owns repository automation that supports CI operations but is not product validation logic. GitHub Actions workflow YAML remains orchestration; validation selection and dependency truth remain under `tooling/impact/`.

The current capability is workflow-run and artifact evidence retention. Its policy, planner, cleanup implementation, report generation, and tests stay together here.

Do not place general test runners, product verification, build scripts, release composition, or workflow-specific one-off shell replacements here. Add CI tooling only when the capability is genuinely operational and reusable across workflows.
