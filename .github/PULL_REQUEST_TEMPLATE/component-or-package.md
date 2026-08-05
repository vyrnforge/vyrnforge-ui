## Summary

Describe the component, token, utility, hook, package, or data-grid change and the consumer problem it solves.

## Package scope

Select every directly or transitively affected package.

- [ ] `@vyrnforge/ui-core`
- [ ] `@vyrnforge/ui-behaviors`
- [ ] `@vyrnforge/ui-components`
- [ ] `@vyrnforge/ui-elements`
- [ ] `@vyrnforge/ui-data-grid`
- [ ] Docs or playground examples
- [ ] Packed external consumer

> Package selection is review evidence. `scripts/detect-ci-scope.mjs` remains authoritative for executed checks.

## Contract impact

**Public API:** None / additive / breaking

**CSS tokens or classes:** None / `--vf-*` or `vf-*` / `--udg-*` or `udg-*`

**State ownership:** Controlled / uncontrolled / consumer-owned / not applicable

**Migration or deprecation required:** No / yes — describe below

## Implementation review

- [ ] Existing VyrnForge primitives, tokens, utilities, and patterns were reused or extended before adding parallel behavior.
- [ ] Package boundaries and public entry points remain correct; no internal deep import was introduced.
- [ ] The implementation remains native-first, dependency-minimal, CSS-variable-based, and store-agnostic.
- [ ] Accessibility and keyboard behavior were reviewed.
- [ ] Light/dark themes, density, responsive behavior, disabled/read-only/invalid states, and overlays were reviewed where relevant.
- [ ] Focused public-behavior tests were added or updated.
- [ ] Source-of-truth docs, metadata, examples, changelog, and migration notes were updated where relevant.

## Validation

- [ ] The generated CI plan includes the affected package and required downstream packages.
- [ ] Relevant targeted checks passed during implementation.
- [ ] Packed package and external-consumer verification passed when the public package contract changed.
- [ ] `npm run quality` passed once before merge when full validation is required.
- [ ] No package version, npm publication, dist-tag, Git tag, or GitHub Release changed unless this PR is explicitly release-scoped.

## Evidence and notes

Provide screenshots, behavior notes, compatibility evidence, known limitations, and deferred work.
