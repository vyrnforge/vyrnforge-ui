# S3 Visual Regression Evidence

## Scope

VF-3011 closes the S3 visual-evidence gap for the semantic token contract. The
suite covers shared components, UniversalDataGrid, and a portalled Dialog across
the required light/dark and compact/standard/comfortable matrix.

The canonical matrix is
`../metadata/visual-regression-matrix.json`. The browser implementation is
`../../tests/browser/visual-regression.spec.ts`.

## Evidence strategy

VyrnForge uses two complementary evidence layers:

1. **Computed-style token baselines** are the blocking regression contract.
   Each representative visual property must resolve from the documented
   `--vf-*` or `--udg-*` role declared by the matrix.
2. **PNG screenshots** are produced for every matrix case and uploaded by the
   Chromium workflow for human review.

This avoids committing operating-system-specific raster baselines while still
producing inspectable images. Browser font rasterization and antialiasing may
differ between Windows and Linux; semantic computed-style comparison remains
deterministic across both.

A passing screenshot alone is not sufficient. The browser test must also prove
that the target surface, text, border, density, and layer properties resolve
from the expected semantic roles.

## Matrix

| Suite             | Fixture                         | Themes      | Densities                      |  Cases |
| ----------------- | ------------------------------- | ----------- | ------------------------------ | -----: |
| Shared components | `/fixtures/visual/components`   | light, dark | compact, standard, comfortable |      6 |
| UniversalDataGrid | `/fixtures/data-grid/selection` | light, dark | compact, standard, comfortable |      6 |
| Dialog overlay    | `/fixtures/dialog/focus`        | light, dark | standard                       |      2 |
| **Total**         |                                 |             |                                | **14** |

The shared component gallery covers primary/default/disabled actions, selected
ToggleButton state, default and invalid inputs, Select, success/warning/error/
info badges, contained Tabs, and read-only Rating.

The grid cases cover the package shell, header, selected row, semantic colors,
border/radius, and density-derived header/row heights.

The Dialog cases verify that portal content receives the active theme and
density, uses the semantic scrim and overlay surface, and remains on the modal
layer.

## Commands

```bash
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
```

`npm run test:browser` also includes the visual matrix. `npm run quality`
enforces the static matrix verifier and the complete browser suite.

## Artifacts

Every successful visual case writes:

- `test-results/visual-evidence/<case>.png`
- `test-results/visual-evidence/<case>.json`

The JSON record contains the actual and expected computed value for every
matrix expectation. GitHub Actions uploads the directory even when the browser
job succeeds. Failure traces, screenshots, and the Playwright HTML report remain
available through the existing failure artifact.

## Updating the matrix

A visual contract change requires all of the following:

1. change the canonical token or package mapping;
2. update the deterministic regression fixture when a new state is needed;
3. update `visual-regression-matrix.json`;
4. run the static verifier and browser matrix;
5. review the generated PNGs;
6. explain the intended change in the pull request.

Do not weaken a token expectation merely to accept a visual change. When a
component genuinely needs a local visual role, document its ownership and add a
narrow expectation.

## Evidence boundary

The matrix proves the representative S3 token roles and theme/density
composition. It does not claim exhaustive pixel coverage for every public
component, responsive breakpoint, operating system, or high-contrast mode.
Those additions must extend the canonical matrix rather than create another
visual source of truth.
