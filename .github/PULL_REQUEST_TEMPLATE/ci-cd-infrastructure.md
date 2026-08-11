## Summary

Describe the CI/CD, Pages, permissions, branch-protection, or repository
automation change and the operational problem it solves.

## Operational impact

**Trigger or planner behavior:** None / describe

**Permissions, secrets, or OIDC:** None / describe

**Environment or approval flow:** None / `npm-release` / `github-pages` / describe

**Required `ci-gate` or branch-protection behavior:** None / describe

## Safety

- [ ] Normal pull-request CI remains read-only.
- [ ] Any elevated permission, including `id-token: write` or repository write access, remains job-scoped to the operation that requires it.
- [ ] Pages deployment, npm publication, registry verification, and repository
      writes remain isolated to the jobs that own those responsibilities.
- [ ] No long-lived npm token, personal access token, or equivalent publishing
      credential was introduced.
- [ ] Failure, retry, concurrency, and rollback behavior were considered.

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Planner/workflow/template tests were updated where behavior changed.

## Rollout

Describe any repository setting, environment, branch-protection, or post-merge
step that cannot be represented in source control.
