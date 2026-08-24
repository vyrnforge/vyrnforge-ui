# Visual Regression Testing

## Purpose

VyrnForge visual regression testing verifies that representative component,
grid, theme, density, and overlay visuals continue to resolve from canonical
design tokens rather than drifting into package-local styling decisions.

The canonical matrix is `docs/metadata/visual-regression-matrix.json`. The
browser implementation is `tests/browser/visual-regression.spec.ts`.

## Evidence strategy

VyrnForge uses two complementary evidence layers:

1. **Computed-style token baselines** are the blocking regression contract.
   Each representative visual property must resolve from the documented
   `--vf-*` or `--udg-*` role declared by the matrix.
2. **PNG screenshots** are produced for every matrix case and uploaded for human
   review.

This avoids committing operating-system-specific raster baselines while still
producing inspectable images. Browser font rasterization and antialiasing may
differ across platforms; semantic computed-style comparison remains the
deterministic contract.

A passing screenshot alone is not sufficient. The browser test must also prove
that target surface, text, border, density, and layer properties resolve from
the expected semantic roles.

## Current matrix

| Suite             | Fixture                         | Themes      | Densities                      |  Cases |
| ----------------- | ------------------------------- | ----------- | ------------------------------ | -----: |
| Shared components | `/fixtures/visual/components`   | light, dark | compact, standard, comfortable |      6 |
| UniversalDataGrid | `/fixtures/data-grid/selection` | light, dark | compact, standard, comfortable |      6 |
| Dialog overlay    | `/fixtures/dialog/focus`        | light, dark | standard                       |      2 |
| **Total**         |                                 |             |                                | **14** |

The canonical JSON matrix owns the authoritative case definitions. This table is
a human-readable summary and must be updated with the matrix when its topology
changes.

## Commands

```bash
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
```

`npm run test:browser` also includes the visual matrix. `npm run check`
includes the static visual contract verifier, while `npm run ci` adds the full
browser suite.

## Artifacts

Every successful visual case writes:

- `test-results/visual-evidence/<case>.png`
- `test-results/visual-evidence/<case>.json`

The JSON record contains actual and expected computed values for every matrix
expectation. GitHub Actions retains the visual evidence for review; failure
traces, screenshots, and Playwright reports remain available through the browser
artifacts.

## Updating the matrix

A visual contract change requires all of the following:

1. change the canonical token or package mapping;
2. update the deterministic regression fixture when a new state is needed;
3. update `docs/metadata/visual-regression-matrix.json`;
4. run the static verifier and browser matrix;
5. review generated PNG evidence;
6. explain the intended visual contract change in the pull request.

Do not weaken a token expectation merely to accept visual drift. When a
component genuinely needs a local visual role, document its ownership and add a
narrow expectation.

## Evidence boundary

The matrix proves the representative token roles and theme/density composition
listed by canonical metadata. It does not claim exhaustive pixel coverage for
every public component, responsive breakpoint, operating system, or contrast
mode. New coverage must extend the canonical matrix rather than create another
visual source of truth.
