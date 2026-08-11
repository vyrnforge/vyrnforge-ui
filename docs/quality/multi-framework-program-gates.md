# Multi-Framework Program Gate Matrix

- Task: MFD-1014
- Status: Accepted target quality contract
- Depends on: MFD-1002, MFD-1005
- Machine-readable companion: `docs/metadata/multi-framework-program-gates.json`

## Rule

S11-S15 gates are evidence decisions. A gate cannot pass from prose claims alone. Each required evidence category must have a repository-verifiable artifact, command/result, metadata record, packed-consumer result, or approved exception.

## G11 — Multi-Framework Generation Ready

Must prove:

- canonical contract loading/validation is deterministic;
- generated output is deterministic and stale-output detectable;
- Native, React, Angular, and Vue generator/facade foundations exist;
- representative Button/TextInput/Tabs/Dialog-style vertical slices cover action, form, navigation, and overlay semantics across all four surfaces;
- packed smoke consumers install only public package outputs;
- type/build/browser/accessibility evidence exists for the vertical slice;
- generated output is removable/reproducible and handwritten deviations are declared exceptions.

Catalog-wide migration is blocked until G11 passes.

## G12 — Angular First-Class Ready

Must prove:

- official Angular package and public install/setup path;
- generated catalog bindings or explicit exceptions for supported non-grid components;
- Angular Forms/CVA, disabled/touched/validity/reset behavior derived from canonical contracts;
- property/event/content/template/ref typing is usable in supported Angular versions;
- packed consumer build/runtime evidence;
- browser keyboard/focus and automated accessibility evidence;
- SSR/import/bundler behavior where claimed;
- package contents, declarations, release-artifact and provenance readiness;
- copied fixture-side VyrnForge integration is removed only after the package path passes.

## G13 — Vue First-Class Ready

Must prove:

- official Vue package and public install/setup path;
- generated supported catalog or explicit exceptions;
- typed props/emits, slots, refs and `v-model` derived from canonical contracts;
- normal path does not require consumers to copy model/registration wrappers;
- packed consumer build/runtime evidence;
- browser keyboard/focus and automated accessibility evidence;
- SSR/import/bundler behavior where claimed;
- package contents, declarations, release-artifact and provenance readiness;
- old fixture adapters remain until package cutover passes and are then removed.

## G14 — React Convergence Ready

Must prove:

- captured public API/package/type/CSS/ref/callback baseline;
- every supported non-grid component classified as canonical-backed facade, temporary legacy implementation, or approved dedicated-renderer exception;
- stable React public ergonomics over canonical properties/events/composition/model/ref semantics;
- SSR/hydration evidence;
- migrated batches pass API, behavior, DOM/visual where applicable, browser, keyboard/focus and accessibility parity;
- performance/bundle/runtime cost does not materially regress without an approved exception;
- legacy implementation is removed only after parity and rollback criteria pass;
- final clean packed React consumer uses the intended public package path.

## G15 — Multi-Framework Distribution Release-Ready

Must prove:

- generalized release metadata with no fixed package-count or historical-task dependency;
- publishable workspace classification and dependency closure derived from metadata;
- metadata-driven version/dist-tag/package selection;
- collision-safe release identity for independent release lines;
- immutable artifact preparation and package verification;
- package declarations/exports/CSS/size policies as declared by metadata;
- OIDC trusted publishing/provenance/integrity coverage for every publishable first-class package;
- packed or registry-equivalent four-surface consumer verification;
- framework-first install/migration documentation matches implemented packages;
- complete release dry-run passes before any real npm publication is separately authorized.

## Evidence categories

Later sprint tasks may add finer checks, but gate evidence is classified into these reusable categories:

- `contracts`
- `generation`
- `types-api`
- `package-artifact`
- `packed-consumer`
- `browser-behavior`
- `accessibility`
- `ssr-hydration-bundler`
- `performance`
- `release-trust`
- `documentation-migration`
- `exceptions-rollback`

A gate record states which categories are required, the evidence references, status, and any approved exception ids.

## Acceptance mapping

This matrix makes G11-G15 measurable across browser, accessibility, package, consumer, SSR/type/API/performance and release evidence. Gate closure requires machine-readable evidence references and cannot rely on a prose-only support claim.
