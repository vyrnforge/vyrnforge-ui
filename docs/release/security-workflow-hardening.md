# Security and Workflow Hardening

BT-8006 makes security validation a mandatory part of the VyrnForge beta
release boundary. The canonical control contract is
[`docs/metadata/security-workflow-hardening.json`](../metadata/security-workflow-hardening.json).

## Mandatory controls

The reusable security workflow performs all of the following:

- reviews pull-request dependency changes and fails on high-severity findings;
- audits shipped, non-development npm dependencies at high severity with
  `npm audit --omit=dev --audit-level=high`;
- runs CodeQL for JavaScript and TypeScript;
- installs the pinned actionlint 1.7.12 binary after validating its SHA-256;
- requires ShellCheck and validates shell files plus workflow shell snippets;
- verifies VyrnForge workflow contracts and immutable external Action pins.

The dependency-review step is pull-request-specific. The shipped-dependency
audit, workflow lint, ShellCheck, CodeQL, and repository security contract run
through the normal CI and scheduled security paths. The release workflow does
not rerun those general validation suites after current-main CI has passed.

## Protected gates

`ci-gate` requires the planned quality, browser, package, consumer,
documentation, and scoped security jobs. A required job that fails, is
cancelled, or is unexpectedly skipped fails the gate. Mandatory jobs may not
use `continue-on-error`.

Compatibility drift remains a nightly responsibility. `nightly-gate` requires
the complete compatibility matrix and security workflow.

The manual release workflow instead uses `verify-release` to confirm that its
source commit is current `main` and that a successful `VyrnForge CI` push run
exists for that exact commit. It does not call the reusable compatibility or
security workflows again.

Release-specific verification then validates the immutable retained release
artifact and, for the non-grid beta group, enforces the approved BT-8004 size
budgets before publication can begin.

## Permission boundaries

Normal validation defaults to `contents: read`. Dependency review receives
`pull-requests: read`, and only the CodeQL workflow receives
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
