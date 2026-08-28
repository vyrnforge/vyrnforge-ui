# Security and Workflow Hardening

BT-8006 makes security validation a mandatory part of the VyrnForge beta
release boundary. The canonical control contract is
[`docs/metadata/security-workflow-hardening.json`](../metadata/security-workflow-hardening.json).

## Mandatory controls

Security responsibilities are owned directly by the two validation lifecycle
workflows rather than by a separately exposed reusable workflow.

`VyrnForge CI` performs pull-request dependency review when the change planner
selects security work, fails on high-severity findings, installs the pinned
actionlint 1.7.12 binary after validating its SHA-256, requires ShellCheck, and
verifies VyrnForge workflow/security contracts and immutable external Action
pins.

`VyrnForge Weekly Assurance` owns deep drift validation. It audits shipped,
non-development npm dependencies at high severity with
`npm audit --omit=dev --audit-level=high`, runs CodeQL for JavaScript and
TypeScript, repeats workflow lint and ShellCheck, and runs the complete
compatibility matrix.

The release workflow does not rerun those general validation suites after
current-main CI has passed.

## Protected gates

`ci-gate` requires the planner-selected quality, integration, and security
responsibilities. A required job that fails, is cancelled, or is unexpectedly
skipped fails the gate. Mandatory jobs may not use `continue-on-error`.

Deep ecosystem and security drift are owned by `VyrnForge Weekly Assurance`.
`assurance-gate` requires full quality, full integration, the complete
compatibility matrix, dependency/security drift validation, and CodeQL.

The manual release workflow uses `verify-release` to confirm that its source
commit is current `main` and that a successful `VyrnForge CI` push run exists
for that exact commit. Release-specific verification then validates the
immutable retained release artifact and enforces release-line size budgets
before publication can begin.

## Permission boundaries

Normal validation defaults to `contents: read`. Dependency review receives
`pull-requests: read`. Only the CodeQL job in weekly assurance receives
`security-events: write`.

Release verification receives only the read access required to confirm the
successful current-main CI run and retrieve release evidence. npm OIDC remains
isolated to the protected `publish-packages` job. Long-lived npm or personal
access token references are forbidden.

## Verification

```bash
npm run test:security-workflow-hardening
npm run verify:security-workflow-hardening
npm run verify:workflows
```
