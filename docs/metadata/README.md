# VyrnForge UI Metadata

These files are structured indexes for the docs app, contributors, automation,
and AI agents. Human-readable policy remains in the canonical architecture,
governance, testing, release, and quality documents; metadata provides queryable
repository facts and current evidence records.

## Core metadata

| File | Purpose |
| --- | --- |
| `packages.json` | Package ownership, dependencies, CSS imports, public entry points, and release-group membership. |
| `multi-framework.json` | Current package topology, framework support levels, styling policy, and four-surface consumer-fixture policy. |
| `component-contracts.json` | Canonical cross-framework events, slots, form association, and representative renderer-neutral component contracts. |
| `component-contract.schema.json` | JSON Schema for the canonical component contract catalog. |
| `components.json` | Canonical normalized component catalog, public-contract inventory, maturity, and evidence. |
| `design-tokens.json` | Shared semantic token categories, themes, densities, motion, layers, and compatibility bridges. |
| `framework-exceptions.json` | Explicit, reviewable framework-specific exceptions to shared contracts and generation. |
| `state-contracts.json` | Shared state ownership levels and adapter policies. |
| `css-imports.json` | Required CSS import order and styling ownership. |

## Consumer and framework evidence

| File | Purpose |
| --- | --- |
| `consumer-foundations.json` | Current packed Native HTML, React, Angular, and Vue fixture evidence plus Custom Element declarations and canonical events. |
| `angular-consumer.json` | Angular packed-consumer, property/event/slot/form, build, and Chromium evidence. |
| `angular-forms-adapter.json` | Angular Forms reference-adapter contract, supported value categories, ownership boundary, and runtime evidence. |
| `vue-consumer.json` | Vue packed-consumer compiler/property/event/slot/form, strict typing, build, and Chromium evidence. |
| `vue-model-adapter.json` | Thin Vue `v-model` reference-adapter contract and runtime evidence. |
| `ssr-bundler-compatibility.json` | Server-safe import and packed bundler compatibility evidence across web consumers. |
| `cross-framework-browser-matrix.json` | Shared packed browser scenarios, report contract, and trace evidence. |
| `cross-framework-accessibility-review.json` | Automated and manual cross-framework accessibility review evidence. |
| `multi-framework-migration-guide.json` | Multi-framework migration and limitations guide verification evidence. |
| `multi-framework-program-gates.json` | Forward-looking G11-G15 evidence-category requirements for first-class multi-framework distribution. |

## Native, maturity, quality, and release evidence

| File | Purpose |
| --- | --- |
| `native-element-foundations.json` | Native Custom Element foundation, registered catalog, form/event evidence, and renderer contracts. |
| `native-core-elements.json` | Canonical core native renderer coverage and browser evidence. |
| `native-advanced-elements.json` | Canonical advanced native renderer coverage and browser evidence. |
| `non-grid-beta-scope.json` | Frozen non-grid beta scope, renderer mappings, maturity, exclusions, and release gaps. |
| `release-groups.json` | Canonical release lines, versions, dist-tags, package order, and dependency graph. |
| `release-groups.schema.json` | JSON Schema for release-group metadata. |
| `beta-package-artifacts.json` | Expected beta package artifact contract and evidence. |
| `beta-package-size-budgets.json` | Package-size budget metadata for beta artifacts. |
| `compatibility-release-matrix.json` | Supported compatibility release cases. |
| `assistive-technology-reviews.json` | Canonical screen-reader environments, scenarios, and manual result records. |
| `assistive-technology-release-waivers.json` | Explicit release waivers for assistive-technology evidence. |
| `visual-regression-matrix.json` | Deterministic browser visual-evidence suites, dimensions, selectors, and token assertions. |
| `security-workflow-hardening.json` | Security requirements and evidence for repository workflows. |
| `trusted-publishing-provenance.json` | Trusted-publishing and provenance requirements. |
| `validation-layers.json` | Validation-layer contracts and ownership. |
| `ai-usage-rules.json` | AI-specific repository usage rules and constraints. |

## Multi-framework architecture

`multi-framework.json` describes the current reusable architecture rather than a
completed sprint ledger. Native HTML / Custom Elements, React, Angular, and Vue
consumer evidence is indexed through `consumer-foundations.json` and
`tests/consumers/manifest.json`. Framework-specific Forms/model adapters remain
thin translation layers over shared VyrnForge rendering, accessibility,
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

- `docs/architecture/adr-004-multi-framework-web-support.md`;
- `docs/architecture/09-component-contracts-and-events.md`;
- `docs/architecture/10-custom-elements-and-form-association.md`;
- `docs/testing/multi-framework-consumer-fixtures.md`.

## Maintenance

Update the canonical owner first, then regenerate or edit dependent metadata and
run its verifier. Do not add sprint story points, completed task ledgers, or
one-time closure state to current capability metadata unless an active quality
contract explicitly requires it.

Canonical maintenance rules live in
`docs/governance/04-metadata-maintenance.md`.
