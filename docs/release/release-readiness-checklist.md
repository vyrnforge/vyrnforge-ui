# Release-Readiness Checklist

Use this checklist for alpha, beta, and stable releases. Not every recommended check blocks every prerelease, but mandatory blockers must be resolved before publication.

## Release identity

- [ ] Release scope is approved.
- [ ] Version is selected.
- [ ] npm tag is selected: `alpha`, `beta`, candidate tag, or `latest` only for approved stable releases.
- [ ] Package versions remain synchronized unless an approved policy says otherwise.
- [ ] VyrnForge Source License 1.0 metadata and package-local LICENSE files are verified.

## Mandatory blockers

- [ ] Repository checkout is clean.
- [ ] No credentials, private URLs, customer data, internal documents, logs, archives, `.env` files, or unintended generated output are included.
- [ ] `npm ci` passes.
- [ ] Lint passes when available.
- [ ] Typecheck passes.
- [ ] Tests pass.
- [ ] Package builds pass.
- [ ] `npm run verify:packages` passes.
- [ ] `npm run verify:consumer` passes.
- [ ] CI status checks `quality` and `external-consumer` pass.
- [ ] Package manifests use `SEE LICENSE IN LICENSE`.
- [ ] Package tarballs include LICENSE and no unrelated legal drafts or internal legal notes.
- [ ] Type declaration output is present and reviewable.
- [ ] CSS imports, `--vf-*`, `vf-*`, `--udg-*`, and `udg-*` contracts are reviewed.
- [ ] Package tarballs are reviewed before publication.
- [ ] Changelog is updated.
- [ ] Migration notes exist for breaking changes.
- [ ] SECURITY.md reporting route is accurate.
- [ ] npm organization access and package visibility are confirmed.
- [ ] The controlled release workflow is manually dispatched from current `main`.
- [ ] Verify mode summary is reviewed before publish mode is approved.
- [ ] The protected `npm-release` environment is approved for publish mode.
- [ ] npm trusted publishers are configured for each publishable package; no long-lived npm token is stored.
- [ ] Rollback or corrective-release plan is documented.

## Recommended checks

- [ ] External package-consumer fixture installs the package tarballs.
- [ ] Real application validation is complete.
- [ ] Documentation build passes.
- [ ] Playground build passes.
- [ ] GitHub Pages build or deployment status is checked.
- [ ] Accessibility review is complete for changed components.
- [ ] Light, dark, enterprise, compact, standard, and comfortable modes are reviewed where relevant.
- [ ] Public API docs are updated.
- [ ] Metadata files are updated when public components, imports, CSS, or state contracts change.
- [ ] Release notes are drafted.
- [ ] Trusted-publishing/OIDC configuration is verified when that publication path is active.

## Post-release checks

- [ ] Registry shows every package with the expected version.
- [ ] npm tag points to the intended version.
- [ ] Fresh consumer install succeeds.
- [ ] Fresh consumer TypeScript import succeeds.
- [ ] CSS import order works in a fresh consumer app.
- [ ] GitHub release notes are published when appropriate.
- [ ] Changelog links are updated after versioned releases begin.
- [ ] Known issues or corrective-release needs are documented.
