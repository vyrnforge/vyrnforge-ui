# Security and Workflow Hardening

BT-8006 makes security validation a mandatory part of the VyrnForge beta
release path. The canonical control contract is
[`docs/metadata/security-workflow-hardening.json`](../metadata/security-workflow-hardening.json).

## Mandatory controls

The reusable security workflow performs all of the following:

- reviews pull-request dependency changes and fails on high-severity findings;
- audits shipped, non-development npm dependencies at high severity with `npm audit --omit=dev --audit-level=high`;
- runs CodeQL for JavaScript and TypeScript;
- installs the pinned actionlint 1.7.12 binary after validating its SHA-256;
- requires ShellCheck and validates shell files plus workflow shell snippets;
- verifies VyrnForge workflow contracts and immutable external Action pins.

The dependency-review step is pull-request-specific. The shipped-dependency audit, workflow lint,
ShellCheck, CodeQL, and repository security contract run for pull requests,
main pushes, manual executions, scheduled validation, and release preflight.

## Protected gates

`ci-gate` requires the planned quality, browser, package, consumer, and
documentation jobs plus the complete compatibility and security workflows.
A required job that fails, is cancelled, or is unexpectedly skipped fails the
gate. Mandatory jobs may not use `continue-on-error`.

`nightly-gate` requires the complete compatibility matrix and security workflow.
The manual release workflow runs both reusable workflows before
`verify-release`; the non-grid beta path also recreates package artifacts and
enforces the approved BT-8004 size budgets before publication can begin.

## Permission boundaries

Normal validation defaults to `contents: read`. Dependency review receives
`pull-requests: read`, and only the CodeQL workflow receives
`security-events: write`. npm OIDC remains isolated to the protected
`publish-packages` job. Long-lived npm or personal access token references are
forbidden.

## Verification

```bash
npm run test:security-workflow-hardening
npm run verify:security-workflow-hardening
npm run verify:workflows
```
