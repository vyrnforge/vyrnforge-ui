# Consumer Knowledge Generation

VyrnForge generates human reference data and compact AI retrieval context from
the same canonical metadata. The generated layer is a projection, not a second
source of truth.

Canonical inputs are:

- `docs/metadata/components.json` for component identity, package, maturity,
  purpose, usage guidance, styling hooks, and framework parity;
- `docs/metadata/component-contracts.json` for renderer-neutral properties,
  events, slots, methods, accessibility, and form contracts;
- `docs/metadata/patterns.json` for reusable application composition patterns;
- `docs/metadata/packages.json` and `docs/metadata/multi-framework.json` for
  package and framework support;
- `packages/ui-elements/custom-elements.json` for published Custom Element
  declarations.

The generator emits:

```text
docs/generated/consumer-knowledge.json
docs/generated/component-reference.json
docs/generated/ai-context/index.json
docs/generated/ai-context/categories/*.json
docs/generated/ai-context/components/*.json
docs/generated/ai-context/patterns/*.json
```

`consumer-knowledge.json` is the shared application projection used by the docs
reference viewer and playground. The `ai-context` tree is deliberately split so
an AI agent can read a small index, one task/category record, and only the
component slices required for the current request. The docs production build
publishes the same generated consumer knowledge and `ai-context` tree as static
assets so external tools can retrieve machine-readable context without scraping
rendered documentation.

Angular and Vue status remains sourced from canonical framework-parity metadata.
Current verified Custom Element consumption must not be presented as a shipped
first-class framework package before the corresponding distribution gate passes.
Missing contracts and unverified usage text are omitted rather than guessed.

Run:

```bash
npm run generate:consumer-knowledge
npm run verify:consumer-knowledge
npm run test:consumer-knowledge
npm run query:ai-context -- --component button --framework react
npm run query:ai-context -- --pattern settings
```
