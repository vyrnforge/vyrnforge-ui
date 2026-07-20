---
title: VyrnForge UI Component Maturity Model
status: Stable
owner: Architecture
last_reviewed: 2026-07-20
canonical: true
---

# Component Maturity Model

## Purpose

This document defines the lifecycle and evidence required to describe a
VyrnForge UI component, public grid feature, or public contract as Planned,
Experimental, Alpha Stable, Beta Stable, Stable, or Deprecated. It gives
consumers an accurate compatibility and validation expectation while retaining
the release-stage rules in `docs/release/`.

It complements the accountability and approval triggers in
[`ownership-and-review-model.md`](ownership-and-review-model.md). Architecture
approves maturity promotions, demotions, public-API decisions, and exceptions;
the accountable package owner supplies evidence; Accessibility, Quality
Engineering, Documentation, and DevOps / Release participate when their review
triggers apply.

## Scope and non-goals

This model applies to public components, public hooks, public data-grid
features, public CSS contracts, and compatibility aliases. It does not change
any existing component status, metadata entry, implementation, test, workflow,
or release version. It also does not promise production rights or support;
those remain subject to the VyrnForge Source License and the release policy.

`docs/metadata/component-status.json` currently uses the coarse values
`planned`, `experimental`, `stable`, and `deprecated`, with a separate internal
registry. The finer Alpha Stable and Beta Stable states defined here are policy
states until a future metadata schema is approved. Existing `stable` entries
are not implicitly reclassified by this document.

## Evidence and decision rules

- Evidence is component- or feature-specific, linked from its public docs,
  review record, release record, or future metadata; a passing repository-wide
  check alone is not sufficient evidence of maturity.
- Required evidence may be marked not applicable only with a written rationale
  approved by the accountable owner and the relevant review partner.
- A promotion must satisfy every criterion for the target state, preserve all
  applicable requirements of lower states, and have the reviews required by
  `ownership-and-review-model.md`.
- A newly discovered P0 or P1 defect, broken compatibility commitment, or
  material accessibility regression blocks promotion. It requires demotion
  when the existing state would otherwise mislead consumers.
- Maturity describes the component or contract, not the maturity of the entire
  package or of a consuming application.

## Maturity states

### 1. Planned

| Requirement | Expectation |
| --- | --- |
| Meaning | Intended capability that is not an available public contract. It may have a roadmap or design entry but is not implemented or exported for consumption. |
| Appropriate production usage | None. Do not use it as an import, dependency, or delivery commitment. |
| API compatibility expectation | None. Names, scope, props, behavior, CSS, and availability may change or disappear. |
| Required test evidence | None; exploratory spikes are not maturity evidence. |
| Required accessibility evidence | Initial accessibility risks and likely semantic pattern should be identified when interaction is proposed. |
| Required documentation | Roadmap or planning description that says it is planned and not available; public docs must not imply an import exists. |
| Consumer validation requirements | None. Consumer requests may inform the design but do not validate an unavailable API. |
| Promotion criteria | A named owner accepts scope; a public API and accessibility approach are reviewed enough to begin an experimental implementation; the component is correctly exported and documented as Experimental when public. |
| Demotion criteria | Reprioritization, supersession, or removal from the roadmap. Record the decision rather than leaving a misleading planned entry. |
| Release expectations | Not listed as a usable release feature and never used to claim package coverage. |

### 2. Experimental

| Requirement | Expectation |
| --- | --- |
| Meaning | A public, testable capability still being shaped through implementation and early feedback. |
| Appropriate production usage | Avoid for production-critical or hard-to-migrate workflows. Controlled evaluation, prototypes, and opt-in early-adopter use may be appropriate when the risk is understood. |
| API compatibility expectation | Change is allowed, including breaking change, with clear release notes when public behavior, imports, types, CSS, or accessibility contracts change. No long-term compatibility guarantee. |
| Required test evidence | Focused rendering, logic, or unit tests where applicable, plus DOM interaction tests for interactive behavior that exists. Regressions found during evaluation must gain targeted coverage when practical. |
| Required accessibility evidence | Automated scan for the rendered public path and documented known limitations. Interactive controls need an initial keyboard and semantic assessment. |
| Required documentation | Public API reference, status statement, a minimal example, known limitations, and usage boundaries. |
| Consumer validation requirements | Maintainer or playground validation of the documented path; external use is encouraged but not a promotion requirement. |
| Promotion criteria | The complete Alpha Stable evidence is accepted, including a reviewed public API, named owner, interaction coverage, accessibility scan, theme and density validation, and documentation. |
| Demotion criteria | The capability is withdrawn, its public path becomes unsuitable for evaluation, or defects/risks make the Experimental label materially misleading. Move it to Planned or Deprecated as appropriate and document the reason. |
| Release expectations | May ship only with an explicit Experimental statement. Churn and breaking changes must follow the alpha release and migration guidance. |

### 3. Alpha Stable

| Requirement | Expectation |
| --- | --- |
| Meaning | A complete, coherent public capability whose baseline behavior has been hardened for alpha adopters, while its API and real-world fit are still being proven. |
| Appropriate production usage | Not recommended for production-critical use. It may support deliberate, monitored alpha pilots where consumers can absorb change. |
| API compatibility expectation | Public API is reviewed and intentional, but changes remain possible in alpha. Public breaking changes require Architecture approval and migration guidance. |
| Required test evidence | Reviewed public API and correct package-root public exports; unit or logic tests where applicable; DOM interaction tests; browser tests for complex components; regression coverage for material defects. |
| Required accessibility evidence | Automated accessibility scan; documented keyboard contract; verified visible focus and relevant semantics; light and dark theme validation; density validation. Manual review is required when the Accessibility owner determines automation is insufficient. |
| Required documentation | Accurate API documentation, examples, limitations, accessibility/keyboard guidance, and maturity statement. The accountable package documentation and public export guidance must agree. |
| Consumer validation requirements | Maintainer validation of documented use and packaging/import paths. Consumer feedback is collected, but a real consuming application is not yet required. |
| Promotion criteria | All Alpha Stable evidence is reviewed and accepted; no unresolved P0/P1 defect; Beta Stable additions are complete: real consuming-application use, compatibility validation, and migration notes for changed Experimental APIs. |
| Demotion criteria | A P0/P1 defect, material accessibility failure, incorrect export/public-doc contract, or incompatible change without the required guidance that invalidates the alpha-hardening claim. Demote to Experimental until corrected. |
| Release expectations | Released as an alpha capability with explicit maturity, known limitations, and public-change notes. It must not be represented as beta or stable. |

### 4. Beta Stable

| Requirement | Expectation |
| --- | --- |
| Meaning | A near-final public capability validated in real integration conditions and suitable for broad pre-production validation. |
| Appropriate production usage | Limited, deliberate production validation may be considered only under the current release and licensing policy; do not treat beta as a blanket production commitment. |
| API compatibility expectation | API is mostly stable. Avoid breaking changes; make them only for correctness, accessibility, security, or compelling compatibility reasons, with migration notes. |
| Required test evidence | Retain Alpha Stable evidence and browser coverage for complex paths. Add regression evidence for integration defects and compatibility-sensitive behavior. |
| Required accessibility evidence | Retain Alpha Stable evidence; resolve or formally disposition material accessibility findings and perform manual browser or assistive-technology review where the Accessibility owner requires it. |
| Required documentation | Complete public API and examples, current limitations, release notes, and migration notes for changed Experimental APIs. |
| Consumer validation requirements | Real consuming-application usage and compatibility validation are required. Validation must cover supported package imports and the consumer integration path that exercises the component or feature. |
| Promotion criteria | Stable additions are accepted: API stability is demonstrated across release cycles, supported-browser evidence exists, Accessibility accepts the review, the deprecation policy is applied, and a maintainer commits to ongoing support. |
| Demotion criteria | An unresolved critical defect, failed consumer compatibility, material accessibility regression, or significant API redesign. Demote to Alpha Stable or Experimental according to the remaining evidence. |
| Release expectations | Released with beta maturity, migration guidance for every breaking change, and no unresolved critical defects. |

### 5. Stable

| Requirement | Expectation |
| --- | --- |
| Meaning | A maintained public contract with demonstrated API durability, accepted quality evidence, and a commitment to compatibility and lifecycle management. |
| Appropriate production usage | Appropriate for supported consumer use, subject to the VyrnForge Source License and any release-specific readiness or support statement. |
| API compatibility expectation | Follow the applicable versioning and deprecation policies. Do not introduce unannounced incompatible API, CSS, behavior, or accessibility changes. |
| Required test evidence | Retain relevant Alpha and Beta evidence, demonstrate API stability across release cycles, and maintain regression coverage for supported behavior, compatibility, and high-risk defects. |
| Required accessibility evidence | Supported-browser evidence, accepted Accessibility review, and maintained keyboard, semantic, focus, contrast, reduced-motion, theme, and density evidence as applicable. |
| Required documentation | Complete API reference, examples, keyboard/accessibility contract, compatibility and migration guidance, known limitations, and accurate stable maturity statement. |
| Consumer validation requirements | Repeatable package/consumer validation plus evidence from real consuming application use. Revalidate when the public contract, supported browsers, themes, density, or integration assumptions change. |
| Promotion criteria | Architecture confirms all Stable evidence, the accountable package owner accepts ongoing maintenance, and release approval is recorded under the release policy. |
| Demotion criteria | A material unresolved P0/P1 defect, broken compatibility promise, unsupported browser claim, unacceptable accessibility finding, abandoned maintainer commitment, or major redesign. Demotion requires consumer communication, remediation/migration guidance, and release notes. |
| Release expectations | Release notes and changelog accurately describe behavior, fixes, deprecations, and migrations. Apply the deprecation policy before removal or incompatible replacement. |

### 6. Deprecated

| Requirement | Expectation |
| --- | --- |
| Meaning | A public capability or alias retained temporarily so consumers can move to a documented replacement, or marked as no longer recommended while removal is planned. |
| Appropriate production usage | Do not start new usage. Existing consumers should migrate on the documented timeline; emergency exceptions follow the deprecation policy. |
| API compatibility expectation | The deprecated surface remains available only for its stated notice period and removal condition. The replacement is the supported forward path. |
| Required test evidence | Preserve regression tests needed to keep the deprecated path safe during its notice period, especially aliases and behavior-affecting shims. |
| Required accessibility evidence | The deprecated path must not introduce known harmful accessibility regressions. The replacement’s accessible path and migration impact must be documented. |
| Required documentation | Deprecation notice, replacement, rationale, removal target or condition, migration notes, affected imports/CSS/behavior, and changelog entry. |
| Consumer validation requirements | Validate the replacement in at least one consuming path when practical; verify that documented migration steps and aliases work for affected consumers. |
| Promotion criteria | Not applicable. A deprecated item is replaced, not promoted; a substantially redesigned successor enters the normal lifecycle. |
| Demotion criteria | Removal once the notice period and removal criteria in `docs/release/deprecation-and-migration-policy.md` are met. Reinstatement requires Architecture approval and evidence appropriate to its new state. |
| Release expectations | Every deprecation and removal is called out in release notes. Respect the maturity-specific notice periods and emergency exception rules. |

## Special rules

### Non-interactive components

Non-interactive typography, layout, feedback, token, and visual components do
not need a keyboard interaction contract when they expose no interaction.
Their documentation must state that boundary. They still require correct
semantics, automated accessibility scanning, theme/density validation, public
API review, examples, and tests appropriate to their rendering or logic.
Browser testing is required when layout, responsive overflow, visual state, or
cross-browser behavior is complex.

### Interactive form components

Form components require DOM interaction tests for controlled and uncontrolled
use where supported, label association, keyboard operation, focus visibility,
disabled/read-only/required/invalid states, validation messaging, and value
change behavior. The keyboard contract must document relevant keys and focus
movement. Browser evidence is required for complex widgets such as composite
selects, date/time inputs, multiselects, autocompletes, sliders, and transfer
lists, including their error and theme/density states.

### Overlay components

Overlays require browser evidence for portal placement, focus entry and return,
Escape and outside-dismiss behavior where supported, top-layer behavior,
scroll lock, and nested overlays. Modal overlays require focus-trap evidence;
menus require item-navigation evidence; tooltips must remain non-interactive.
The documented contract must conform to
`docs/architecture/07-overlay-and-focus.md`.

### Data-grid features

Each public grid feature is assessed independently as well as in the
`UniversalDataGrid` integration. Evidence must cover controlled/uncontrolled
state where applicable, keyboard/grid semantics, empty/loading/error states,
theme and density behavior, and public state/adapter compatibility. Complex
features such as selection, sorting, filtering, grouping, pagination, column
menus, resizing, reordering, virtualization, and server/persistence/export
adapters require browser and integration evidence proportionate to the risk.
Stable grid features require consumer validation of the documented adapter or
state contract, not merely visual rendering.

### Internal components

Internal components are not public maturity candidates. They remain outside
package-root imports and retain no public compatibility expectation. They may
have quality requirements imposed by their owning public component, but are
recorded only in the metadata internal registry. Promoting an internal item to
a public lifecycle state requires a reviewed public API, correct export,
documentation, and the evidence for the target state.

### Planned metadata entries

Planned metadata entries are discovery and roadmap records only. They must not
be shown as available imports, examples, supported component coverage, or
package-root APIs. This model does not change the current metadata schema or
existing entries. When a planned item becomes public, its metadata and docs
must be updated in the implementation task that creates the export.

### Deprecated aliases

Create a compatibility alias only for a real migration need, never merely to
preserve an old name. The alias must be marked Deprecated, identify its
replacement and removal condition, appear in migration notes and release
notes, and have tests when it affects runtime behavior, types, imports, or
CSS. An alias inherits the accessibility obligations of the behavior it
exposes and must not keep an inaccessible legacy interaction alive.

## Machine-readable evidence fields

`docs/metadata/components.json` now contains the `maturityEvidence` schema.
It is a structured index of the evidence required by this model; Markdown,
review records, and release records remain the human sources of truth. Each
record uses repository-visible references and the following field families:

| Field | Purpose |
| --- | --- |
| `maturityState`, `category`, `owner` | Lifecycle state, conditional category, and accountable owner. |
| `publicApiReview`, `publicExportVerification` | Public API and package-export evidence. |
| `logicUnitTests`, `domInteractionTests`, `browserTests` | Logic, DOM interaction, and browser evidence. |
| `automatedAccessibility`, `keyboardContract`, `acceptedAccessibilityReview` | Automated scan, documented keyboard behavior, and accepted review. |
| `lightThemeValidation`, `darkThemeValidation`, `densityValidation` | Light, dark, and density validation references. |
| `documentation`, `playgroundExample`, `knownLimitations` | Public documentation, example, and limitations record. |
| `supportedBrowserEvidence` | Browser/version matrix and validation date. |
| `consumingApplication`, `compatibilityEvidence`, `criticalDefects` | Consumer, compatibility, and unresolved-critical-defect evidence. |
| `migrationInformation`, `deprecationPolicyCompliance` | Migration and deprecation-policy evidence. |
| `releaseApiStability`, `maintainerCommitment` | Release-cycle API stability and ongoing ownership. |
| `replacementOrReason`, `deprecationVersion`, `migrationGuidance`, `intendedRemovalWindow` | Deprecation replacement/reason, version, guidance, and removal plan. |

The deterministic `npm run verify:component-maturity` command enforces the
state- and category-specific requirements, reports each missing or pending
field with the component and maturity state, and does not infer evidence from
repository-wide quality checks. It applies the documented `new-promotions-only`
transition policy: entries present before the schema are explicitly listed as
legacy unverified, with no evidence fabricated. Future promotions must attach
the corresponding entry and references.

## Related documents

- [Ownership and Review Model](ownership-and-review-model.md)
- [Quality Gates](../quality/00-quality-gates.md)
- [Accessibility Standards](../architecture/05-accessibility-standards.md)
- [Overlay and Focus Foundation](../architecture/07-overlay-and-focus.md)
- [Public vs Internal API](../api/public-vs-internal-api.md)
- [Release Policy](../release/release-policy.md)
- [Deprecation and Migration Policy](../release/deprecation-and-migration-policy.md)
