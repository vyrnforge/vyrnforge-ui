---
title: VyrnForge UI Change Manifest and Dependency Policy
status: Stable
owner: Architecture
last_reviewed: 2026-07-20
canonical: true
---

# Change Manifest and Dependency Policy

## Purpose

This policy makes controlled changes traceable before they are merged. A
change manifest records the task, scope, dependencies, compatibility and
quality impact, acceptance evidence, and any approved exception. It applies to
code, documentation, tests, governance, release preparation, and repository
maintenance.

The manifest is review evidence; it does not replace GitHub branch protection,
CI, release approval, or the canonical rules linked below.

## Scope and non-goals

Every pull request for a controlled task, or a tightly coherent group of
controlled tasks, must contain a completed manifest using the
[change-manifest template](../templates/change-manifest-template.md) or the
[focused pull-request template](../../.github/PULL_REQUEST_TEMPLATE/change-manifest.md).

This policy does not change package boundaries, component maturity, metadata,
release automation, CI behavior, or named reviewer configuration. Ownership,
required review, escalation, and public API decisions remain in the
[Ownership and Review Model](ownership-and-review-model.md). Maturity evidence
and promotion rules remain in the
[Component Maturity Model](component-maturity-model.md).

## Required manifest information

### 1. Task identity

Record all of the following:

- task ID;
- sprint;
- quality gate targeted or affected;
- workstream; and
- accountable owner role.

Use the workstream roles from the Ownership and Review Model. The manifest may
name an implementation author, but that does not replace the accountable
owner.

### 2. Scope

State:

- affected packages, including `none` for governance-only work;
- affected public components, contracts, or `none`;
- files or areas expected to change; and
- explicit out-of-scope items.

The scope must be concrete enough for a reviewer to identify unrelated files.
Expanding it during implementation requires updating the manifest and its
impact assessment before review.

### 3. Dependency information

List predecessor task IDs, required merged branches, and required documents or
decisions. Mark each as `complete`, `waived`, or `not applicable`; a link or
reference must support `complete` and `waived`.

Finish-to-start is the default: a successor may be drafted, but its
implementation must not start until every listed predecessor is complete and
its required branch or document is available in the declared integration
target. A task branch is not merged directly into `main`; integrate it through
the repository's reviewed merge path.

For a cross-workstream dependency, record the upstream and downstream task,
the integration target, the accountable owner for each workstream, and the
required review partners. The owners agree the hand-off evidence and ordering;
Architecture resolves disagreement or a package-boundary/public-contract
conflict.

An exception to finish-to-start requires a recorded waiver. The waiver must
state the reason, risk, approver, expiry or follow-up task, and supporting
evidence. A verbal agreement, an unlinked chat message, or an omitted field is
not a waiver. See [Exceptions and waivers](#exceptions-and-waivers).

### 4. Change classification

Select every applicable classification:

- new capability;
- refactor;
- verification or refinement;
- documentation;
- testing;
- governance; and
- release.

Classification describes the intended work; it does not lower the required
compatibility, review, or evidence bar.

### 5. Compatibility impact

For each item, state `none`, `additive`, `breaking`, or `not applicable`, with
a brief explanation and migration reference where required:

| Surface | Required assessment |
| --- | --- |
| Public API | Package-root exports, documented props, types, and adapter contracts. |
| CSS class or variable | Documented classes and `--vf-*` / `--udg-*` variables; follow [ADR-003](../architecture/adr-003-css-prefix-policy.md). |
| Package export | `package.json` exports, CSS entry points, and import paths. |
| Runtime dependency | Added, removed, or changed production dependency and package-boundary effect. |
| Peer dependency | React, ReactDOM, or other peer range and consumer-installation impact. |
| Browser/runtime | Supported browser, Node, React, or runtime-assumption effect. |
| Migration | Required consumer action, compatibility period, and migration-document link. |

Public contracts are defined by [Public vs Internal API](../api/public-vs-internal-api.md).
Documented CSS variables are public compatibility surfaces; a prefix alone does
not make an undocumented class public.

### 6. Quality impact

State whether each evidence type is required and why it is not applicable when
omitted:

- unit or pure-logic tests;
- DOM interaction tests;
- browser tests;
- accessibility impact;
- keyboard-contract impact;
- theme and density impact;
- performance impact; and
- documentation impact.

Use the Component Maturity Model for the required evidence for a maturity
state; it remains the source of truth for promotion, demotion, and release
expectations. Use the Ownership and Review Model for accessibility and quality
review triggers. A manifest records the applicable evidence for this change; it
does not reclassify a component or promote its status.

### 7. Acceptance evidence

Before acceptance, link or record:

- commands executed and their result;
- test reports;
- screenshots or browser traces when relevant;
- API diff when a public contract changed;
- package verification;
- consumer-fixture proof when required; and
- known limitations, deferred work, or failed checks.

Evidence may be `not applicable` only with a short reason. Evidence links must
be available to the reviewers entitled to evaluate the change.

## Pull-request rules

Every controlled pull request must follow these rules:

- contains one controlled task or one coherent, explicitly listed task group;
- does not include opportunistic refactoring or unrelated formatting changes;
- does not change a public API without documentation and the required review;
- does not bypass a predecessor task without an approved waiver;
- does not promote maturity status without the evidence required by the
  Component Maturity Model;
- does not merge a task branch directly into `main`; and
- treats S0–S8 work as improvement or controlled hardening until an approved
  release gate says otherwise.

The manifest must also identify the selected PR template and required
reviewers under the Ownership and Review Model. A change that spans tasks is
coherent only when it has one accountable owner, one review path, and one
combined acceptance result.

## Exceptions and waivers

Waivers are narrow, time-bounded exceptions to a stated requirement. The
manifest must contain all of the following before the exception is used:

| Field | Requirement |
| --- | --- |
| Reason | Why normal policy cannot be followed now. |
| Risk | Compatibility, quality, delivery, or ownership risk and mitigation. |
| Approver | Role and recorded approval reference; use the accountable owner and any review partner required by the affected rule. Architecture approves public-contract, maturity, or boundary exceptions. |
| Expiry or follow-up task | A date, merge condition, or task ID that closes the exception. |
| Evidence | Links to the decision, tests, analysis, or tracking record. |

No silent waivers are permitted. An expired waiver blocks continued work or
release until it is renewed with fresh evidence or the follow-up task resolves
it.

## Change-manifest lifecycle

| State | Meaning and minimum record |
| --- | --- |
| Draft | Identity, proposed scope, preliminary dependencies, and owner are recorded; implementation has not started. |
| Implementation | Prerequisites are complete or waived; scope, impacts, and evidence are kept current while work proceeds. |
| Review | The PR contains completed assessments, evidence, known limitations, and requested reviews. |
| Accepted | Required reviewers accept the evidence and no open blocking dependency or unexpired waiver is hidden. |
| Released | The accepted manifest links to the applicable release evidence; this state does not itself authorize publication. |
| Superseded | A successor task or decision replaces the manifest; retain its reason and link. |

## Future machine-readable proposal

This YAML is a proposal for a future manifest schema only. It does not create
automation, change metadata schemas, or authorize release tooling.

```yaml
schema: vyrnforge/change-manifest@proposed-v1
task:
  id: VF-0008
  sprint: S0
  qualityGate: documentation
  workstream: Documentation
  accountableOwner: Documentation
scope:
  packages: []
  components: []
  areas: [docs/governance]
  outOfScope: [package-implementation, ci-workflows]
dependencies:
  predecessors: []
  requiredMerged: []
  documents: [docs/governance/ownership-and-review-model.md]
  finishToStart: required
  waivers: []
classification: [governance, documentation]
compatibility:
  publicApi: none
  css: none
  exports: none
  runtimeDependencies: none
  peerDependencies: none
  browserRuntime: none
  migration: none
quality:
  unit: not-applicable
  dom: not-applicable
  browser: not-applicable
  accessibility: not-applicable
  keyboard: not-applicable
  themeDensity: not-applicable
  performance: not-applicable
  documentation: required
evidence:
  commands: []
  reports: []
  screenshotsOrTraces: []
  apiDiff: not-applicable
  packageVerification: not-applicable
  consumerFixture: not-applicable
  knownLimitations: []
lifecycle: draft
```

## Unresolved policy questions

- The repository does not yet identify the system of record for task IDs,
  sprint assignments, waivers, or acceptance decisions.
- Named maintainers, approval counts, and branch-protection enforcement remain
  external administration decisions; the ownership model intentionally defines
  roles rather than people.
- The exact criteria and authority for an "approved release gate" after S0–S8
  need a separate roadmap and release-governance decision.

Until these are resolved, manifests must use repository-visible links and role
names, and reviewers must record any manual decision in the PR.

## Related documents

- [Documentation Governance](00-documentation-governance.md)
- [Ownership and Review Model](ownership-and-review-model.md)
- [Component Maturity Model](component-maturity-model.md)
- [Repository Inventory](repository-inventory.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [ADR-003 CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md)
- [Quality Gates](../quality/00-quality-gates.md)
- [Release Policy](../release/release-policy.md)
