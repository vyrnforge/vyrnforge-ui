# VyrnForge UI Metadata

These files are structured indexes for the docs app, contributors, automation,
and AI agents. Human-readable policy remains in the canonical architecture,
governance, testing, release, and quality documents. Metadata provides
queryable repository facts and current evidence records.

## Core metadata

- `packages.json` owns package relationships, public entry points, and release
  group membership.
- `multi-framework.json` owns current package topology, framework support,
  styling policy, and the four-surface consumer-fixture policy.
- `component-contracts.json` and `component-contract.schema.json` own shared
  renderer-neutral component, event, slot, and form contracts.
- `components.json` owns the normalized component catalog, public-contract
  inventory, maturity, and evidence.
- `patterns.json` owns reusable application composition patterns and task-routing
  hints shared by the playground and generated AI context.
- `design-tokens.json` owns shared semantic tokens, themes, densities, motion,
  layers, and compatibility bridges.
- `framework-exceptions.json` records explicit framework-specific exceptions to
  shared contracts and generation.
- `state-contracts.json` owns shared state and adapter boundaries.
- `css-imports.json` owns CSS import order and styling ownership.

## Consumer and framework evidence

- `consumer-foundations.json` indexes current packed Native HTML, React,
  Angular, and Vue fixtures together with Custom Element declarations and
  canonical events.
- `angular-consumer.json` records Angular packed-consumer, property, event,
  slot, form, build, and Chromium evidence.
- `angular-forms-adapter.json` records the Angular Forms reference-adapter
  contract and runtime evidence.
- `vue-consumer.json` records Vue compiler, typing, property, event, slot, form,
  build, and Chromium evidence.
- `vue-model-adapter.json` records the thin Vue `v-model` reference-adapter
  contract and runtime evidence.
- `ssr-bundler-compatibility.json` records server-safe import and packed bundler
  compatibility evidence.
- `cross-framework-browser-matrix.json` records shared packed browser scenarios,
  reports, and trace evidence.
- `cross-framework-accessibility-review.json` records automated and manual
  cross-framework accessibility evidence.
- `multi-framework-migration-guide.json` records migration and limitations guide
  verification evidence.
- `multi-framework-program-gates.json` defines forward-looking G11-G15 evidence
  categories for first-class multi-framework distribution.

## Native, quality, and release evidence

Native renderer evidence lives in `native-element-foundations.json`,
`native-core-elements.json`, and `native-advanced-elements.json`. Release and
scope contracts live in `non-grid-beta-scope.json`, `release-groups.json`,
`release-groups.schema.json`, `beta-package-artifacts.json`,
`beta-package-size-budgets.json`, and `compatibility-release-matrix.json`.

Accessibility, visual, security, provenance, validation, and AI policy evidence
lives in `assistive-technology-reviews.json`,
`assistive-technology-release-waivers.json`, `visual-regression-matrix.json`,
`security-workflow-hardening.json`, `trusted-publishing-provenance.json`,
`validation-layers.json`, and `ai-usage-rules.json`.

## Multi-framework architecture

`multi-framework.json` describes the current reusable architecture rather than a
completed sprint ledger. Native HTML / Custom Elements, React, Angular, and Vue
consumer evidence is indexed through `consumer-foundations.json` and
`tests/consumers/manifest.json`. Framework-specific Forms and model adapters
remain thin translation layers over shared VyrnForge rendering, accessibility,
validation, event, and form-association contracts.

Forward-looking multi-framework release gates are defined separately in
`multi-framework-program-gates.json` and
`docs/quality/multi-framework-program-gates.md`.

```bash
npm run test:multi-framework
npm run verify:multi-framework
npm run test:consumer-foundations
npm run verify:consumer-foundations
```

The primary human-readable sources are:

- `docs/architecture/adr-004-multi-framework-web-support.md`
- `docs/architecture/09-component-contracts-and-events.md`
- `docs/architecture/10-custom-elements-and-form-association.md`
- `docs/testing/multi-framework-consumer-fixtures.md`

## Maintenance

Update the canonical owner first, then regenerate or edit dependent metadata and
run its verifier. Do not add sprint story points, completed task ledgers, or
one-time closure state to current capability metadata unless an active quality
contract explicitly requires it.

Canonical maintenance rules live in
`docs/governance/04-metadata-maintenance.md`.
