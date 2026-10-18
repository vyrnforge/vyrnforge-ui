# Reference Generation

VyrnForge derives the reader-facing component/API Reference and scoped AI
context from canonical metadata. Generated files are projections, not a second
source of truth.

Canonical inputs include:

- `docs/metadata/components.json` for component identity, package, maturity,
  guidance, styling hooks, and framework parity;
- `docs/metadata/component-contracts.json` for shared properties, events,
  slots, methods, accessibility, and form contracts;
- `docs/metadata/component-presets.json` for named presets and aliases;
- `docs/metadata/patterns.json`, `docs/metadata/packages.json`, and
  `docs/metadata/multi-framework.json`;
- Native registration/exception metadata used to generate
  `packages/ui-elements/custom-elements.json`;
- `docs/metadata/reference-portal.json` for the shared Reference information
  model and routing contract.

## Generated chain

The canonical generation order is:

1. framework/native artifacts, including Custom Elements metadata and
   `docs/generated/framework-api-reference.json`;
2. `docs/generated/component-presets-reference.json`;
3. consumer knowledge, component reference, and task-scoped
   `docs/generated/ai-context/**`;
4. `docs/generated/reference-model.json`.

Run the whole chain with:

```bash
npm run generate:reference
```

Verify every checked-in generated Reference artifact without rewriting it with:

```bash
npm run verify:reference
```

The Docs application consumes generated facts directly from repository sources
at build time. The AI-context files remain checked-in machine-readable
repository artifacts; they are not promised as a separate static Pages API.

For normal documentation work also run:

```bash
npm run verify:docs-quality
npm run build:docs
```

`build:docs` verifies the generated Reference first and builds every direct
VyrnForge runtime dependency used by the Docs app, including Data Grid.

Production Pages delivery remains separate from generation. Exact-main CI
verifies the generated Reference, builds the Docs app, assembles the versioned
site, binds commit/CI lineage, verifies the site, and uploads a
`pages-site-<sha>` artifact. The Pages workflow deploys that verified artifact
without rebuilding repository source.

Use `npm run query:ai-context -- ...` when repository tooling or an agent needs
a focused component or pattern slice.
