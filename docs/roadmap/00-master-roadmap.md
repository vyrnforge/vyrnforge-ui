# VyrnForge UI Master Roadmap

## Current direction

VyrnForge is a native-owned, dependency-minimal, general-purpose UI system with
enterprise-grade depth. The canonical product identity and long-term scope live
in [`../governance/01-project-source-of-truth.md`](../governance/01-project-source-of-truth.md).

S0 through S8 established the repository foundations, quality model,
multi-framework non-grid architecture, native renderer, cross-framework
verification, and prerelease release groups.

S9 completed the repository-and-delivery simplification program. Validation,
delivery, release, documentation, and contribution paths now use the simplified
repository model while preserving the established package architecture and trust
boundaries.

The active approved distribution program is **VyrnForge Multi-Framework
Distribution Architecture**. Its product support model treats React, native
HTML, Angular, and Vue as equally first-class supported web surfaces. Support
status is a consumer guarantee; it does not require four independent
implementations or the same renderer strategy for every framework.

The program continues to share tokens, contracts, behaviors, styling,
accessibility expectations, and component semantics across supported surfaces.
Framework-specific implementation should be generated or generic wherever
practical, with handwritten framework-specific code reserved for concrete,
evidence-backed technical exceptions.

The data-grid package remains a specialized React alpha on an independent
release track. Multi-framework data-grid work and other advanced optional
capabilities are outside the S10-S15 critical path unless separately
reprioritized. They remain valid long-term UI scope when supported by dedicated
architecture and evidence.

## Release groups

### Non-grid beta

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-components
@vyrnforge/ui-elements
```

### Deferred independent alpha

```text
@vyrnforge/ui-data-grid
```

The canonical exact versions, dist-tags, package membership, and internal
dependency alignment live in
[`../metadata/release-groups.json`](../metadata/release-groups.json).

Current package names and release-group membership describe implemented state.
Target framework packages are governed by accepted ADRs and must not be treated
as shipped until manifests, packages, consumer evidence, and release gates make
them current.

## Sprint plan

| Sprint | Name                                            | Goal                                                                                                                      | Gate / state                |
| ------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| S0     | Baseline and Change Control                     | Lock inventory, toolchain, governance, and ownership.                                                                     | G0 — passed                 |
| S1     | Quality Foundation                              | Enforce lint, tests, metadata, packages, consumers, and stable CI aggregation.                                            | G1 — passed                 |
| S2     | Interaction and Accessibility Evidence          | Prove critical keyboard, focus, overlay, form, navigation, feedback, and grid behavior.                                   | G2 — passed                 |
| S3     | Semantic Tokens and Component Consistency       | Establish semantic tokens and align shared components and grid styling.                                                   | G3 — passed                 |
| S4     | Multi-Framework Architecture                    | Approve support scope, package topology, component contracts, events, composition, styling, forms, and fixture ownership. | GMF1 — passed               |
| S5     | Framework-Neutral Behaviors                     | Extract reusable non-grid controllers while preserving React API and behavior.                                            | GMF2 — passed               |
| S6     | Native Custom Elements                          | Implement native non-grid elements with form, browser, accessibility, theme, and density parity.                          | GMF3 — passed               |
| S7     | Cross-Framework Verification and Docs           | Verify React, plain HTML, Angular, and Vue consumers and publish generated framework documentation.                       | GMF4 — passed               |
| S8     | Non-Grid Beta Release                           | Harden packages, release groups, artifacts, compatibility, security, and prerelease delivery.                             | Complete                    |
| S9     | Repository and Delivery Simplification          | Simplify validation, CI, Pages, release, documentation, and contributor experience.                                       | Complete                    |
| S10    | Canonical Component & Distribution Architecture | Establish the target architecture, complete canonical contract model, package strategy, and migration rules.              | See active program evidence |
| S11    | Framework Generation Foundation                 | Prove deterministic generation and shared vertical slices across all four supported surfaces.                             | See active program evidence |
| S12    | First-Class Angular Distribution                | Deliver low-friction Angular distribution with generated integration and framework-native forms/DX.                       | G12 program track           |
| S13    | First-Class Vue Distribution                    | Deliver low-friction Vue distribution with generated integration and framework-native model/slot/ref DX.                  | G13 program track           |
| S14    | React Canonical-Renderer Convergence            | Converge eligible React components toward the canonical implementation while preserving public ergonomics and parity.     | G14 program track           |
| S15    | Multi-Framework Packaging & Release             | Make packaging, release verification, documentation, and four-surface distribution metadata-driven and release-ready.     | G15 program track           |

The execution workbook and merged repository evidence own live task/gate status.
This roadmap intentionally avoids duplicating fast-changing percentages and task
completion state that can drift from implementation.

## S4 architecture tasks

- MF-4001: multi-framework web support ADR
- MF-4002: package topology and dependency rules
- MF-4003: canonical component-contract schema
- MF-4004: canonical event vocabulary
- MF-4005: composition and slot vocabulary
- MF-4006: Light DOM and styling policy
- MF-4007: form-associated element contract
- MF-4008: React, native HTML, Angular, and Vue fixture foundation
- MF-4009: create the `@vyrnforge/ui-behaviors` package foundation
- MF-4010: create the `@vyrnforge/ui-elements` package foundation
- MF-4011: add complete framework-parity catalog metadata
- MF-4012: complete GMF1 architecture gate evidence

S4 established the package and contract foundations for the multi-framework
program.

## S5 behavior tasks

### Foundation batch — implemented

- MF-5001: controllable state primitives
- MF-5002: collection and active-item primitives
- MF-5003: single, multiple, toggle, and range selection models
- MF-5004: canonical controller event model

### Completed behavior work

- MF-5005: simple action and toggle behaviors — implemented
- MF-5006: simple form-control behaviors — implemented
- MF-5007: Tabs and composite navigation behavior — implemented
- MF-5008: Autocomplete behavior — implemented
- MF-5009: MultiSelect behavior — implemented
- MF-5010: Transfer List behavior — implemented
- MF-5011: Menu and SideNav navigation behavior — implemented
- MF-5012: overlay lifecycle and DOM-adapter boundary — implemented
- MF-5013: Dialog, Drawer, Popover, and Tooltip controllers — implemented
- MF-5014: Toast and ConfirmDialog behavior — implemented
- MF-5015: complete React behavior adoption and compatibility audit — implemented
- MF-5016: shared behavior parity gate — implemented

The behavior foundation is complete. `@vyrnforge/ui-behaviors` remains
framework- and DOM-neutral while renderers own framework lifecycle and DOM
execution.

## S6 native element tasks

### Foundation batch — implemented

- EL-6001: native registration and lifecycle foundation
- EL-6002: base element and property reflection
- EL-6003: typed event dispatch utilities — implemented
- EL-6004: form-associated element base — implemented
- EL-6005 through EL-6017: public non-grid native component ports — implemented
- EL-6018: native non-grid parity gate — implemented

S6 closed with the complete native non-grid renderer and its deterministic
public Custom Element catalog.

## S7 and S8 closure

S7 completed the cross-framework evidence chain for React, native HTML, Angular,
and Vue consumers. Retained evidence remains historical proof and does not
replace current manifests or active program state.

S8 established the synchronized non-grid beta release group, independent
data-grid alpha track, artifact verification, compatibility/security contracts,
and controlled prerelease publication model. Current release-group metadata is
retained in
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## S9 repository and delivery simplification

| Task    | Goal                                                                         | Status |
| ------- | ---------------------------------------------------------------------------- | ------ |
| RS-9001 | Simplify validation ownership.                                               | Done   |
| RS-9002 | Simplify the root command graph.                                             | Done   |
| RS-9003 | Simplify CI orchestration and the merge gate.                                | Done   |
| RS-9004 | Build Pages once in CI and deploy the verified artifact.                     | Done   |
| RS-9005 | Simplify prerelease publication into one controlled progression.             | Done   |
| RS-9006 | Restructure documentation around reader intent and current sources of truth. | Done   |
| RS-9007 | Simplify contributor-facing setup, validation, and pull-request guidance.    | Done   |

S9 is complete. Normal contributors use one setup and validation path, CI
derives technical scope from changed paths, and specialist intake remains only
where infrastructure or release operations require additional evidence.

## S10-S15 multi-framework distribution program

S10-S15 establishes the first-class distribution architecture without pretending
that target surfaces already exist before their gates pass. The approved support
target is React, native HTML, Angular, and Vue.

Execution is dependency-driven rather than a fully sequential sprint queue.
Independent React, Angular, Vue, release, and documentation work should proceed
in parallel once their real prerequisite gates are satisfied.

Framework convergence is subordinate to first-class correctness. Public API,
typing, accessibility, SSR behavior, composition, refs, forms, and performance
must not be weakened merely to remove implementation duplication. Use the
framework exception policy when shared/generic integration cannot preserve an
approved framework contract.

## Deferred data-grid track

The broad grid decomposition and multi-framework renderer work remains a
separate post-beta track. It should be replanned only when explicitly prioritized
by current product requirements, advanced-module architecture, and measured
technical need.

Deferred work includes:

- internal grid-controller decomposition;
- query and persistence refactoring;
- column, selection, grouping, keyboard, and visual-region decomposition;
- scale benchmarks and virtualization decisions;
- framework-neutral grid core and additional renderers.

Grid defects, security corrections, accessibility fixes, and compatibility
maintenance remain allowed. Feature expansion is not part of the S10-S15
multi-framework distribution critical path.

## Post-S15 strategic horizon

The long-term roadmap extends beyond four-framework distribution. These are
planning horizons, not commitments that the capabilities already exist or should
interrupt S10-S15.

### First-class product maturity

- mature component/package stability through the canonical evidence model;
- strengthen general-purpose visual quality and onboarding;
- preserve and deepen enterprise themes, density, data-management, and keyboard
  ergonomics;
- establish long-term compatibility, migration, performance, browser, and
  support guarantees;
- gather real application evidence across general-purpose and enterprise usage.

### AI-native developer experience

- define a consumer-facing AI contract derived from canonical metadata;
- generate compact task-scoped component/framework context;
- add reusable pattern/composition metadata;
- measure context/token efficiency and AI-generated implementation correctness;
- verify AI guidance cannot drift from canonical public contracts.

### Optional advanced-module architecture

Before adding multiple heavyweight capabilities, define shared rules for:

- dependency isolation and optional external engines;
- package ownership and framework facade generation;
- token/CSS ownership;
- tree shaking and size/performance budgets;
- public entrypoints and packed consumers;
- independent maturity/release lines where justified;
- accessibility and AI metadata requirements.

### Candidate advanced capability programs

Prioritize from reusable product need rather than component-count goals. Valid
future programs include:

- TreeView and TreeGrid foundations;
- data-grid evolution;
- charting and visualization UI;
- advanced form composition and reusable form patterns;
- application templates/pattern contracts;
- workflow and diagram editor UI;
- rich editors and advanced interaction surfaces;
- later spatial/3D UI exploration with external rendering-engine boundaries.

VyrnForge may own sophisticated reusable UI without owning the corresponding
business, BI, workflow execution, backend, CMS, routing, spreadsheet, or 3D
rendering engines.

## Planning rules

- The active S10-S15 execution workbook and merged GitHub evidence describe
  program execution; reconcile them when tracker state lags repository reality.
- Accepted architecture overrides historical sprint notes.
- Current package manifests and release metadata override stale planning
  examples about implemented state, but do not override explicitly approved
  future target architecture.
- `docs/metadata/components.json` owns structured component status and maturity.
- Historical task identifiers remain only where they provide useful planning or
  evidence context; normal usage guidance should not require them.
- New reusable UI should extend existing VyrnForge foundations before creating a
  separate implementation.
- Advanced capabilities should be optional and must not impose unnecessary
  runtime, dependency, CSS, or setup cost on consumers that do not use them.
- Application-specific business logic and runtime engines remain in consuming
  applications or explicit external integrations.
- Product identity and long-term scope are canonical in
  `docs/governance/01-project-source-of-truth.md`.
- The detailed scope comparison and transition rationale are recorded in
  `docs/roadmap/04-vision-mission-scope-alignment-review.md`.
