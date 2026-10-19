# Package and Component Documentation Ownership

## Priority rule

Package and component documentation is authored with the capability that owns it and projected into VyrnForge Reference through generation.

`apps/docs` is a renderer of generated documentation models. It is not an authoring surface for package- or component-specific semantic truth.

This rule has priority over further Reference presentation/specimen expansion until issue #810 completes the ownership migration and enforcement work.

## Ownership

Package-owned documentation includes package purpose, setup/entry-point guidance, package limitations, and package-scoped migration or release detail.

Component-owned documentation includes purpose, use/avoid guidance, verified specimen/example scenarios, composition guidance, interaction guidance, limitations, and component-scoped migration or release detail.

Shared renderer-neutral API semantics remain in canonical shared component contracts. Shared tokens/themes remain owned by the design foundation. Framework syntax and bindings come from framework mappings/generators and explicit framework exceptions. Accessibility claims remain tied to canonical evidence.

Do not move shared cross-framework contracts into a React-only component folder simply to achieve locality.

## Owned component source convention

Package README files remain the natural package-level authoring surface for package setup, entry points, integration guidance, and package-scoped limitations.

Component human guidance uses schema-validated `*.docs.json` sources inside the package that owns the canonical implementation. The source stays beside the relevant package implementation instead of under `apps/docs` or a second centralized component tree. `docs/metadata/component-documentation.schema.json` defines the shared contract and `scripts/component-documentation-sources.mjs` discovers package-owned sources recursively.

The physical location follows the package's real implementation layout. Packages with one folder per component may colocate the source in that folder. Packages such as `@vyrnforge/ui-elements`, whose canonical Native HTML components are grouped by domain, may colocate a component source in the same domain directory without inventing a React-shaped folder hierarchy.

The first migration proof is Button: shared human guidance lives at `packages/ui-elements/src/components/button.docs.json` beside the canonical action implementation in `actions.ts`. Generated Reference data reads that owned source preferentially while centralized metadata remains a compatibility fallback for components that have not migrated yet.

Owned component sources may express purpose, use/avoid and AI guidance, limitations, related components, accessibility notes/evidence references, theming relationships, verified example intent, and component-scoped release/migration notes. They must not duplicate generated API facts such as framework bindings, properties, events, slots, methods, or token values.

## Generation boundary

The target flow is:

```text
owning package/component
  ├─ implementation / public API
  ├─ shared contract reference
  ├─ human guidance
  ├─ verified example/specimen scenarios
  ├─ evidence references
  └─ migration/release notes where applicable
              │
              ▼
      normalization + generators
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
 framework  Reference  AI/search
 artifacts   model      context
              │
              ▼
         apps/docs renderer
```

One generated Reference model does not require one giant authoring file. Existing authoritative domains may remain separate and be joined deterministically.

## Docs application boundary

`apps/docs` may own generic page/layout renderers, generic documentation-model rendering, framework/version context UI, generic code/example presentation, navigation/search presentation derived from generated registries, and host adapters needed to render verified examples.

`apps/docs` must not become the owner of package/component usage guidance, variant/state/size inventories, component-specific specimen scenario definitions, framework support truth, accessibility claims, theming contracts, limitations, or migration/release facts.

`apps/docs/src/ReferenceComponentSpecimen.tsx` currently contains legacy component-specific specimen dispatch. Those entries are migration debt. They may be removed or replaced by owned/generated scenarios, but new component-specific entries must not be added.

## Dedicated Reference page presentation overrides

A capability may have a dedicated Reference catalog or tool when the generic component/package record presentation cannot provide the required browsing experience. This is a presentation override, not a second semantic owner.

The canonical component, package, token, contract, framework, accessibility, and API records remain intact and continue to feed generators, search, AI context, and verification. A dedicated page may suppress a replaced record from the general reader-facing catalog and canonicalize its old record URL to the dedicated route, but it must not delete or fork that canonical record simply to avoid duplicate navigation.

Dedicated pages use the shared Reference shell, global framework/version context, canonical route model, and design-system components. Their presentation policy is declared centrally in `apps/docs/src/dedicatedReferencePagePolicy.ts`: route identity, renderer identity, shell layout mode, frame behavior, and any general records whose reader-facing presentation is replaced. React renderer bindings live separately in `apps/docs/src/DedicatedReferencePages.tsx` so data discovery and routing policy do not depend on a page implementation.

The Icons catalog is the first application of this contract: `/icons` replaces the generic reader presentation for the canonical `components/icon` record while preserving that component record as real `@vyrnforge/ui-components` API truth. Future dedicated pages must use this contract rather than adding page-specific exclusions to component discovery, navigation, routing, or shell layout code.

## Human guidance versus generated facts

Generated API/reference facts remain authoritative for normal props, attributes, inputs, outputs, events, slots/templates, methods, framework mappings, package facts, and token values.

Human authors remain responsible for facts a generator cannot safely infer: purpose, when to use or avoid, example intent, interaction/composition guidance, accessibility evidence/context, limitations/maturity caveats, and migration/release context.

Those human facts still require an explicit package/component/shared owner and must not be guessed by Docs.

## Changelog and release detail

Package- or component-relevant migration and release information must be attributable to the package/component that owns the changed capability and be projectable into Reference/release/search/AI outputs without copying prose into `apps/docs`.

Repository-level `CHANGELOG.md` may remain an aggregate release artifact; it must not be the only owner of component/package migration context when the owned documentation contract requires that context.

## Transitional centralized metadata

The repository currently contains significant component/package authoring content in centralized `docs/metadata` files. Treat that content as migration input, not as permission to add further page-owned duplication.

Until #810 migrates a concern to its final owner, update the existing canonical record when required, do not create an additional copy in `apps/docs`, and prefer changes that reduce duplication.

For component migrations, `scaffold:documentation` can seed a package-owned source from the current centralized human guidance without registering another public page:

```bash
npm run scaffold:documentation -- \
  --component-id <component-id> \
  --owner-source packages/<package>/<implementation-source> \
  --source packages/<package>/<component>.docs.json
```

The owner source and documentation source must live in the same VyrnForge package. The command derives the package identity from that package's `package.json`, validates the new source through the owned documentation loader, and rolls the file back if ownership or schema validation fails. It deliberately refuses to invent missing purpose, use/avoid guidance, AI guidance, or accessibility context; those migration facts must already be explicit in canonical metadata before they can be moved.

Owned component mode does not add another entry to `documentation-pages.json`. Components continue to use the existing generated Reference route and model. After scaffolding, run the existing `npm run generate:reference` flow.

## Contributor workflow target

A contributor should be able to change a package/component implementation and public contract, update its owned documentation/evidence when required, run the existing generation/verification flow, and receive updated Native HTML, React, Angular, Vue, Reference, search, and AI projections without editing a component-specific Docs page.

## Enforcement

CI must eventually verify owned documentation presence/schema, public API references, generated projection freshness, four-surface framework truth, and package/component documentation drift.

As the first guardrail, existing Docs-local specimen entries are frozen as legacy debt: removal is allowed, expansion is not.
