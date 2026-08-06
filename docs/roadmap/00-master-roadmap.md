# VyrnForge UI Master Roadmap

## Current direction

S0 through S7 established controlled change, quality evidence, interaction
hardening, semantic token consistency, multi-framework architecture,
framework-neutral behavior, native Custom Elements, and verified React, plain
HTML, Angular, and Vue consumption.

S7 is complete at 84/84 story points and GMF4 is evidence-complete. S8 is the
active release program and prioritizes the coordinated multi-framework
**non-grid beta**.

The data-grid package remains available as a React alpha but does not block the
beta release group.

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

## Sprint plan

| Sprint | Name                                      | Goal                                                                                                                      | Gate          |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| S0     | Baseline and Change Control               | Lock inventory, toolchain, governance, and ownership.                                                                     | G0 — passed   |
| S1     | Quality Foundation                        | Enforce lint, tests, metadata, packages, consumers, and stable CI aggregation.                                            | G1 — passed   |
| S2     | Interaction and Accessibility Evidence    | Prove critical keyboard, focus, overlay, form, navigation, feedback, and grid behavior.                                   | G2 — passed   |
| S3     | Semantic Tokens and Component Consistency | Establish semantic tokens and align shared components and grid styling.                                                   | G3 — passed   |
| S4     | Multi-Framework Architecture              | Approve support scope, package topology, component contracts, events, composition, styling, forms, and fixture ownership. | GMF1 — passed |
| S5     | Framework-Neutral Behaviors               | Extract reusable non-grid controllers while preserving React API and behavior.                                            | GMF2 — passed |
| S6     | Native Custom Elements                    | Implement native non-grid elements with form, browser, accessibility, theme, and density parity.                          | GMF3 — passed |
| S7     | Cross-Framework Verification and Docs     | Verify React, plain HTML, Angular, and Vue consumers and publish generated framework documentation.                       | GMF4 — passed |
| S8     | Non-Grid Beta Release                     | Harden packages, canary in applications, publish beta artifacts, and complete exit review.                                | GBETA — active |

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

S4 establishes real package foundations but does not port public components or create a framework support claim.

## S5 behavior tasks

### Foundation batch — implemented

- MF-5001: controllable state primitives
- MF-5002: collection and active-item primitives
- MF-5003: single, multiple, toggle, and range selection models
- MF-5004: canonical controller event model

The foundation batch is framework- and DOM-neutral. It does not migrate React
components or complete GMF2.

### Remaining GMF2 work

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
- MF-5015: complete React behavior adoption and compatibility audit - implemented
- MF-5016: shared behavior parity gate - implemented

## S6 native element tasks

### Foundation batch - implemented

- EL-6001: native registration and lifecycle foundation
- EL-6002: base element and property reflection

The first S6 batch establishes deterministic registration, reusable
per-element registration functions, observed-attribute declarations,
pre-definition property upgrade, primitive reflection, and microtask-batched
updates. It does not yet register public component tags.

### GMF3 work - implemented

- EL-6003: typed event dispatch utilities — implemented
- EL-6004: form-associated element base — implemented
- EL-6005 through EL-6017: public non-grid native component ports — implemented
- EL-6018: native non-grid parity gate — implemented

S6 closes with 58 registered native tags and current direct, mapping,
composition, or service strategies for all 67 public non-grid React records.

## S7 cross-framework verification — complete

- GMF4 is evidence-complete.
- S7 finished at 84/84 story points.
- React and native HTML are first-class renderers.
- Angular and Vue packed consumers are verified against `@vyrnforge/ui-elements`.
- Cross-framework browser, accessibility, SSR, bundler, generated-reference,
  and migration-guide evidence is complete.

## S8 non-grid beta release — active

Completed:

- BT-8001: freeze the non-grid beta scope.
- BT-8002: set release groups and coordinated versions.
- BT-8003: verify beta package artifacts.
- BT-8004: enforce package and CSS size budgets.
- BT-8005: verify the supported compatibility release matrix.
- BT-8006: enforce security and workflow hardening.
- BT-8007: verify trusted-publishing provenance and advance the coordinated
  non-grid candidate to `0.2.0-beta.2`.
- Deferred Windows/NVDA review completed; the temporary beta waiver was retired.
- Fresh registry consumer fixture correction completed.

Current release candidate:

- Release group: `non-grid-beta`
- Version: `0.2.0-beta.2`
- Dist-tag: `beta`
- Packages: `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`,
  `@vyrnforge/ui-components`, and `@vyrnforge/ui-elements`

Next action:

- Dispatch the controlled npm release workflow from current `main` in `publish`
  mode after reviewing the successful verification run and approving the
  protected `npm-release` environment.
- Verify registry propagation, exact internal dependency versions, beta
  dist-tags, fresh consumer installation, signatures, and provenance before
  creating the annotated tag and GitHub prerelease.

## Deferred data-grid track

The previously planned grid decomposition and scale work moves to a separate
post-beta track. Replanning begins only after GBETA unless a production defect
requires a targeted fix.

Deferred work includes:

- internal grid-controller decomposition;
- query and persistence refactoring;
- column, selection, grouping, keyboard, and visual-region decomposition;
- scale benchmarks and virtualization decisions;
- framework-neutral grid core and additional renderers.

Grid defects, security corrections, and compatibility maintenance remain
allowed. Feature expansion is not on the non-grid beta critical path.
