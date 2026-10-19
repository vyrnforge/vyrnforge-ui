## Summary

Describe the CI/CD, Pages, permissions, branch-protection, repository automation,
or contribution-infrastructure change and the operational problem it solves.

## PR topology

**Base:** `main` / prerequisite branch

**Depends on:** None / PR # / branch

**Retarget plan if stacked:** None / describe

## Operational impact

**Trigger or planner behavior:** None / describe

**Mainline vs non-mainline behavior:** None / describe

**Permissions, secrets, or OIDC:** None / describe

**Environment or approval flow:** None / `npm-release` / `github-pages` / describe

**Required `ci-gate` or branch-protection behavior:** None / describe

**Release/deployment boundary:** Unchanged / describe

## Safety

- [ ] Pull-request validation remains read-only unless a narrowly scoped operation explicitly requires otherwise.
- [ ] Stacked/non-mainline PR validation cannot publish packages, deploy production Pages, create release records, or bypass the final protected-main gate.
- [ ] Any elevated permission, including `id-token: write` or repository write access, remains job-scoped to the operation that requires it.
- [ ] Pages deployment, npm publication, registry verification, and repository writes remain isolated to the jobs that own those responsibilities.
- [ ] No long-lived npm token, personal access token, or equivalent publishing credential was introduced.
- [ ] Failure, retry, concurrency, cancellation, retargeting, and rollback behavior were considered.

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run verify:workflows`
- [ ] Planner/workflow/template/security-contract tests were updated where behavior changed.
- [ ] Main-target and non-mainline PR behavior were both considered where trigger logic changed.

## Rollout

Describe any repository setting, environment, branch-protection, reviewer rule, or
post-merge step that cannot be represented in source control.
