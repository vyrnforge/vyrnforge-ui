# VyrnForge UI Quality Gates

This document defines the minimum evidence expected for VyrnForge UI component
changes. The canonical maturity definitions and promotion requirements live in
[`../governance/component-maturity-model.md`](../governance/component-maturity-model.md).
Do not create a second maturity definition in this document.

## Severity

| Severity | Definition |
| --- | --- |
| P0 | Crash, data loss, unusable keyboard behavior, focus-trap failure, inaccessible primary interaction, or component cannot be used. |
| P1 | Major API inconsistency, major layout or scroll defect, broken controlled state, incorrect form submission, or serious theme/responsive issue. |
| P2 | Incomplete behavior, visual inconsistency, missing secondary accessibility behavior, or incomplete documentation. |
| P3 | Polish, optional enhancement, or future optimization. |

## Component quality gates

| Gate | Requirement |
| --- | --- |
| API consistency | Props follow established VyrnForge conventions and controlled/uncontrolled behavior is explicit. |
| Behavior correctness | Disabled/read-only states block mutation, callbacks are predictable, and business state is not silently owned by shared packages. |
| Accessibility | Labels, ARIA relationships, visible focus, keyboard operation, Escape behavior, and live-region/modal semantics are reviewed where applicable. |
| Visual quality | Light, dark, enterprise, compact, standard, and comfortable modes retain usable spacing, contrast, control heights, and focus visibility. |
| Layout and scrolling | Components own predictable minimum sizes and overflow behavior and avoid clipped focus or duplicate scroll regions. |
| Theme and density | Shared visuals use `--vf-*`; grid-only internals use `--udg-*`. |
| CSS ownership | `ui-core` owns shared tokens/utilities, `ui-components` owns `vf-*`, `ui-data-grid` owns `udg-*`, docs own `vf-docs-*`, playground owns `vf-playground-*`, regression fixtures own `vf-fixture-*`, and external consumer fixtures use `vf-consumer-*`. |
| CSS verification | `npm run lint:css` rejects invalid CSS, duplicate declarations, invalid custom-property names, and CSS classes outside approved VyrnForge prefixes. |
| Documentation | Public components have metadata, appropriate guidance, examples, and honest limitations. |
| Testing | Logic, DOM interaction, accessibility, browser, theme/density, compatibility, and consumer evidence are required according to category and maturity. |
| Production readiness | No unresolved P0/P1 defect and no maturity claim unsupported by the canonical evidence record. |

## Maturity status source of truth

Allowed statuses are defined only in the canonical maturity model and metadata
schema:

- `planned`
- `experimental`
- `alpha-stable`
- `beta-stable`
- `stable`
- `deprecated`
- `internal`

A historical `stable` value with `evidence.status = requires-verification` is
not displayed as verified stable. Public documentation presents it as
**Legacy stable — verification required** until its evidence is completed. The
legacy exception list is scheduled for closure through `VF-2015` at Gate `G2`
and must be empty before `1.0.0-beta.1`.

## DOM interaction and accessibility test conventions

Shared jsdom utilities live in `tests/dom`. Component and regression-fixture
tests import `render`, `screen`, `createUser`, `getPortalRoot`, and
`assertNoAccessibilityViolations` from that test-only location. Public package
implementation must not expose these helpers.

The shared setup automatically unmounts renders, removes the test portal root,
restores mocks, clears timers, and returns to real timers after every test. A
test using fake timers must enable and flush them locally.

DOM interaction tests and automated axe scans are implemented and mandatory
where applicable. They provide repeatable structural and interaction evidence,
but they do not prove complete WCAG conformance. Browser behavior, layout,
real focus movement, pointer interactions, visual regression, and manual
assistive-technology review remain part of S2 and later evidence.

## Repository gate

The authoritative local and release command is `npm run quality`. It includes:

- workflow/toolchain and governance verifiers;
- formatting, JavaScript/TypeScript lint, and CSS lint;
- typecheck and package coverage thresholds;
- regression fixture test/build verification;
- package and external-consumer verification;
- docs and playground production builds.

The GitHub `ci-gate` is the required aggregate check. Missing, cancelled,
failed, or unexpectedly skipped mandatory work must fail the gate.
