# Native Advanced Element Contracts

This document is the canonical browser-evidence index for EL-6012 through
EL-6017.

## Scope

The advanced native wave adds collections, overlays, feedback surfaces, and
enterprise application composition to `@vyrnforge/ui-elements`:

- `vf-autocomplete`, `vf-multi-select`, and `vf-transfer-list`;
- `vf-dialog`, `vf-drawer`, `vf-popover`, `vf-menu`, and `vf-tooltip`;
- `vf-toast`, `vf-toast-viewport`, and `vf-confirm-dialog`;
- `vf-app-shell`, `vf-page-header`, and `vf-page-toolbar`.

The complete deterministic public catalog contains 54 tags after this wave.

## Portable behavior

Collection filtering, selection, transfer, overlay state, menu navigation,
tooltip state, toast queues, and confirmation decisions remain in
`@vyrnforge/ui-behaviors`. Native adapters own DOM rendering, browser focus,
ElementInternals integration, event translation, and Light DOM composition.

## Browser evidence

`tests/browser/native-advanced-elements.spec.ts` verifies:

1. deterministic registration of all 14 new tags;
2. scalar and repeated-entry form submission for collections;
3. modal dismissal, anchored overlay state, menu keyboard navigation, and
   tooltip focus behavior;
4. toast and confirmation event contracts;
5. application-shell, page-header, and page-toolbar composition.

The evidence runs with the existing native core and form-foundation scenarios
before GMF3 closure. EL-6018 remains responsible for the final cross-family API,
accessibility, theme, density, package, and consumer parity gate.
