# React Behavior Adoption Audit

## Scope

MF-5015 completes the React-side audit after the shared behavior controllers in MF-5001 through MF-5014. The canonical machine-readable inventory is `docs/metadata/react-behavior-adoption.json`.

## Result

Every public value export from `@vyrnforge/ui-components` is classified as one of:

- a shared behavior adapter;
- a component that composes an already-audited adapter;
- a native semantic adapter where browser form behavior remains authoritative; or
- a presentation/composition component with no reusable interaction state.

`IconButton` now uses `resolveActionState`, closing the remaining duplicated loading/disabled decision shared with `Button`. The convenience action buttons inherit that behavior through `IconButton`.

## Renderer ownership retained

React continues to own DOM rendering, refs, focus execution, portals, document listeners, browser event translation, DOM measurement, and timer execution. These responsibilities are adapters, not portable behavior controllers.

## Compatibility outcome

- package-root component and hook exports are unchanged;
- public props and callback shapes remain unchanged;
- existing `vf-*` classes remain unchanged;
- controlled/uncontrolled behavior remains compatible;
- native input semantics remain native;
- React unit, DOM, browser, accessibility, fixture, package, and consumer checks remain mandatory.

## Verification

```bash
npm run test:react-behavior-adoption
npm run verify:react-behavior-adoption
npm run test:coverage --workspace @vyrnforge/ui-components
npm run verify:consumer
```
