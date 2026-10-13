# Component documentation ownership

VyrnForge component documentation follows the package/component ownership model
tracked by #810. The Docs application renders generated documentation
projections; it does not own component semantics.

## Current ownership boundary

- **Public identity and maturity.** `docs/metadata/components.json` owns public
  component identity, maturity, package, routes, and evidence. Generators,
  Reference, and quality checks consume those facts.
- **Shared runtime semantics.** `docs/metadata/component-contracts.json` owns
  framework-neutral properties, attributes, events, slots, methods, form
  semantics, accessibility contracts, and framework mappings. Framework
  artifacts, generated API, and Reference consume those contracts.
- **Owned component guidance.** Package-local
  `packages/**/<component>.docs.json` files beside the owning implementation
  own guidance, examples, limitations, theming guidance, related components,
  and release or migration notes. `scripts/component-documentation-sources.mjs`
  validates them and `scripts/generate-component-reference.mjs` projects them.
- **Native implementation.** The owning package source, primarily
  `@vyrnforge/ui-elements` where the canonical renderer lives, owns the native
  browser implementation. React, Angular, and Vue remain first-class adapters
  over shared VyrnForge foundations.
- **Framework usage and API facts.** Existing framework generators own
  generated framework usage and API facts consumed by Reference.
- **Reference presentation.** Generic page, template, and rendering adapters in
  `apps/docs` own presentation only. They must not become semantic sources of
  component truth.

## Existing owned-documentation foundation

The repository already provides:

- `docs/metadata/component-documentation.schema.json` for schema v1;
- `scripts/component-documentation-sources.mjs` for package-local discovery
  and validation;
- `scripts/component-documentation-sources.test.mjs` for ownership
  verification;
- generator ingestion in `scripts/generate-component-reference.mjs`;
- `packages/ui-elements/src/components/button.docs.json` as the first owned
  component documentation source.

Button proves that package-owned purpose, use/avoid guidance, limitations,
related components, accessibility notes, theming surface, verified scenario
intent, and release notes can live with the canonical component owner while
shared API contracts remain framework-neutral.

## Current migration coverage

The required ownership scope is derived from
`scripts/non-grid-component-scope.mjs`: public exports included in the shared
non-grid beta scope. The current baseline contains 71 required components. Seven
already have package-owned documentation sources and 64 remain on centralized
fallback guidance while they are migrated.

The baseline is deliberately a coverage floor and fallback ceiling rather than
a second component registry. Component identities continue to come from
canonical component metadata and package-local documentation discovery.
Coverage may only improve: adding a new public component without owned
documentation, removing an existing owned source, or increasing fallback debt
fails verification.

## Remaining ownership gaps

The Reference projection includes owned `examples` and `releaseNotes` in the
normalized component record and AI component slice. Docs consumes scenario
titles, intent, framework applicability, and release notes from that generated
projection. `apps/docs/src/ReferenceComponentSpecimen.tsx` retains only the
executable React-host rendering adapter required to draw live specimens.

Centralized metadata also still contains guidance fields used as fallback input.
Those fields must only be removed after equivalent package-owned sources exist
and generator/consumer parity is proven. Shared component contracts must remain
centralized where they describe genuinely framework-neutral runtime semantics.

## Migration sequence

1. Preserve the existing owned source loader and schema as the single
   package-local authoring contract.
2. Project owned example/release metadata into the normalized generated
   component model and AI/search slices.
3. Make `apps/docs` render scenario titles, intent, framework availability,
   limitations, and release notes from that generated projection.
4. Keep only rendering adapters in Docs where a live React-host specimen needs
   executable component composition; do not store semantic prose or
   supported-scenario truth there.
5. Migrate additional components in independent cohorts by owning package once
   the projection contract is stable.
6. Enforce monotonic coverage and require package-owned documentation whenever a
   fallback component's canonical public metadata, canonical contract, or
   recorded implementation source changes.
7. Retire duplicated guidance from centralized component metadata only after
   generated parity and packed/public Reference verification pass.

## Enforcement rules

- `apps/docs` must not import package-local `*.docs.json` files directly or scan
  package internals at runtime.
- Owned component documentation must live inside the package that owns the
  referenced implementation source.
- React, Native HTML, Angular, and Vue scenario applicability is declared from
  the same owned documentation source.
- Component-specific prose, scenario intent, limitations,
  accessibility/theming guidance, and migration notes must not be newly
  introduced in Docs-local registries.
- Generator output remains the boundary consumed by Reference/search/AI
  context.
- Framework-specific rendering adapters may exist only as presentation
  adapters; they must not become alternate semantic owners.
- `scripts/component-documentation-coverage.mjs` derives current coverage from
  canonical public-scope metadata and discovered package-owned sources. During
  CI it compares the current tree with the supplied base commit and blocks
  ownership regression or documentation-relevant edits to fallback components.

This document records the ownership boundary; generated artifacts and CI remain
the executable evidence.
