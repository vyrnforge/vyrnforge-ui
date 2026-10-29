# CI operations

`tooling/ci/` owns repository automation that supports CI operations but is not product validation logic. GitHub Actions workflow YAML remains orchestration; validation selection and dependency truth remain under `tooling/impact/`.

The current capabilities are workflow-run/artifact evidence retention and stale branch retention. Their policies, planners, cleanup implementation, report generation, and tests stay together here. Repository retention uses the existing scheduled cleanup executor rather than a second task graph or parallel automation stack.

Do not place general test runners, product verification, build scripts, release composition, or workflow-specific one-off shell replacements here. Add CI tooling only when the capability is genuinely operational and reusable across workflows.
