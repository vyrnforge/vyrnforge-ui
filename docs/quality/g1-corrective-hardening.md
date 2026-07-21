# G1 Corrective Hardening

This corrective pass closes integration gaps found after S0 and S1. It does
not replace S2 browser work.

## Implemented corrections

- Regression fixtures are included in scoped CI, nightly validation,
  `npm run quality`, and release verification.
- Fixture paths and shared DOM test utilities are explicitly classified by the
  CI planner.
- The toolchain verifier covers the regression-fixture workspace.
- Local, CI, and release quality contracts include formatting, coverage,
  accessibility/DOM evidence, and fixture verification.
- Historical stable metadata with missing evidence is displayed as
  **Legacy stable — verification required**, with a closure task, Gate G2
  deadline, and beta release block.
- CSS linting enforces approved VyrnForge class prefixes; unprefixed grid state
  and playground modifier classes were migrated.
- Repository inventory generation detects DOM, axe, coverage, and regression
  fixture evidence, and a drift verifier prevents stale committed inventory.
- Shared test-only DOM utilities moved to `tests/dom`, removing fixture imports
  into a package-internal test directory.
- Unused direct fixture dependencies were removed.
- `@vyrnforge/ui-core` now has behavior tests and a non-zero coverage floor.

## Still intentionally pending

- Playwright and real-browser interaction evidence (S2).
- Manual screen-reader and assistive-technology review.
- Semantic token expansion (S3).
- Data-grid decomposition and performance evidence (S4–S5).
- Compatibility matrices, repository rules, and beta canaries (S7–S8).
