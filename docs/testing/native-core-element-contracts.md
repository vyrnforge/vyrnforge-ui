# Native Core Element Contracts

EL-6005 through EL-6011 implement the first 40 public native non-grid tags.
This evidence does not claim completion of advanced collections, overlays, or
GMF3.

## Contract groups

- Display and layout adapters preserve semantic roles, VyrnForge tokens,
  density, and portable Light DOM composition.
- Actions consume shared action/toggle behavior and keep native button keyboard
  and disabled semantics.
- Form controls use `VyrnForgeFormAssociatedElement`, native internal controls,
  canonical events, validation, reset, and submission.
- Value and selection groups use shared numeric, toggle, and selection
  controllers where reusable state decisions exist.
- Field composition owns accessible label, description, validation-message,
  required, and error relationships.
- Tabs and side navigation consume shared navigation controllers and preserve
  roving focus, disabled-item skipping, selection, and active semantics.

## Browser evidence

`tests/browser/native-core-elements.spec.ts` proves:

- deterministic registration of all 40 tags;
- display semantics and shared class/token adoption;
- canonical action dispatch;
- real form submission across text, selection, slider, and rating controls;
- field naming and description relationships;
- segmented selection;
- tabs and side-navigation keyboard behavior.

The DOM adapter files under `src/components` are validated by real Chromium
contracts rather than counted in the Node V8 coverage percentage. Foundation,
event, and registration logic retain the package numeric coverage gate.

## Evidence index

```text
packages/ui-elements/src/components/
packages/ui-elements/src/styles/
apps/regression-fixtures/src/nativeCoreElements.tsx
tests/browser/native-core-elements.spec.ts
scripts/verify-native-core-elements.mjs
scripts/verify-native-core-elements.test.mjs
docs/metadata/native-core-elements.json
```

## GMF3 relationship

This document remains the canonical 40-tag core-wave evidence. EL-6018 combines
it with the advanced and parity evidence without rewriting the historical
wave count. The final gate is recorded in `docs/metadata/gmf3-closure.json`.
