## Summary

Describe the CI/CD, workflow, release-engineering, Pages, branch-protection, or repository-automation change and the operational risk it addresses.

## Infrastructure scope

- [ ] CI planner or `ci-gate`
- [ ] Reusable quality/package/consumer/docs workflow
- [ ] GitHub Pages build or deployment
- [ ] npm trusted publishing or OIDC
- [ ] Registry, signature, or provenance verification
- [ ] Git tag or GitHub Release recording
- [ ] Nightly validation
- [ ] Repository templates, governance, or branch protection
- [ ] Verification/release scripts

## Responsibility and permission impact

**Trigger change:** None / pull request / push / dispatch / schedule / workflow completion

**Permissions changed:** None / `contents: read` / `contents: write` / `id-token: write` / Pages permissions / describe below

**Environment or approval changed:** None / `npm-release` / `github-pages` / describe below

**Required-check or branch-protection change:** None / describe migration below

## Infrastructure review

- [ ] `scripts/detect-ci-scope.mjs` rules and tests were updated when path categories changed.
- [ ] CI remains always-running with a stable `ci-gate`; required checks do not rely on workflow-level path filters.
- [ ] Global permissions remain read-only and every elevated permission is job-scoped.
- [ ] Pull-request CI cannot publish packages, deploy Pages, create tags, or create GitHub Releases.
- [ ] Pages deployment, npm OIDC publication, registry verification, and release recording remain separate responsibilities.
- [ ] No long-lived npm token, personal access token, or equivalent publishing secret was introduced.
- [ ] Failure, cancellation, intentional skip, concurrency, and retry behavior were considered.
- [ ] Source-of-truth architecture and responsibility documentation was updated without duplicating workflow YAML.

## Validation

- [ ] Planner fixtures or tests cover new routing behavior.
- [ ] Workflow and repository-template contracts passed.
- [ ] `npm run verify:ci` passed.
- [ ] `npm run quality` passed once before merge when full validation is required.
- [ ] No package version, public API, CSS ownership, npm publication, dist-tag, Git tag, or GitHub Release changed.

## Rollout and rollback

Describe branch-protection migration, environment configuration, staged rollout, rollback steps, and post-merge verification.
