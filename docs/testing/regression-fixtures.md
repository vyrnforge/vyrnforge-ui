---
title: Regression Fixture Application
status: Current
owner: Quality Engineering
last_reviewed: 2026-07-21
canonical: true
---

# Regression Fixture Application

`apps/regression-fixtures` is the reusable deterministic VyrnForge fixture application. It is separate from the documentation app and the broad playground because it exists to provide stable, focused test surfaces rather than product demonstrations, component reference pages, or packed-tarball verification.

## Commands

```bash
npm run fixtures:test
npm run fixtures:build
npm run fixtures:verify
```

The application imports only documented package-root JavaScript and CSS exports. Its tests reuse the shared DOM interaction utilities from `tests/dom`.

## Registry and routes

`apps/regression-fixtures/src/fixtureRegistry.ts` is the only fixture catalog. Every entry has an immutable kebab-case ID, stable route and render key, purpose, supported test modes, theme and density support, and a `componentMetadataId`.

The metadata ID must already exist in `docs/metadata/components.json`; the registry is a consumer of that canonical catalog and does not duplicate maturity, ownership, or evidence declarations. Routes are exact and start with `/fixtures/`. Automated checks must use the route, fixture ID, semantic roles, or the limited `data-vf-fixture*` hooks, never visible-label ordering or generated IDs.

## Adding a fixture

1. Confirm the component is documented in `docs/api/` and represented in `docs/metadata/components.json`.
2. Add one registry record with a unique ID, route, render key, metadata ID, and deterministic purpose.
3. Add the matching switch case in `FixtureApp.tsx`, using public `@vyrnforge/*` exports and fixed local data only.
4. Add focused DOM coverage for route resolution and the fixture behavior; add an automated accessibility scan when its rendered path is suitable.
5. Run the fixture commands and record any browser or visual gaps in the task evidence.

## Determinism and scope

Fixtures must not fetch data, read timestamps, generate random values, or rely on unstable DOM IDs for selectors. Use fixed rows, fixed row IDs, fixed initial component state, and stable accessible names. Theme and density are applied through the documented `data-theme` and `data-density` contracts from `@vyrnforge/ui-core`.

This application prepares stable routes for future Playwright browser checks and visual-regression work; it does not add either tool. It is also not a new public documentation site, product demo, component maturity record, or replacement for the packed-package consumer fixture in `tests/package-consumer`.


## Quality-gate integration

`npm run fixtures:verify` runs the fixture tests and production build. It is
part of `npm run quality`, scoped CI for package/fixture changes, nightly full
validation, and release-candidate verification. A fixture change must not be
merged when this command is skipped or failing.
