# ADR-010: AI Consumption Contract

- Status: Accepted architecture standard
- Origin: Vision/mission standardization after the S10-S15 distribution architecture
- Applies to: public VyrnForge UI contracts, metadata, documentation, generators, and AI-facing derived context

## Context

VyrnForge treats human developers and AI software-development systems as first-class consumers of the same UI system. Existing repository metadata already contains useful AI-oriented information such as component purpose, `useWhen`, `avoidWhen`, related components, examples, accessibility notes, and `aiUsageNotes`. Canonical component contracts separately own structured properties, events, composition, forms, models, refs, methods, accessibility obligations, and framework mappings.

The AI experience must not become a second hand-maintained component catalog or a parallel source of truth. AI consumers also should not need to ingest the entire repository, all documentation, or framework implementation source to perform a bounded UI task.

This ADR establishes the architecture for deriving compact, trustworthy, task-scoped AI context from existing canonical VyrnForge sources.

## Decision

VyrnForge will provide AI-consumable context as a **derived view of canonical contracts and metadata**, not as an independent semantic source.

The canonical ownership chain is:

```text
canonical project policy and architecture
        |
        +-- component contracts
        +-- component/catalog metadata
        +-- package and release metadata
        +-- design-token metadata
        +-- accessibility and evidence metadata
        +-- canonical public documentation
                    |
                    v
          deterministic AI derivation
                    |
          +---------+---------+
          |                   |
    framework slice       task/pattern slice
          |                   |
          +---------+---------+
                    |
             bounded AI context
```

An AI-facing artifact may summarize, select, normalize, or reformat canonical information. It must not invent public API, support claims, defaults, accessibility behavior, framework mappings, package availability, or product semantics that are absent from canonical sources.

## AI consumer classes

VyrnForge distinguishes two AI audiences.

### Repository-maintenance agents

Repository agents maintain VyrnForge itself. `AGENTS.md` and `.ai/AI_CONTEXT.md` provide repository workflow, validation, architecture-navigation, and maintenance guidance.

These files remain maintenance context. They do not become the public component/API source of truth.

### Library-consumer agents

Consumer agents generate, analyze, migrate, or maintain application code that uses VyrnForge.

Their normal context should be compact and task-scoped. A consumer agent should not need repository-maintenance instructions or the full VyrnForge source tree for ordinary component usage.

## Required AI context model

Where the underlying canonical source contains the information, a component or pattern AI slice should be able to expose the following concepts.

### Identity and intent

- canonical component or pattern id;
- public name;
- concise purpose;
- `useWhen` guidance;
- `avoidWhen` guidance;
- related or alternative components;
- maturity and availability status.

### Distribution and framework availability

- current public package or native entrypoint;
- supported framework surface;
- implemented, target, migration, or exception status;
- setup or registration requirements;
- version/support information from canonical release/package metadata where relevant.

Target-state metadata must never be rendered as a current shipping claim.

### Public API

- properties/inputs/props and types;
- requiredness and defaults;
- attributes and reflection where applicable;
- canonical events, framework callback/output/emit names, and stable reasons;
- controlled/uncontrolled or model semantics;
- form semantics;
- refs and public methods.

### Composition

- semantic composition regions;
- framework-specific children/slot/template/content-projection mapping;
- required regions and cardinality;
- incompatible or constrained composition where canonical metadata records it.

### Accessibility

- accessible-name requirements;
- keyboard/focus obligations;
- disabled/invalid semantics;
- overlay/focus-restoration obligations;
- live-region or other semantic requirements where applicable.

Accessibility guidance must derive from the same obligations used by human documentation and testing.

### Styling and tokens

- required package CSS/setup;
- relevant shared token roles;
- supported customization mechanisms;
- explicit guidance against undocumented internal selectors or hard-coded values where applicable.

### Examples and common mistakes

- one or more minimal idiomatic examples when canonical examples exist;
- common misuse or avoid rules;
- framework-specific syntax generated from canonical mappings rather than independently maintained API descriptions.

Examples are explanatory output. They do not override the contract.

## Bounded-context rule

AI context must be selectable by task and framework.

A request involving one React form control should not require the complete catalog, Angular/Vue mappings, all design tokens, the data-grid implementation, or repository contribution guidance.

A bounded context may include:

1. global VyrnForge usage rules required for correctness;
2. the selected framework's setup rules;
3. the requested components or pattern;
4. directly related components needed for composition or alternatives;
5. only the relevant token/accessibility information;
6. active limitations or exceptions that materially affect the task.

Context expansion should be explicit and dependency-driven rather than loading the entire library by default.

## Framework slices

Framework-specific AI views must be generated from canonical mappings.

For the currently approved surfaces this means Native HTML, React, Angular, and Vue. The AI architecture must not assume those four identifiers are the permanent conceptual limit; a future approved framework should be able to supply the same class of derived context through the framework integration contract.

Framework-specific syntax may differ while component semantics remain canonical.

## Pattern and template context

Future reusable VyrnForge patterns/templates should participate in the same AI system.

A pattern context may reference:

- intent and use/avoid guidance;
- component dependencies;
- semantic regions;
- responsive/density behavior;
- accessibility obligations;
- composition constraints;
- framework-specific generated recipes.

Pattern metadata should reference component contracts rather than copying their complete public APIs.

## Source precedence

When sources disagree, AI derivation must follow canonical ownership rather than guessing.

The precedence is responsibility-based:

- project identity/scope: project source of truth and accepted ADRs;
- public component semantics: canonical component contracts and API documentation;
- component maturity/catalog ownership: `components.json`;
- package availability/version/release membership: package manifests and release metadata;
- design roles: canonical design-token metadata and architecture;
- implementation evidence: current tests/evidence metadata;
- AI usage hints: canonical AI usage metadata derived or maintained under metadata governance.

An AI artifact must not convert a planning target into a current implementation fact.

## Unknown-data rule

Missing information is not permission to infer a public contract.

If a required AI field cannot be derived from canonical sources, generation should expose the omission or fail according to the field's requiredness. It must not inspect framework implementation source to manufacture undocumented public semantics once the component is contract-complete.

This follows the existing source-reading rule used by framework generation.

## Determinism and staleness

AI-facing generated artifacts must be reproducible from canonical inputs.

Once implementation begins, the standard requires:

- deterministic generation;
- stale-output verification;
- schema validation for machine-readable outputs;
- stable identifiers for components, frameworks, patterns, and rules;
- no hand-edited generated output;
- CI failure when committed generated context materially diverges from canonical inputs.

The exact generated filenames, package names, commands, or transport format are intentionally not decided by this ADR.

## Context-size and token-efficiency quality gate

Low-context AI use is a product requirement rather than an informal optimization.

AI context implementation must measure at least:

- size of a global minimum context;
- size of representative single-component framework slices;
- size of representative composition/pattern slices;
- duplicate information introduced by derivation;
- whether unrelated framework/catalog data is unnecessarily included.

Future gates should establish budgets from measured representative tasks rather than inventing arbitrary limits in this ADR.

A change that substantially increases required context for common tasks needs evidence that the additional information materially improves correctness.

## Correctness evaluation

Token size alone is insufficient. Future AI-context implementation should verify representative outcomes such as:

- correct package/import/setup selection;
- no nonexistent props/events/components;
- correct controlled/model/form semantics;
- correct composition;
- accessibility-required inputs are not omitted;
- no use of private entrypoints;
- no forbidden dependency recommendations;
- correct distinction between current and target framework support.

Evaluation may use deterministic fixtures and generated-code validation. It must not require a specific external model vendor as a VyrnForge core dependency.

## Metadata ownership

AI-specific metadata may contain usage guidance that is genuinely AI-oriented, but it must obey normal metadata governance.

Good AI-owned fields include concise selection guidance, common mistakes, context priority, or task-oriented hints that are not already structured elsewhere.

AI metadata must not duplicate canonical property/event/form/ref/accessibility definitions that can be derived from component contracts.

`docs/metadata/ai-usage-rules.json` remains a governed source for cross-cutting AI usage rules, but its rules must stay aligned with current project support and architecture claims.

## Application boundary

AI context may explain how to connect VyrnForge to application state, data, routing, permissions, or backends through public extension points. It must not move those responsibilities into VyrnForge.

Generated examples must not imply that VyrnForge requires a particular application store, query library, router, backend, authentication system, or business workflow engine.

## Security and privacy

AI-facing artifacts are public-library context and must not include secrets, private credentials, unpublished customer data, or repository-local sensitive values.

A context generator should operate on canonical public/project metadata rather than scrape arbitrary local files.

## Implementation phases

This ADR accepts the architecture but does not claim the complete AI consumption system is implemented.

Recommended implementation phases are:

1. define the derived AI context schema and source mapping;
2. implement deterministic context generation from canonical metadata;
3. implement framework- and task-scoped selection;
4. add pattern/template integration when that contract exists;
5. add stale-output, schema, context-size, and representative correctness verification;
6. publish consumer guidance for using the generated context.

Implementation should reuse the existing contract loader/generation foundation where practical rather than create an unrelated AI pipeline.

## Rejected approaches

### Hand-maintained AI component catalog

Rejected because it duplicates canonical component semantics and will drift.

### Full repository dump as normal consumer context

Rejected because it wastes context, mixes maintenance concerns with public usage, and makes correctness harder to measure.

### Model-specific core runtime dependency

Rejected because VyrnForge should provide portable machine-readable context, not require a particular AI vendor or SDK.

### Inferring missing API from framework implementation source

Rejected because public semantics belong in canonical contracts and metadata.

### Treating AI hints as stronger than public contracts

Rejected because AI output is a derived consumption surface, not an authority above VyrnForge's public API.

## Relationship to existing architecture

This ADR extends rather than replaces:

- `09-component-contracts-and-events.md` for canonical public semantics;
- component/catalog metadata for purpose, maturity, examples, and usage guidance;
- package/release metadata for current availability;
- semantic token architecture for styling;
- accessibility standards for outcome obligations;
- `AGENTS.md` and `.ai/AI_CONTEXT.md` for repository-maintenance agents.

The result is one UI contract system serving human documentation, framework generation, verification, tooling, and AI consumption without creating parallel product semantics.
