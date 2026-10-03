# Documentation Authoring

## Purpose

This is the contributor source of truth for adding and changing public VyrnForge
documentation. The Docs application is a renderer over canonical metadata and
generated facts; contributors should not register pages, navigation, search, or
framework/version routes in React application code.

For product architecture and ownership rationale, see
[Documentation System](documentation-system.md).

## Ownership map

Choose the canonical owner before editing content.

| Concern                                                                                                          | Canonical owner                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Public document identity, type, section, order, renderer, source path, record-domain binding, and content layers | `docs/metadata/documentation-pages.json`                                              |
| Framework documentation readiness by release line                                                                | `docs/metadata/release-groups.json`                                                   |
| Framework identities and support topology                                                                        | `docs/metadata/multi-framework.json` and `docs/metadata/reference-portal.json`        |
| Component contracts and API semantics                                                                            | `docs/metadata/component-contracts.json` plus generated framework API/reference facts |
| Component catalog/maturity                                                                                       | `docs/metadata/components.json`                                                       |
| Packages and public entry points                                                                                 | `docs/metadata/packages.json`, package manifests, and release metadata                |
| Tokens                                                                                                           | `docs/metadata/design-tokens.json` and shared runtime token CSS                       |
| Patterns                                                                                                         | `docs/metadata/patterns.json`                                                         |
| Packed cross-framework example evidence                                                                          | `docs/metadata/executable-examples.json` and `tests/consumers/manifest.json`          |
| Framework-specific exceptions                                                                                    | `docs/metadata/framework-exceptions.json`                                             |
| Generated routes/navigation/search/indexes/sitemap/templates/availability                                        | `docs/generated/documentation-registry.json`                                          |

Generated files are projections, not authoring surfaces.

## Document types and templates

Public documents use the template contracts in
`docs/metadata/documentation-pages.json`. Current document types are:

- `component`
- `foundation`
- `guide`
- `pattern`
- `package`
- `advanced-module`
- `release`
- `example`

The template defines ordered semantic sections. Authors may omit a section when
it does not apply, but should not invent a different page shell or reorder the
common anatomy in Docs application code.

Component documentation follows the canonical sequence: summary, usage,
configuration, behavior, accessibility, API, styling, and related content.

## Shared, framework, and version content

One conceptual document keeps one stable document identity. Reuse content rather
than duplicating whole pages.

A page may provide `contentLayers` with this precedence:

1. base page fields;
2. `shared`;
3. `frameworks[frameworkId]`;
4. `versions[version]`;
5. `frameworkVersions["frameworkId@version"]`.

A layer may override editorial fields such as title, description, source,
renderer, example identity, tags, and lifecycle metadata. The centralized
resolver applies those layers. Do not add page-local checks such as
`if (framework === "react")` or version switches in Docs React components.

Shared content means reusable source material; it does not mean content is valid
for every framework/version. Availability remains authoritative.

## Framework and version availability

Documentation readiness belongs to the release line in
`docs/metadata/release-groups.json`, independently of package publication.

Supported readiness states are:

- `stable`
- `preview`
- `maintenance`
- `deprecated`
- `unavailable`
- `internal-not-ready`

Every public page declares its `releaseLine`. The Documentation Registry
derives framework/version availability from that release line. Keep independent
release lines independent: for example, Data Grid must not be projected onto the
non-grid release line merely for selector convenience.

Never silently substitute another framework or version. The resolver and Docs UI
must show an explicit unavailable state and valid alternatives.

## Code language conventions

Use the frozen authoring conventions unless the capability materially requires
something else:

| Framework | Canonical authored form |
| --- | --- |
| Native HTML / Custom Elements | HTML + TypeScript |
| React | TSX |
| Angular | TypeScript + Angular templates |
| Vue | Vue SFC + TypeScript |

Do not add parallel JavaScript/TypeScript variants when they express the same
behavior.

## Examples

Examples use one conceptual identity with framework implementations where
available.

For packed four-surface evidence, keep
`docs/metadata/executable-examples.json` aligned with
`tests/consumers/manifest.json`. Those fixtures are the evidence for Native,
React, Angular, and Vue runtime claims.

Docs-host interactive previews currently register an `exampleId` and
`exampleCategory` on the canonical page record. They are React-hosted
implementations and must not be presented as Native, Angular, or Vue examples
unless an implementation for that framework is actually registered and
verified.

Valid example categories are `basic`, `appearance`, `state`,
`composition`, and `advanced`.

## Generated API versus editorial guidance

Do not hand-copy normal component props, attributes, inputs, outputs, events,
slots, templates, methods, package facts, or token values into parallel Docs
tables. Generated API/reference facts remain authoritative.

Editorial content should explain purpose, usage, behavior, accessibility,
migration, and composition, then render or link canonical generated facts.

When a canonical contract changes, update the contract first and regenerate the
Reference outputs.

## Add a new documented capability

For a normal authored public page:

1. Identify or add the reusable VyrnForge capability and its canonical metadata.
2. Run the scaffolder:

   ```bash
   npm run scaffold:documentation -- \
     --id command-palette \
     --title "Command Palette" \
     --description "Command discovery and execution guidance." \
     --type component \
     --section components \
     --release-line non-grid-beta \
     --source docs/components/command-palette.md
   ```

3. Fill the generated template sections with reusable guidance.
4. Add framework/version content layers only where behavior or guidance truly
   differs.
5. Add example/API linkage through canonical metadata rather than Docs app
   registration.
6. Regenerate and verify:

   ```bash
   npm run generate:reference
   npm run verify:reference
   npm run verify:docs-quality
   npm run test:contracts
   npm run build:docs
   ```

A valid new documentation record must become routable and discoverable without
editing `referenceRoutes.ts`, `DocsNav.tsx`, search indexes, or sitemap files.

## Add a framework-specific exception

Prefer the shared contract, behavior, generator, or adapter path first.

When a genuine framework exception remains necessary:

1. Follow `docs/architecture/adr-008-framework-exception-policy.md`.
2. Add or update the explicit record in
   `docs/metadata/framework-exceptions.json`.
3. Include the framework, scope, exception class, reason, owner, source paths,
   evidence, exit criteria, and state required by that schema.
4. Keep the exception narrow and traceable.
5. Run the framework-exception and normal documentation/reference verifiers.

Do not encode the exception as an undocumented branch inside a Docs page.

## Deprecation, removal, and version-specific content

Use canonical lifecycle/version metadata rather than deleting historical
semantics from generated truth.

- Put introduced/deprecated/removed facts in canonical contracts or document
  lifecycle metadata where supported.
- Use a version layer when editorial content changes for a documentation
  version.
- Use a framework-version layer only for the intersection that actually differs.
- Change release-line readiness when documentation is no longer ready for a
  framework/version.
- Preserve or deliberately migrate established deep links.
- Do not silently point an old link at unrelated content.

## Required local verification

Use the repository-owned gates, not a standalone TypeScript compile:

```bash
npm run generate:reference
npm run verify:reference
npm run verify:docs-quality
npm run test:contracts
npm run typecheck --workspace @vyrnforge/ui-docs
npm run lint --workspace @vyrnforge/ui-docs
npm run format:check
npm run build:docs
```

Run additional package, browser, accessibility, or consumer gates when the
changed capability requires them. Protected CI remains the completion evidence.

## Never edit these as authoring shortcuts

Do not manually maintain:

- `docs/generated/documentation-registry.json`;
- `docs/generated/reference-model.json`;
- generated framework API/reference files;
- public route or section arrays in `apps/docs/src/referenceRoutes.ts`;
- manual sidebar membership in `apps/docs/src/DocsNav.tsx`;
- hand-built search/index/sitemap outputs;
- framework/version availability inside React page components;
- duplicated API tables that restate generated facts.

Do not add a second documentation registry, release/version database, or
framework availability authority.

When generated output is stale, change its canonical input and run
`npm run generate:reference`.
