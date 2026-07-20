---
title: VyrnForge UI Coverage Baseline
status: Stable
owner: Quality Engineering
last_reviewed: 2026-07-21
canonical: true
---

# Coverage Baseline

## Purpose

This is the initial, package-level V8 coverage baseline for VyrnForge UI. It
reports execution quantity; it is not a component maturity decision or proof
of interaction, accessibility, browser, visual, consumer, or release evidence.
Those evidence types remain governed by the Component Maturity Model and the
Quality Gates.

## Collection and reports

Run all package reports with:

```bash
npm run test:coverage
```

Each package runs Vitest with the V8 provider and writes to its own ignored
directory under `coverage/`:

| Package | Report directory |
| --- | --- |
| `@vyrnforge/ui-core` | `coverage/ui-core/` |
| `@vyrnforge/ui-components` | `coverage/ui-components/` |
| `@vyrnforge/ui-data-grid` | `coverage/ui-data-grid/` |

The console `text` report and `index.html` are human-readable. `coverage-final.json`,
`coverage-summary.json`, and `lcov.info` are machine-readable. The repository
already ignores `coverage/`; reports are local evidence and must not be
committed.

Coverage includes every executable `src/**/*.ts` and `src/**/*.tsx` file,
including difficult component, hook, and grid production modules. It excludes
only TypeScript declarations (`*.d.ts` and type-only `*.types.ts`), test files,
and test helpers. CSS is not executable V8 coverage. No production module is
excluded to improve a percentage.

## Initial baseline and enforced floors

Measured on 2026-07-21 with Vitest 4.1.10 and the V8 provider:

| Package | Statements | Branches | Functions | Lines | Enforced floor |
| --- | ---: | ---: | ---: | ---: | --- |
| `@vyrnforge/ui-core` | 0.00% | 0.00% | 0.00% | 0.00% | 0 / 0 / 0 / 0 |
| `@vyrnforge/ui-components` | 49.82% | 51.64% | 48.73% | 49.95% | 49 / 51 / 48 / 49 |
| `@vyrnforge/ui-data-grid` | 38.18% | 32.47% | 36.95% | 38.38% | 38 / 32 / 36 / 38 |

Floors are integer percentages and intentionally remain below the measured
result so routine source-map or platform variation does not create a false
failure. They prevent a decrease below the current conservative baseline.
The zero core floor is an explicit exception: there are no core tests yet, so
there is no non-zero numerical regression guard to enforce. Its zero result is
recorded as a coverage gap, not as acceptable quality.

## Evidence boundaries and known weak areas

The coverage totals combine all tests that execute production code. They do
not categorize those executions as interaction evidence.

- `ui-core` has no test files. Theme creation, preset, and lookup logic have
  no automated execution evidence.
- `ui-components` has 54 tests: its static-markup and helper assertions
  contribute to execution coverage, but are not interaction evidence. Only
  the six jsdom tests covering Button, Tabs, and a Dialog portal are DOM
  interaction evidence. They are not browser or visual-regression evidence.
  The baseline is materially weak for many forms, overlays, layout components,
  `ToastProvider`, and overlay-positioning behavior.
- `ui-data-grid` has 64 tests, primarily pure logic and state/adapter evidence.
  Its core helpers are well exercised, while rendering components (1.24%),
  hooks (12.19%), and several state-action/reducer paths are materially weak.
  Static rendering of public hooks is not interaction evidence; no browser
  coverage is claimed.

No package or component maturity status changes because of this baseline.

## Raising thresholds

Raise a package floor only after targeted tests improve the relevant production
behavior and a clean full coverage run records a sustainable higher value.
Raise the affected metric or metrics to a conservative integer below that new
measurement, update this table with the date and values, and record the
remaining weak areas. Do not increase a floor by excluding production code or
by treating static rendering as interaction coverage.

Quality Engineering owns coverage policy with review from the owning package
team. Interaction, accessibility, browser, consumer, and maturity claims need
their separate evidence and reviews under the ownership and maturity models.
