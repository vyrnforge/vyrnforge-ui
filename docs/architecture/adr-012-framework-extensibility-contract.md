# ADR-012: Framework Extensibility Contract

- Status: Accepted architecture standard
- Origin: Vision/mission standardization after the S10-S15 distribution architecture
- Applies to: future framework admission, framework descriptors, facade generation, package ownership, evidence, release metadata, documentation, and AI context

## Context

VyrnForge currently approves four first-class web surfaces: Native HTML, React, Angular, and Vue. Their support model is defined by the existing multi-framework architecture, package strategy, facade-boundary rules, generation contracts, and exception policy.

Those four surfaces are the currently approved product set. They must not become a permanent architectural ceiling encoded throughout contracts, generators, metadata, documentation, or AI tooling.

A future framework should be addable by extending one VyrnForge contract system rather than creating another independent design system or duplicating the complete component catalog. At the same time, architectural extensibility must not be confused with automatic product support. A framework is not supported merely because it can render Custom Elements or because a generic adapter could theoretically be written.

This ADR defines the admission and integration contract for future framework surfaces without approving or naming any additional framework or public package.

## Decision

VyrnForge will treat framework support as an **extensible capability model with explicit product admission**, not as a permanently closed four-value architecture.

The currently approved framework set remains:

- Native HTML;
- React;
- Angular;
- Vue.

No additional framework becomes supported through this ADR alone.

Conceptually:

```text
canonical VyrnForge UI contracts
  properties / attributes
  events / reasons
  models / forms
  composition
  refs / methods
  accessibility
  styling / tokens
          |
          v
framework integration descriptor
  syntax capabilities
  runtime boundaries
  setup / registration
  facade-generation strategy
  exception support
          |
          v
framework facade/package
          |
          v
packed consumer and release evidence
```

A future framework must enter through this pipeline and satisfy the admission criteria in this ADR before it can be described as first-class.

## Product support versus architectural capability

VyrnForge distinguishes:

1. **Architecturally representable** — the contract/generation model can describe a framework.
2. **Candidate** — a concrete framework is under product and technical evaluation.
3. **Verified integration** — representative consumer evidence exists, but a first-class distribution claim has not necessarily passed.
4. **Approved first-class target** — product support is accepted and package/distribution work is authorized.
5. **First-class released** — the framework has passed its required implementation, consumer, compatibility, documentation, and release gates.
6. **Deprecated/retiring** — support remains available during an approved migration period but is scheduled for removal or reduced status.

These are conceptual lifecycle states. Exact machine-readable status enums and schema changes must be decided during implementation and must remain compatible with current metadata.

A generic Custom Element interoperability path does not by itself satisfy first-class framework support.

## Framework integration descriptor

A future framework integration should be representable through a structured descriptor or equivalent canonical metadata. The exact schema is intentionally deferred, but the model must be able to express the following concerns.

### Identity

- stable framework id;
- display name;
- supported framework/runtime version policy;
- lifecycle/support status;
- ownership and review responsibility.

### Runtime and package boundary

- framework runtime or peer requirements;
- server/build runtime expectations;
- public facade/package ownership once approved;
- setup, plugin, registration, or provider requirements;
- CSS/style integration requirements.

A descriptor does not itself create a package name. Public package identity requires a concrete architecture/repository decision under the one-obvious-install-path principle established by ADR-006.

### Property and declarative mapping

The descriptor must be able to explain how canonical properties and attributes map to idiomatic framework inputs, props, bindings, attributes, or equivalent mechanisms.

Generators must not rediscover component API by reading framework implementation source.

### Event mapping

The descriptor must define the framework mechanism used for canonical VyrnForge events, callback/output naming, typed payloads, cancellation where supported, and stable reason values.

Framework syntax may differ; event meaning must not.

### Model and forms mapping

The descriptor must express how canonical value, checked, selection, open, pressed, custom model, disabled, validity, reset, touched, and form-association concepts map into the framework's idioms.

Where a framework has no direct equivalent, the integration must define a deliberate adapter or an explicit limitation/exception rather than silently changing semantics.

### Composition mapping

The descriptor must express how semantic composition regions map to the framework's children, slots, templates, content projection, render functions, snippets, or equivalent composition mechanism.

The framework must preserve canonical composition meaning even when syntax and DOM structure differ.

### Ref and imperative mapping

The descriptor must define how consumers receive canonical element access, facade handles, public methods, focus behavior, and imperative APIs.

Framework-specific limitations belong in explicit integration rules or ADR-008 exceptions.

### Lifecycle and registration

The descriptor must capture framework lifecycle considerations such as:

- Custom Element registration timing;
- client-only setup where required;
- mount/unmount or destruction behavior;
- event listener ownership;
- property synchronization;
- hydration timing;
- duplicate-registration avoidance.

### SSR and hydration

The integration must define whether server rendering, server-side import, hydration, streaming, or equivalent framework capabilities are supported and how browser-only work is isolated.

Browser globals must not leak into shared foundations merely to support a framework adapter.

### Styling

The integration must consume VyrnForge's shared token and CSS architecture rather than introduce a parallel framework-owned design system.

Framework-specific style loading or encapsulation behavior may be mapped when required, but it must preserve the public VyrnForge styling contract.

## Generation-first rule

Generated or generic canonical-backed integration remains the default for future frameworks.

Framework integration tooling should be driven by shared contract data plus framework-capability rules. New framework support must not cause component semantics to be copied manually into a parallel framework source tree.

Prefer:

```text
canonical contract + framework descriptor + generator/generic runtime
```

over:

```text
component-by-component framework rewrite
```

A framework-specific implementation may exist only where evidence shows that generic/generated integration cannot satisfy a required public contract.

## Hard-coded framework assumptions

Tooling should avoid scattering framework-name conditionals when a capability can be represented declaratively.

For example, behavior such as:

- event transport;
- model binding mechanism;
- composition mechanism;
- ref exposure;
- registration/setup;
- SSR behavior;

should preferentially be expressed as framework capabilities or centralized framework rules rather than repeated `if framework === ...` branches across component generators.

This does not prohibit framework-specific code. It requires that framework-specific behavior have a deliberate ownership boundary.

## ADR-008 exception integration

ADR-008 applies to every future framework.

Any handwritten adapter, component-specific generator branch, specialized compatibility layer, or dedicated renderer must have an explicit exception when it exceeds the normal framework integration contract.

The narrowest possible exception remains preferred.

Valid reasons continue to require evidence such as:

- SSR/hydration incompatibility;
- measured performance regression;
- inaccessible or incorrect form/focus behavior;
- composition incompatibility;
- imperative/ref incompatibility;
- compiler/type-system limitations;
- temporary migration compatibility.

Framework popularity, contributor preference, or avoidance of generator work is not sufficient.

## Package and dependency policy

When a future framework is approved as a first-class target, ADR-006's one-obvious-install-path principle applies.

The concrete package architecture must establish:

- one canonical normal install path;
- framework runtime/peer dependencies isolated to the facade package where practical;
- no reverse dependency from shared foundations to the new framework runtime;
- public typed entrypoints;
- no required deep imports;
- migration/interoperability path where relevant.

This ADR intentionally does not invent a package name or require naming symmetry with existing packages.

A new framework package must follow the current repository package-boundary and release-governance process before implementation claims are made.

## Admission criteria

A framework may become an approved first-class target only when its proposal addresses all of the following.

### 1. Product demand

There is concrete, reusable consumer value sufficient to justify ongoing support rather than speculative framework collection.

### 2. Ecosystem viability

The framework has a supportable ecosystem, version policy, runtime/build model, and maintenance horizon appropriate for VyrnForge's product commitments.

### 3. Canonical contract coverage

The existing VyrnForge contract model can express the required component semantics, or an explicit shared contract extension is approved before framework-specific divergence is introduced.

### 4. Facade/generation feasibility

Representative components prove that canonical-backed generation or generic integration can provide an idiomatic framework surface.

### 5. Dependency isolation

The framework runtime does not leak into `ui-core`, `ui-behaviors`, or other shared foundations.

### 6. Idiomatic public API

Properties, events, composition, setup, and lifecycle feel natural to framework consumers without changing canonical VyrnForge semantics.

### 7. Forms/model integration

The framework can represent relevant controlled/model/form behavior correctly, or documented limitations/exceptions are explicit.

### 8. Composition integration

Slots/templates/children/content projection/render functions or equivalent mechanisms can represent canonical composition regions reliably.

### 9. Ref/method integration

Public element/facade references and imperative methods have a typed, supportable integration model.

### 10. SSR/hydration/build compatibility

Supported server/build modes are explicitly defined and tested where applicable.

### 11. Accessibility

Framework integration preserves canonical keyboard, focus, labeling, form, disabled/invalid, overlay, and other accessibility obligations.

### 12. Packed consumer evidence

A real consumer uses the packed intended distribution rather than only workspace source aliases.

### 13. Compatibility policy

Supported framework versions, peer ranges, migration expectations, and deprecation policy are defined.

### 14. Release and provenance

Package/release metadata, artifact verification, size expectations, trusted publication/provenance, and release notes can represent the new framework without hard-coded package-count assumptions.

### 15. Documentation and AI context

Public usage guidance and ADR-010 framework-scoped AI context can be derived without creating another independent semantic catalog.

### 16. Exception analysis

Known framework-specific exceptions are recorded with owner, evidence, scope, and exit criteria.

### 17. Maintenance ownership

The ongoing compatibility, release, testing, documentation, and migration cost has a clear owner and is justified by product value.

## Evidence required before first-class release

An approved first-class target is not equivalent to a released first-class surface.

Before release claims, the framework should provide representative evidence for the applicable areas:

- install/setup from public package artifacts;
- public exports and TypeScript or equivalent type surface;
- property/input behavior;
- canonical event mapping;
- form/model integration;
- composition regions;
- refs and methods;
- keyboard/focus/accessibility behavior;
- theme and density behavior;
- production build;
- SSR/server-safe imports and hydration where applicable;
- browser/runtime compatibility;
- package size and dependency behavior;
- documentation and migration guidance;
- release/provenance metadata.

The exact gate belongs to the framework's implementation program.

## Advanced module relationship

ADR-011 advanced modules declare their own framework support status.

A framework being first-class for common VyrnForge UI does not automatically mean every advanced module supports that framework.

For example, a future advanced capability may have a narrower initial framework matrix because of rendering-engine, performance, or platform constraints. Such differences must be explicit in module metadata and documentation and must not weaken the support claims of unrelated common UI surfaces.

## AI relationship

ADR-010 AI context should derive framework-specific slices from the same integration descriptor/canonical mappings used by framework generation.

AI tooling must not permanently hard-code exactly four framework options when a registry/capability-driven selection model can represent the same behavior.

The currently approved four remain the only surfaces that AI guidance may describe as approved first-class targets until another framework passes admission.

## Migration and compatibility

Adding a new framework must not require public breaking changes to existing framework surfaces merely to normalize implementation or naming.

Shared contract extensions required for a new framework must preserve existing semantics or go through the normal compatibility/migration process.

Deprecating or removing a framework requires a separate evidence-backed product and migration decision. Framework removal is not an incidental metadata edit.

## S10-S15 relationship

This ADR does not add a fifth framework to the active S10-S15 program and does not alter current G12, G13, G14, or G15 acceptance criteria.

During the active program, implementation should avoid unnecessary architectural hard-coding that would make future framework admission costly, but schema or generator refactoring solely for hypothetical future frameworks should not derail current framework delivery.

A concrete framework-registry/schema evolution can be planned after S10-S15 or earlier only if required by active implementation evidence.

## Rejected approaches

### Permanent closed four-framework enum

Rejected as the long-term architecture because it forces future framework support to redesign contracts, generators, AI context, and release metadata.

### Automatic support because Custom Elements work

Rejected because interoperability is not equivalent to first-class package, forms/model, composition, typing, SSR, accessibility, documentation, and release support.

### Independent framework design system

Rejected because it duplicates VyrnForge semantics and creates divergent product behavior.

### One universal package containing all framework runtimes

Rejected because it weakens dependency isolation and forces consumers to pay for frameworks they do not use.

### Create a package before admission evidence

Rejected because package topology must follow product support and architecture decisions, not precede them.

### Untracked framework-specific generator branches

Rejected because framework-specific exceptions must be centralized, reviewable, and governed by ADR-008.

## Implementation follow-up

This ADR accepts the framework-extensibility model but does not modify the current component-contract schema or generated framework metadata.

A future implementation program may introduce a framework registry or descriptor schema and migrate fixed framework mappings in a backward-compatible way. That work must preserve the active Native HTML, React, Angular, and Vue contracts and must not destabilize ongoing S12/S13/S14 delivery.

## Relationship to existing architecture

This ADR extends rather than replaces:

- ADR-004 multi-framework support evidence;
- ADR-005 canonical web implementation;
- ADR-006 public framework package strategy;
- ADR-007 framework facade package boundaries;
- ADR-008 framework exception policy;
- ADR-009 React convergence strategy;
- canonical component/model/composition/event/ref contracts;
- ADR-010 AI Consumption Contract;
- ADR-011 Optional Advanced Module Architecture.

The result is an architecture where VyrnForge can add another justified framework by extending one shared contract and distribution system rather than rebuilding the library around that framework.
