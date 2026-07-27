# GMF2 Shared Behavior Parity Gate

GMF2 closes S5 after MF-5001 through MF-5016. The canonical evidence record is `docs/metadata/gmf2-closure.json`.

## Gate requirements

- every MF-5001 through MF-5016 task is done;
- `@vyrnforge/ui-behaviors` remains framework-neutral and DOM-free;
- every public React component is classified by the MF-5015 adoption audit;
- all behavior-owning React components use the approved shared controller or resolver where applicable;
- public exports, props, callbacks, CSS classes, keyboard behavior, focus behavior, and native form behavior remain compatible;
- behavior, React DOM, browser, accessibility, fixture, package, and external-consumer evidence passes;
- no unresolved GMF2 blocker remains.

## Commands

```bash
npm run test:behavior-foundations
npm run verify:behavior-foundations
npm run test:react-behavior-adoption
npm run verify:react-behavior-adoption
npm run test:gmf2-closure
npm run verify:gmf2-closure
npm run quality
```

S6 / GMF3 begins after this gate and owns native Custom Element parity. Angular and Vue runtime consumer claims remain S7 / GMF4. The data grid remains outside the non-grid beta critical path.
