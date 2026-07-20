# VyrnForge UI Quality Gates

This document defines the minimum quality bar for shipped VyrnForge UI components. It applies to `@vyrnforge/ui-components` and `@vyrnforge/ui-data-grid`.

## Severity

| Severity | Definition |
| --- | --- |
| P0 | Crash, data loss, unusable keyboard behavior, focus trap failure, inaccessible primary interaction, or component cannot be used. |
| P1 | Major API inconsistency, major layout or scroll defect, broken controlled state, incorrect form submission, or serious theme/responsive issue. |
| P2 | Incomplete behavior, visual inconsistency, missing secondary accessibility behavior, or incomplete documentation. |
| P3 | Polish, optional enhancement, or future optimization. |

## Gates

| Gate | Stable requirement |
| --- | --- |
| API consistency | Props follow existing VyrnForge conventions: `value/defaultValue`, `checked/defaultChecked`, `open/defaultOpen`, `onValueChange`, `onCheckedChange`, `onOpenChange`, `disabled`, `readOnly`, `invalid`, `required`, `size`, `density`, `className`, and `style` where relevant. |
| Behavior correctness | Controlled mode never mutates internal business state, uncontrolled defaults apply only initially, disabled/read-only blocks mutation, and callbacks receive predictable values. |
| Accessibility | Primary interaction has labels, ARIA relationships, visible focus, keyboard operation, expected Escape behavior, and correct live-region/modal semantics. |
| Visual quality | Light, dark, enterprise, compact, standard, and comfortable modes retain usable spacing, contrast, control heights, and focus visibility. |
| Layout and scrolling | Components own predictable `min-width: 0`, `min-height: 0`, overflow, sticky offsets, and avoid clipped focus or double scrollbars. |
| Theme and density support | Static visuals use `--vf-*` tokens in components and `--udg-*` in the grid. Density names are `compact`, `standard`, and `comfortable`. |
| CSS ownership | `ui-core` owns tokens/utilities, `ui-components` owns reusable `vf-*` component styles, `ui-data-grid` owns `udg-*`, docs use `vf-docs-*`, and playground uses `vf-playground-*`. |
| CSS verification | `npm run lint:css` rejects malformed CSS, unknown properties, duplicate declarations, and custom properties outside the `--vf-*` or `--udg-*` policy. |
| Documentation | Public components have API docs, metadata, playground examples, and AI usage notes when public enough for agents to consume. |
| Testing | Stable components have meaningful tests for rendering contract, ARIA, state helpers, disabled/read-only behavior, or grid state behavior where practical. |
| Production readiness | Stable components have no known P0/P1 issue and are represented accurately in metadata and playground badges. |

## Status Rules

Allowed statuses are:

| Status | Meaning |
| --- | --- |
| stable | Meets the stable quality gates and has no known P0/P1 issues. |
| experimental | Public enough to test and document, but still has P2/P3 limitations or limited interaction coverage. |
| planned | Not implemented or not exported. |
| deprecated | Available only for migration away. |

New or recently expanded components should remain `experimental` until keyboard, accessibility, visual, docs, metadata, playground, and test coverage have been reviewed together.

## DOM Interaction Test Conventions

`@vyrnforge/ui-components` runs DOM interaction tests in jsdom through its
Vitest configuration. Tests import `render`, `screen`, `createUser`, and
`getPortalRoot` from `packages/ui-components/test/dom`; use the returned
`portalRoot` with a component's documented `portalContainer` prop when an
overlay needs an isolated portal boundary.

The package peer range remains React `>=18 <20`; React Testing Library uses
the standard React renderer, so this setup applies to React 18 and the current
React 19 development runtime.

The shared setup automatically unmounts Testing Library renders, removes the
test portal root, restores mocks, clears timers, and returns to real timers
after every test. Prefer real timers. A test that needs fake timers must call
`vi.useFakeTimers()` locally, use `createUserWithFakeTimers()`, and flush the
timers it owns before its assertions complete.

This jsdom harness is DOM evidence, not browser or visual-regression evidence;
browser testing remains scoped to VF-2001. Automated accessibility scanning is
not part of this setup and remains scoped to VF-1007.
