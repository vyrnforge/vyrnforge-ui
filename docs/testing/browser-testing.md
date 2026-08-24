# Browser Testing

## Purpose

VyrnForge browser tests prove behavior that DOM rendering alone cannot verify,
including real focus movement, portal behavior, viewport positioning, pointer
interactions, scroll locking, and browser event ordering.

The browser suite consumes the deterministic regression fixture application. It
does not create a second component catalog or import unpublished package source
paths.

## Commands

```bash
npm run test:browser:install
npm run test:browser
npm run test:browser:headed
npm run test:browser:debug
npm run test:browser:report
npm run test:visual
npm run verify:visual-regression
```

When Chromium is already installed outside Playwright, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. CI uses the
Playwright-managed Chromium build.

`test:browser` starts the fixture application automatically on
`http://127.0.0.1:4173`. A separately running compatible fixture server may be
reused for local development but is never assumed in CI.

## Fixture contract

Browser tests navigate through stable fixture IDs from
`apps/regression-fixtures/src/fixtureRegistry.ts`. A fixture must:

- use deterministic data;
- avoid network requests and current timestamps;
- expose `data-vf-fixture-ready="true"` only when it is ready for interaction;
- prefer semantic roles and accessible names;
- use `data-vf-fixture-action` or `data-vf-fixture-region` only when a
  semantic locator is not stable enough;
- consume VyrnForge through public package exports.

## Selector rules

Prefer, in order:

1. role and accessible name;
2. label text;
3. stable fixture action or region attributes;
4. component CSS classes only for geometry or overlay-boundary checks.

Do not select elements by arbitrary DOM position or implementation-generated
React IDs.

## Artifacts

The Chromium project records a trace on the first retry, screenshots on failure,
an HTML report, and a JSON result file in CI. GitHub Actions also retains
`test-results/visual-evidence` for relevant visual runs so successful
computed-style records and screenshots remain reviewable.

## Evidence boundaries

A browser smoke test proves the fixture infrastructure and the exact behavior it
asserts. It does not automatically provide complete browser evidence for every
component shown by that fixture.

Current component contract specifications include:

- `tests/browser/dialog.spec.ts`
- `tests/browser/drawer.spec.ts`
- `tests/browser/menu.spec.ts`
- `tests/browser/popover-tooltip.spec.ts`
- `tests/browser/autocomplete.spec.ts`
- `tests/browser/multi-select.spec.ts`
- `tests/browser/transfer-list.spec.ts`
- `tests/browser/slider-rating.spec.ts`
- `tests/browser/tabs-toggle.spec.ts`
- `tests/browser/toast.spec.ts`
- `tests/browser/data-grid-keyboard.spec.ts`
- `tests/browser/data-grid-interactions.spec.ts`

Automated axe scans, DOM interaction tests, and Playwright browser tests are
complementary; none should be presented as a substitute for the others.

## Visual regression

`tests/browser/visual-regression.spec.ts` consumes the canonical matrix in
`docs/metadata/visual-regression-matrix.json`. Computed-style token
expectations are the blocking cross-platform baseline; PNG screenshots are
retained as human-review evidence. See
[Visual Regression Testing](visual-regression.md).
