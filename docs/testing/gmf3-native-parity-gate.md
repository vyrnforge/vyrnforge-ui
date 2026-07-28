# GMF3 Native Non-Grid Parity Gate

GMF3 closes Sprint S6 by proving that `@vyrnforge/ui-elements` is the complete
browser-native renderer for the VyrnForge non-grid beta scope.

## Closure decision

Status: **evidence complete**

The package exposes a deterministic 58-tag `vf-*` catalog, Light DOM styling,
typed bubbling/composed events, and `ElementInternals` form behavior. The
catalog is backed by shared `@vyrnforge/ui-behaviors` controllers and depends
only on `@vyrnforge/ui-core` and `@vyrnforge/ui-behaviors`.

All 67 public beta-included `@vyrnforge/ui-components` records have a current
native strategy:

| Native strategy       | Records | Contract                                                             |
| --------------------- | ------: | -------------------------------------------------------------------- |
| Direct Custom Element |      57 | A public `vf-*` tag owns the renderer contract.                      |
| Renderer mapping      |       8 | A React convenience API maps to an existing native element contract. |
| Renderer composition  |       1 | `Dropdown` composes `vf-popover` with `vf-dropdown` content.         |
| Renderer service      |       1 | `useToast` maps to the `VyrnForgeToastViewportElement` service API.  |

## EL-6018 completion scope

EL-6018 adds four direct completion elements:

- `vf-icon`
- `vf-inline-message`
- `vf-skeleton`
- `vf-top-nav`

It also records and verifies these non-tag mappings:

- `Alert` → `vf-inline-message`
- `Dropdown` → `vf-popover` plus `vf-dropdown` content
- `ToastAction` → `vf-toast[action-label]`
- `ToastProvider` → `vf-toast-viewport`
- `useToast` → `VyrnForgeToastViewportElement.add`, `updateToast`, `dismiss`,
  and `dismissAll`

## Required evidence

The gate requires:

- native foundation, core, advanced, and parity metadata;
- deterministic registration and side-effect-free package-root imports;
- package-boundary verification;
- browser evidence for semantics, accessibility, forms, keyboard behavior,
  overlays, feedback, theme, density, and React/native CSS coexistence;
- native HTML consumer source that loads the package CSS export;
- package build, coverage, packed-consumer, and full repository quality gates.

Canonical machine-readable evidence is
[`docs/metadata/gmf3-closure.json`](../metadata/gmf3-closure.json).

## Deferred claims

GMF3 does not claim Angular or Vue runtime compatibility. Those consumers remain
architecture fixtures until S7 / GMF4 runs packed-package build, browser,
accessibility, typing, and documentation evidence. The data grid remains
outside the non-grid beta critical path.
