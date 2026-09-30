# Security and Workflow Hardening

This document defines the current security controls for VyrnForge delivery. The
machine-readable control contract is
[`docs/metadata/security-workflow-hardening.json`](../metadata/security-workflow-hardening.json).

## Mandatory controls

`VyrnForge CI` runs on pull requests to protected `main`. Its security job
performs high-severity `dependency-review`, installs the pinned actionlint
1.7.12 binary after SHA-256 verification, requires ShellCheck, and verifies the
repository workflow/security contracts.

`VyrnForge Weekly Assurance` owns expensive drift checks: shipped dependency
audit, the full compatibility matrix, workflow lint, ShellCheck, and CodeQL.

The release workflow does not repeat those general suites after protected
current-main CI has passed.

## Protected gates

`ci-gate` is the merge-facing status for `main`. It aggregates the selected
quality, integration, documentation, and security responsibilities. Required
jobs may not conceal failures with `continue-on-error`.

`assurance-gate` aggregates weekly quality, integration, compatibility,
security drift, and CodeQL.

The manual release workflow uses `verify-release` to confirm that the source
commit is current `main` and has successful VyrnForge CI evidence before
release-specific artifact verification and publication can proceed.

## Permission boundaries

Normal validation defaults to `contents: read`. Dependency review receives
`pull-requests: read`. Only the CodeQL job in Weekly Assurance receives
`security-events: write`.

npm OIDC remains isolated to the protected package-publishing job. Pages
permissions remain isolated to the Pages deployment workflow. Long-lived npm or
personal-access credentials are forbidden.

## Verification

```bash
npm run verify:security-workflow-hardening
npm run verify:workflows
```
