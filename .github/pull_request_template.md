## Summary

Describe the focused change, the problem it solves, and why it belongs in VyrnForge UI or its repository infrastructure.

<!--
This is the compact fallback template. Prefer a focused template from
.github/PULL_REQUEST_TEMPLATE when the change is clearly one of these:
- component-or-package.md
- docs-and-examples.md
- change-manifest.md
- ci-cd-infrastructure.md
- release.md
- repository-maintenance.md

The selected template helps reviewers; scripts/detect-ci-scope.mjs remains
authoritative for checks executed by CI.
-->

## Scope

Select every affected area.

- [ ] Documentation or repository text
- [ ] Playground or examples
- [ ] `@vyrnforge/ui-core`
- [ ] `@vyrnforge/ui-behaviors`
- [ ] `@vyrnforge/ui-components`
- [ ] `@vyrnforge/ui-elements`
- [ ] `@vyrnforge/ui-data-grid`
- [ ] Workspace, tooling, or repository maintenance
- [ ] CI/CD, Pages, release automation, or governance
- [ ] Coordinated package release

## Impact

**Public API or CSS contract:** None / additive / breaking / not applicable

**Release or deployment:** None / Pages / npm / Git tag and GitHub Release / not applicable

**Permissions, secrets, OIDC, or branch protection:** None / describe below

## Validation

- [ ] Relevant targeted checks passed.
- [ ] The generated CI plan matches the intended scope and `ci-gate` should represent the merge decision.
- [ ] `npm run verify:ci` passed when workflow, planner, release, or repository-template files changed.
- [ ] `npm run quality` passed once when full validation is required.
- [ ] No credentials, `.env` files, `node_modules`, logs, archives, build output, or generated package artifacts were committed.

## Notes

List limitations, follow-up work, intentionally deferred checks, or required post-merge actions.
