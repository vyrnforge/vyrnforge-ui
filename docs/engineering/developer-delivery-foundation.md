# Developer Delivery Foundation

## Purpose

VyrnForge treats the developer delivery system as part of the product. Before the next component expansion cycle, canonical source, generated API reference data, executable examples, CI evidence, deployed documentation/playground output, and released reference snapshots must participate in one traceable lifecycle.

The machine-readable program contract is `docs/metadata/developer-delivery-foundation.json`. This document explains the durable architecture; it does not duplicate the current task tracker.

## Source-to-reference flow

```text
canonical source
  package manifests and public entrypoints
  component contracts and catalog metadata
  framework/package/release/token metadata
        |
        v
generated knowledge
  framework API reference
  consumer knowledge
  custom-element/reference metadata
        |
        +--------------------+
        |                    |
        v                    v
reference portal          verification
  documentation            drift/currentness
  API reference            package/entrypoint checks
  playground/examples      four-surface consumers
  patterns                  browser/accessibility evidence
        |                    |
        +----------+---------+
                   v
          immutable CI artifact
                   |
                   v
          production Pages deployment
                   |
                   v
       versioned release snapshots
```

Canonical behavior and API facts are owned by package public entrypoints and structured VyrnForge metadata/contracts. Reader applications render or execute those facts; they must not become parallel sources of truth.

## Reader-facing reference model

The long-term reference product has three coordinated views rather than three independent documentation systems:

- **Guides** explain installation, architecture, accessibility, theming, migration, and usage decisions.
- **Generated API reference** presents package/component/framework contracts in a Javadoc-like form with stable deep links, framework switching, version context, setup, public members, accessibility obligations, and limitations.
- **Playground/examples** execute representative behavior and patterns and prove that documented usage remains viable.

`apps/docs` remains a presentation application. `examples/basic-playground` remains an executable consumer surface while its data-grid-specific workspace identity is migrated toward the general VyrnForge reference role it already serves. Neither application owns component API truth.

## CI and delivery lifecycle

VyrnForge keeps four lifecycle workflows. Responsibilities are not copied into per-framework or per-package workflows.

1. **Task PR -> integration lane**: affected-scope quality/integration/security selected from the real diff and dependency graph, aggregated by `ci-gate`.
2. **Integration lane -> main promotion**: full repository validation at the product compatibility boundary.
3. **Exact main delivery**: rebuild only deployable reference output and bind it to the exact commit that landed on `main`; do not rerun the promotion suite.
4. **Weekly assurance**: own expensive compatibility/security/drift checks that do not belong on every PR.
5. **Pages deployment**: consume a verified immutable current-main artifact; never rebuild repository source and never publish packages.
6. **Controlled release**: publish only verified retained tarballs from current `main`, verify registry/provenance/consumer behavior, create the immutable release record, then refresh the released reference snapshot for that tag.

Production publication and deployment stay separate. A documentation/reference preview must never require Pages write permission, npm OIDC, tag creation, or repository write access.

## Generated API reference rule

`docs/generated/framework-api-reference.json` is the existing cross-framework reference foundation. It should be extended rather than replaced. A reader-facing API page must be able to derive, as applicable:

- package and version/release line;
- public export or Custom Element tag;
- properties/inputs/props and defaults;
- attributes and reflection/removal semantics;
- events/callbacks/outputs/emits and typed detail;
- slots/children/templates/content projection;
- methods and ref/element exposure;
- form/model semantics;
- accessibility obligations;
- setup requirements;
- maturity and known limitations.

Hand-written demo props tables may add explanatory prose, but they must not independently define public API members once canonical generated data can supply them.

## Example contract

A public example has one canonical identity and purpose. Native HTML, React, Angular, and Vue representations may use idiomatic syntax, but they must map to the same VyrnForge behavior contract. Representative examples must be typechecked/built and smoke-tested through real packed consumers where the surface is supported.

Live editing may remain framework-specific when runtime tooling requires it. That exception does not permit framework-specific API truth.

## Version and deployment contract

One version catalog must describe the deployed reference product. `Next` is bound to the exact deployed `main` commit. Released versions are bound to immutable Git release tags. Each retained release must provide the complete reference pair required by that release source, including documentation and playground output.

The current deployment workflow already follows the correct least-privilege direction: it downloads a successful current-main Pages artifact and deploys it without checkout or rebuild. The remaining release gap is that release tags are discovered only when a later site assembly runs. Closing G17 requires a successful controlled release to trigger a delivery refresh after the release tag exists, so the released reference becomes available without requiring another source commit.

## G17 exit

Component expansion remains paused until G17 proves the delivery foundation end to end: generated API drift checking, unified version/framework reference behavior, four-surface representative examples, non-privileged PR preview artifacts, immutable current-main deployment, immediate release-bound reference refresh, and full repository validation with no unexplained bypass.

## Related sources

- `docs/engineering/ci-cd-architecture.md`
- `docs/engineering/documentation-system.md`
- `docs/governance/05-trunk-delivery.md`
- `docs/architecture/09-component-contracts-and-events.md`
- `docs/metadata/developer-delivery-foundation.json`
