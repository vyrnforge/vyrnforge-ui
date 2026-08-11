# VyrnForge UI Master Roadmap

## Current direction

S0 through S8 established the repository foundations, quality model,
multi-framework non-grid architecture, native renderer, cross-framework
verification, and prerelease release groups.

S9 completed the repository-and-delivery simplification program. Validation,
delivery, release, documentation, and contribution paths now use the simplified
repository model while preserving the established package architecture and trust
boundaries.

The next approved program is **VyrnForge Multi-Framework Distribution
Architecture**. Its product support model treats React, native HTML, Angular,
and Vue as equally first-class supported web surfaces. Support status is a
consumer guarantee; it does not require four independent implementations or the
same renderer strategy for every framework. The implementation model, package
strategy, generation rules, and migration path are S10 architecture decisions.

The program continues to share tokens, contracts, behaviors, styling,
accessibility expectations, and component semantics across supported surfaces.
Framework-specific implementation should be generated or generic wherever
practical, with handwritten framework-specific code reserved for concrete
technical exceptions.

The data-grid package remains a specialized React alpha on an independent
release track. Multi-framework data-grid work is outside the S10-S15 program
unless separately reprioritized.

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

Current package names and release-group membership describe the implemented
state. Public package topology for the new first-class framework surfaces is not
predetermined and must not be inferred from this roadmap before the S10 package
strategy decision is complete.

## Sprint plan

| Sprint | Name                                           | Goal                                                                                                                      | Gate / state  |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| S0     | Baseline and Change Control                    | Lock inventory, toolchain, governance, and ownership.                                                                     | G0 — passed   |
| S1     | Quality Foundation                             | Enforce lint, tests, metadata, packages, consumers, and stable CI aggregation.                                            | G1 — passed   |
| S2     | Interaction and Accessibility Evidence         | Prove critical keyboard, focus, overlay, form, navigation, feedback, and grid behavior.                                   | G2 — passed   |
| S3     | Semantic Tokens and Component Consistency      | Establish semantic tokens and align shared components and grid styling.                                                   | G3 — passed   |
| S4     | Multi-Framework Architecture                   | Approve support scope, package topology, component contracts, events, composition, styling, forms, and fixture ownership. | GMF1 — passed |
| S5     | Framework-Neutral Behaviors                    | Extract reusable non-grid controllers while preserving React API and behavior.                                            | GMF2 — passed |
| S6     | Native Custom Elements                         | Implement native non-grid elements with form, browser, accessibility, theme, and density parity.                          | GMF3 — passed |
| S7     | Cross-Framework Verification and Docs          | Verify React, plain HTML, Angular, and Vue consumers and publish generated framework documentation.                       | GMF4 — passed |
| S8     | Non-Grid Beta Release                          | Harden packages, release groups, artifacts, compatibility, security, and prerelease delivery.                             | Complete      |
| S9     | Repository and Delivery Simplification         | Simplify validation, CI, Pages, release, documentation, and contributor experience.                                       | Complete      |
| S10    | Canonical Component & Distribution Architecture | Establish the target architecture, complete canonical contract model, package strategy, and migration rules.              | G10 — active  |
| S11    | Framework Generation Foundation                | Prove deterministic generation and shared vertical slices across all four supported surfaces.                             | G11 — planned |
| S12    | First-Class Angular Distribution               | Deliver low-friction Angular distribution with generated integration and framework-native forms/DX.                       | G12 — planned |
| S13    | First-Class Vue Distribution                   | Deliver low-friction Vue distribution with generated integration and framework-native model/slot/ref DX.                  | G13 — planned |
| S14    | React Canonical-Renderer Convergence           | Converge eligible React components toward the canonical implementation while preserving public ergonomics and parity.     | G14 — planned |
| S15    | Multi-Framework Packaging & Release            | Make packaging, release verification, documentation, and four-surface distribution metadata-driven and release-ready.     | G15 — planned |

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
and Vue consumers. Canonical closure evidence is retained in
[`../metadata/gmf4-closure.json`](../metadata/gmf4-closure.json).

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

S10-S15 changes the target distribution architecture without pretending that
all target surfaces already exist in the current implementation. The approved
support target is four first-class web surfaces: React, native HTML, Angular,
and Vue. The exact public package names and canonical implementation mechanics
remain unresolved until their S10 architecture decisions close.

Execution is dependency-driven rather than a fully sequential sprint queue.
MFD-1001 establishes this support model. MFD-1002 and MFD-1003 are the first
parallel architecture tasks after it; no framework package implementation begins
before the required architecture and generation gates.

## Deferred data-grid track

The previously planned broad grid decomposition and multi-framework renderer
work remains a separate post-beta track. It should be replanned only when
explicitly prioritized by current product requirements or measured technical
need.

Deferred work includes:

- internal grid-controller decomposition;
- query and persistence refactoring;
- column, selection, grouping, keyboard, and visual-region decomposition;
- scale benchmarks and virtualization decisions;
- framework-neutral grid core and additional renderers.

Grid defects, security corrections, accessibility fixes, and compatibility
maintenance remain allowed. Feature expansion is not part of the S10-S15
multi-framework distribution critical path.

## Planning rules

- The approved S10-S15 execution workbook is the current program execution plan;
  repository planning docs should reflect it without pre-deciding open S10
  architecture choices.
- Accepted architecture overrides historical sprint notes.
- Current package manifests and release metadata override stale planning
  examples about the implemented state, but they do not override an explicitly
  approved future target architecture.
- `docs/metadata/components.json` owns structured component status and maturity.
- Historical task identifiers remain here and in evidence because this roadmap
  is the planning/history source; normal usage guidance should not require them.
- New reusable UI should extend existing VyrnForge foundations before creating
  a separate implementation.
- Application-specific business logic remains in consuming applications.
