# ADR-013: Reusable Pattern and Template Contract

- Status: Accepted architecture standard
- Origin: Vision/mission standardization after the S10-S15 distribution architecture
- Applies to: reusable VyrnForge application compositions, examples, framework recipes, generated documentation, and AI consumption

## Context

VyrnForge already defines component semantics, composition regions, accessibility obligations, framework mappings, tokens, and behavior contracts. Those primitives are necessary but not always sufficient for repeated application-level UI structures.

Common application experiences often combine several components into stable reusable compositions, for example:

- application shells;
- settings pages;
- filter + data-view layouts;
- CRUD list/detail surfaces;
- multi-step form flows;
- dashboard compositions;
- command/action surfaces;
- master-detail layouts;
- empty/loading/error state compositions.

If these compositions are documented independently for React, Angular, Vue, and Native HTML, they will drift. If they are copied into consuming applications as VyrnForge-owned one-off examples, AI and human developers must reconstruct the intended relationships every time.

At the same time, VyrnForge must not become an application generator that owns business routes, data models, permissions, backend APIs, application stores, or product workflows.

This ADR establishes a framework-neutral contract for reusable VyrnForge UI patterns and templates while keeping application business/runtime semantics outside the library.

## Decision

VyrnForge will distinguish **components**, **patterns**, and **application implementations**.

```text
canonical components and behaviors
        |
        v
reusable VyrnForge pattern contract
  intent / regions / component roles
  accessibility / responsive rules
  extension points / variants
        |
        +---------------------+
        |                     |
        v                     v
framework recipe         AI/documentation view
        |
        v
consuming application
  business data / routing / auth / workflow / state
```

A pattern is a reusable VyrnForge-owned UI composition whose value comes from the relationship between existing VyrnForge capabilities, not from application-specific business semantics.

A template is a more complete instantiation recipe of one or more patterns that can provide scaffold structure, example code, or generated starting points. Templates remain optional consumption aids; they do not become a second source of component API truth.

The exact future metadata filenames, package names, generator commands, and template distribution mechanism are intentionally not decided by this ADR.

## Pattern versus component

A new component should be preferred when the capability has its own reusable semantic state/behavior/API and should be consumed as one public UI unit.

A pattern should be preferred when the primary value is the coordinated composition of existing components and primitives.

Examples:

| Need | Preferred ownership |
| --- | --- |
| Toggle state and keyboard semantics | Component/behavior contract |
| Dialog focus trap and close reasons | Component/behavior contract |
| Settings page with navigation, sections, fields, actions | Pattern |
| Filter bar coordinated with a result area | Pattern |
| Business-specific customer onboarding sequence | Application, possibly using a generic step-form pattern |
| Domain-specific approval workflow rules | Application/runtime |

Patterns must not hide missing reusable component behavior. If several patterns duplicate the same interaction controller or semantic API, that is evidence to extract or extend a component/behavior instead.

## Pattern identity

A future machine-readable pattern record should be able to describe:

- stable pattern id;
- public/display name;
- concise purpose;
- `useWhen` guidance;
- `avoidWhen` guidance;
- maturity/status;
- related patterns;
- required and optional component capabilities;
- supported framework recipe status;
- ownership/review information.

Exact schema and status enums are deferred until implementation.

## Semantic regions

Patterns should describe **semantic regions**, not framework-specific JSX/templates as their canonical structure.

A region may identify roles such as:

- navigation;
- heading/title;
- primary content;
- filters;
- actions;
- supporting content;
- details;
- feedback/status;
- footer;
- side panel.

A region definition should be able to express as applicable:

- semantic role/purpose;
- required or optional status;
- allowed/recommended component roles;
- cardinality;
- ordering constraints;
- responsive movement/collapse behavior;
- labeling relationships;
- extension/custom-content allowance.

Framework recipes map these regions to children, slots, templates, content projection, render functions, or equivalent framework syntax using existing VyrnForge composition rules.

## Component references

Pattern metadata references canonical component ids or component capabilities rather than copying complete component props, events, forms, refs, or accessibility definitions.

For example, a filter pattern may require a form-control capability and an action capability, while a particular recipe may select `TextInput`, `Select`, and `Button`.

Component public API remains owned by canonical component contracts and documentation.

This prevents pattern metadata from becoming a stale second component catalog.

## Variants

Patterns may define controlled variants when repeated UI needs justify them, for example:

- compact vs spacious composition;
- side-navigation vs top-navigation shell;
- inline vs stacked filter controls;
- list-detail vs split-panel detail;
- single-column vs responsive multi-column form sections.

Pattern variants should express semantic/layout choices, not duplicate theme tokens or hard-code product branding.

Variants must remain finite and documented. Arbitrary application branching belongs in the consuming application.

## Responsive and density behavior

Patterns must use shared VyrnForge responsive, spacing, density, and token foundations where available.

A pattern may specify semantic responsive behavior such as:

- region stacks below a threshold;
- secondary actions move into an overflow surface;
- a side region becomes a drawer;
- columns collapse into one flow;
- filters become progressively disclosed.

Exact breakpoint values should come from canonical VyrnForge design foundations rather than being copied as unexplained pattern-local constants.

Patterns must remain usable across supported density modes unless an explicit limitation is documented.

## Accessibility

Patterns have accessibility obligations in addition to the obligations of their individual components.

Pattern-level requirements may include:

- heading hierarchy;
- landmark/region relationships;
- accessible labels for groups and sections;
- focus order across composed regions;
- error-summary relationships;
- action placement/identification;
- status and feedback announcement relationships;
- responsive reordering that preserves meaningful reading/focus order;
- avoiding duplicated accessible names or nested interactive structures.

Pattern accessibility requirements must be machine-readable or otherwise canonical enough to drive documentation, verification, and ADR-010 AI context when implementation begins.

A pattern must not rely on visual arrangement alone to communicate semantic relationships.

## State and application ownership

Patterns may describe UI coordination contracts but must remain application-store agnostic.

A pattern can say:

- a filter region produces filter-change intent;
- a result region displays loading/empty/error/data states;
- a detail region is selected by application state;
- a wizard exposes current-step and navigation intent;
- a submit action has pending/disabled states.

A pattern must not require Redux, Zustand, Pinia, NgRx, a router, a query client, an authentication framework, or a backend SDK.

The consuming application owns:

- business entities and data fetching;
- routing;
- authorization/permissions;
- persistence;
- domain validation rules;
- workflow execution;
- application state architecture.

## Extension points

Patterns should expose deliberate extension points rather than requiring forks.

Depending on the pattern, extension points may include:

- custom region content;
- additional actions;
- custom field/control collections;
- optional supporting panels;
- render/template callbacks in framework recipes;
- adapters for application data/state;
- pattern configuration values.

An extension point must not provide unrestricted access to private VyrnForge internals.

## Framework recipes

Patterns are framework-neutral at their canonical layer.

For Native HTML, React, Angular, Vue, and future admitted frameworks under ADR-012, recipes should be generated or maintained from the same semantic pattern definition wherever practical.

Framework recipes may differ syntactically while preserving:

- region meaning;
- component relationships;
- accessibility obligations;
- state/intent boundaries;
- extension points;
- responsive/density behavior.

A framework-specific recipe must not redefine the pattern's product semantics.

## Generated versus handwritten recipe policy

Deterministic generation is preferred when the framework mapping is mechanical.

Handwritten recipes are acceptable when the value is instructional or framework syntax cannot be generated clearly, but they must reference the canonical pattern record and be checked for stale component ids/API where practical.

Repeated independent handwritten descriptions of the same pattern semantics are not acceptable as the canonical model.

## AI consumption

ADR-010 applies to patterns and templates.

A bounded AI pattern slice should be able to provide, when available:

- purpose and use/avoid guidance;
- required component/capability dependencies;
- semantic regions and composition constraints;
- accessibility obligations;
- responsive/density behavior;
- framework-specific recipe/setup;
- extension points;
- state/application ownership boundaries;
- representative minimal example;
- common mistakes and alternatives.

AI context should expand referenced component details only when needed for the task rather than embedding every component contract in every pattern.

This allows a request such as "build a settings page in Angular" to load the settings-page pattern, Angular recipe rules, and only the component contracts actually used.

## Template contract

A template is an optional, more concrete scaffold based on one or more patterns.

A future template record may contain or reference:

- one or more canonical patterns;
- selected VyrnForge components;
- framework target;
- file/scaffold layout where applicable;
- example application-state interfaces;
- placeholder content/data clearly marked as application-owned;
- setup/import information;
- validation or build evidence.

Templates must not introduce private APIs or bypass canonical package entrypoints.

Templates must clearly distinguish placeholder application logic from VyrnForge library code.

## Template generation boundary

VyrnForge may provide generators or starter templates, but generated application code remains consumer-owned after generation unless a particular generated region is explicitly designated as VyrnForge-managed.

Generator design must avoid creating a lockstep requirement where applications must regenerate large business files to receive VyrnForge updates.

Prefer small composable scaffolds and clear upgrade boundaries over opaque full-application generators.

## Maturity and evidence

A pattern's maturity should be independent from the maturity of each component it references.

Before a pattern is promoted to a stable/first-class status, evidence should cover as applicable:

- every referenced component/capability exists at an acceptable maturity;
- framework recipes use public entrypoints;
- responsive behavior;
- density/theme compatibility;
- keyboard/focus order;
- pattern-level accessibility;
- representative packed-framework consumers;
- visual/regression evidence where the composition is visually significant;
- documentation and AI context.

A pattern cannot be considered production-ready merely because its individual components are stable.

## Dependency and package policy

Pattern metadata and recipes should normally remain lightweight and depend on public VyrnForge surfaces rather than introduce new runtime dependencies.

A reusable pattern that requires a large runtime engine may actually be an advanced module under ADR-011 and should be evaluated there instead of hiding the dependency inside a template.

This ADR does not create a patterns package or templates package. Distribution boundaries require a concrete implementation decision.

## Naming and terminology

Pattern names should describe reusable UI intent rather than a particular consuming application's business noun.

Prefer names such as:

- settings page;
- filterable results;
- list-detail;
- step form;
- application shell.

Avoid canonical VyrnForge pattern names tied to one customer's domain, product organization, internal route name, or business workflow.

## Admission criteria for a canonical pattern

A candidate pattern should become VyrnForge-owned only when:

1. the composition occurs repeatedly across realistic applications or examples;
2. existing components alone do not communicate the important composition contract;
3. the pattern can be described without application-specific business logic;
4. semantic regions and component relationships are clear;
5. accessibility requirements are defined;
6. responsive/density expectations are defined where relevant;
7. extension points avoid one-off forks;
8. framework recipes can preserve equivalent semantics;
9. component APIs are referenced rather than duplicated;
10. AI/documentation consumption provides reusable value;
11. maintenance cost is justified by repeated product value.

## Rejected approaches

### Framework-specific pattern libraries

Rejected because React, Angular, Vue, and Native HTML should not acquire separate composition semantics.

### Copy component APIs into every pattern

Rejected because it creates stale duplicate sources of truth.

### Treat complete applications as canonical patterns

Rejected because business routing, authorization, state, backend data, and workflow execution belong to consuming applications.

### Require an application state-management library

Rejected because VyrnForge remains store agnostic.

### Use templates to hide missing components

Rejected because reusable interaction semantics should be extracted into VyrnForge components/behaviors when appropriate.

### Generate opaque full applications as the primary DX

Rejected because it creates upgrade and ownership problems and increases AI/human context requirements.

## S10-S15 relationship

This ADR accepts the reusable-pattern architecture but does not add a pattern implementation program to the S10-S15 critical path.

The current priority remains completion of first-class framework distribution and release convergence. Initial pattern metadata/schema/generation should be scheduled as a post-S15 architecture/DX program unless active implementation evidence requires it earlier.

## Implementation follow-up

A future implementation program may define:

- a machine-readable pattern schema;
- canonical pattern records;
- framework recipe generation or validation;
- documentation rendering;
- ADR-010 AI context generation;
- pattern maturity/evidence verification;
- optional template/scaffold tooling.

That implementation must reuse current component ids, framework mappings, token foundations, and public package metadata rather than introduce a parallel component model.

## Relationship to existing architecture

This ADR extends rather than replaces:

- canonical component and event contracts;
- composition mapping contracts;
- state/application ownership rules;
- semantic token and CSS architecture;
- accessibility standards;
- ADR-010 AI Consumption Contract;
- ADR-011 Optional Advanced Module Architecture;
- ADR-012 Framework Extensibility Contract.

The result is one VyrnForge semantic system spanning components and repeated application compositions without taking ownership of consuming-application business logic.
