# Generated Multi-Framework Component Reference

CF-7011 and CF-7012 share one generated documentation pipeline.

`docs/metadata/components.json` remains the canonical component inventory and
framework-parity source. `docs/metadata/component-contracts.json` remains the
canonical detailed framework-neutral contract catalog, and
`packages/ui-elements/custom-elements.json` remains the published Custom
Elements declaration manifest.

The generated artifact is:

```text
docs/generated/component-reference.json
```

Run:

```bash
npm run generate:component-reference
npm run verify:component-reference
npm run test:component-reference
```

The generator emits React, Native HTML, Angular, and Vue usage tabs for every
component whose `frameworkParity.betaScope` is `included`. Angular and Vue
examples consume the same `vf-*` element contract rather than creating
framework-specific component definitions. Per-component framework status is
read directly from `components.json`; the documentation generator does not
promote `planned-gmf4` component parity merely because the framework-level
consumer fixture has passed.

Detailed properties, attributes, events, slots, methods, accessibility, and
form-association fields are emitted only for entries already present in the
canonical component-contract catalog. Missing contracts are not guessed or
duplicated.

The React docs application reads only the generated artifact for its component
reference viewer. This keeps framework examples and detailed contract tables
derived from canonical metadata instead of maintaining another hand-written
contract source.
