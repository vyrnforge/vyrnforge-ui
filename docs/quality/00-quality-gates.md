# VyrnForge UI Quality Gates

This document defines the minimum evidence expected for VyrnForge UI component
and package changes. Canonical maturity definitions and promotion requirements
live in
[`../governance/component-maturity-model.md`](../governance/component-maturity-model.md).
Do not create a second maturity definition here.

## Severity

| Severity | Definition                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0       | Crash, data loss, unusable keyboard behavior, focus-trap failure, inaccessible primary interaction, or a component cannot be used.               |
| P1       | Major API inconsistency, major layout or scroll defect, broken controlled state, incorrect form submission, or serious theme/responsive failure. |
| P2       | Incomplete behavior, visual inconsistency, missing secondary accessibility behavior, or incomplete documentation.                                |
| P3       | Polish, optional enhancement, or future optimization.                                                                                            |

## Component quality gates

| Gate                 | Requirement                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API consistency      | Public APIs follow established VyrnForge conventions and controlled/uncontrolled behavior is explicit.                                                                                                                                                 |
| Behavior correctness | Disabled and read-only states block mutation as documented, callbacks are predictable, and shared packages do not silently own application business state.                                                                                             |
| Accessibility        | Labels, ARIA relationships, visible focus, keyboard operation, Escape behavior, and live-region or modal semantics are reviewed where applicable.                                                                                                      |
| Visual quality       | Supported themes and densities retain usable spacing, contrast, control geometry, and focus visibility.                                                                                                                                                |
| Layout and scrolling | Components own predictable minimum sizes and overflow behavior and avoid clipped focus or duplicate scroll regions.                                                                                                                                    |
| Theme and density    | Shared visuals use the canonical semantic roles in `docs/metadata/design-tokens.json`; grid-only internals use `--udg-*`.                                                                                                                              |
| CSS ownership        | `ui-core` owns shared tokens/utilities, `ui-components` owns `vf-*`, `ui-data-grid` owns `udg-*`, docs own `vf-docs-*`, playground owns `vf-playground-*`, regression fixtures own `vf-fixture-*`, and external consumer fixtures use `vf-consumer-*`. |
| CSS verification     | `npm run lint:css` rejects invalid CSS, duplicate declarations, invalid custom-property names, and classes outside approved VyrnForge prefixes.                                                                                                        |
| Documentation        | Public surfaces have canonical metadata, appropriate guidance, examples where useful, and honest limitations.                                                                                                                                          |
| Testing              | Logic, DOM interaction, accessibility, browser, theme/density, compatibility, and consumer evidence are required according to category and maturity.                                                                                                   |
| Production readiness | No unresolved P0/P1 defect and no maturity claim unsupported by the canonical evidence record.                                                                                                                                                         |

## Maturity source of truth

Allowed statuses and promotion requirements are owned by the component maturity
model and canonical component metadata. Current maturity verification includes:

```bash
npm run verify:component-maturity
npm run verify:maturity-closure
```

These checks prevent unsupported maturity claims from silently reappearing in
current metadata.

## DOM interaction and accessibility

Shared jsdom utilities live in `tests/dom`. Component and regression-fixture
tests import test-only helpers from that location; public package implementation
must not expose them.

DOM interaction tests, automated axe scans, and Chromium contracts are mandatory
where applicable. They provide repeatable structural, interaction, focus,
pointer, and layout evidence, but they do not prove complete WCAG conformance.
Manual assistive-technology execution is tracked by
`docs/metadata/assistive-technology-reviews.json`.

## Repository validation

Use the repository's current aggregate commands rather than reconstructing an
older sprint-specific gate:

```bash
npm run check
npm run ci
```

`npm run check` covers formatting, linting, static contracts, metadata,
package boundaries, documentation currency, type checking, and other blocking
repository verifiers. `npm run ci` adds the broader contract, coverage,
package, fixture, browser, packed-consumer, and application-build evidence used
by continuous integration.

The GitHub `ci-gate` is the required aggregate merge check. Missing,
cancelled, failed, or unexpectedly skipped mandatory work must fail the gate.

## Semantic token and visual evidence

Token-contract changes use the canonical token and adoption checks:

```bash
npm run test:design-tokens
npm run verify:design-tokens
npm run test:token-adoption
npm run verify:token-adoption
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
```

The visual matrix combines deterministic computed-style expectations with PNG
review evidence. Its durable testing contract is documented in
[Visual Regression Testing](../testing/visual-regression.md).
