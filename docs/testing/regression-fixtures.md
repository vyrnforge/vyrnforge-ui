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

The application is the source of stable routes for Playwright browser checks and visual-regression work. Browser tests live under `tests/browser` and consume this registry; the fixture app does not own browser evidence or component maturity by itself. It is also not a new public documentation site, product demo, component maturity record, or replacement for the packed-package consumer fixture in `tests/package-consumer`.

## Quality-gate integration

`npm run fixtures:verify` runs the fixture tests and production build. It is
part of `npm run quality`, scoped CI for package/fixture changes, nightly full
validation, and release-candidate verification. Fixture and published-runtime
changes also plan the Chromium browser job. A fixture change must not be merged
when either fixture verification or required browser validation is skipped or
failing.

## S2 interaction fixtures

The controlled S2 fixture set includes stable routes for Autocomplete,
MultiSelect, Transfer List, Slider and Rating, Tabs and Toggle Button, and
Toast lifecycle behavior. Combined routes may exercise a closely related
component pair, but each browser specification records its assertions
explicitly and does not infer evidence for untested behavior.

## S2 data-grid fixtures

The final S2 fixture set adds two focused UniversalDataGrid routes:

- `/fixtures/data-grid/keyboard` proves roving cell focus, Arrow/Home/End
  navigation, row activation and selection, keyboard sorting, separator resize,
  and keyboard column-reorder fallback.
- `/fixtures/data-grid/interactions` proves pointer resize, native drag reorder,
  sticky header and selection regions, and deterministic two-axis scrolling.

The fixtures use fixed rows, fixed dimensions, public package exports, and
semantic grid roles. They do not introduce virtualization, editing, application
state stores, or backend behavior.

## S3 visual fixture

`/fixtures/visual/components` provides the deterministic shared-component gallery
used by VF-3011. Theme and density are also synchronized to the document root so
portalled overlays inherit the same semantic contract as in-document fixture
content. The fixture remains a test surface, not a public component catalog.
