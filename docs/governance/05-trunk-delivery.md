# Trunk Delivery

## Purpose

`main` is the protected integration and release branch for VyrnForge. Work is
developed on short-lived task branches and merged through reviewed pull
requests after protected CI passes.

Persistent `integration/*` lanes are not part of the current delivery model.
Do not recreate lane synchronization, lane-drift checks, or promotion chains
without a new architectural decision.

## Pull requests to main

Every normal change targets `main`.

- `ci-gate` is the required merge-facing status.
- Pull requests to `main` run full repository validation.
- Public changes must update their canonical metadata, reference, docs, tests,
  and consumer evidence as applicable.
- Framework work must preserve Native HTML / Custom Elements, React, Angular,
  and Vue as equal first-class surfaces.
- No merge may bypass required compatibility, accessibility, form, package, or
  generated-artifact evidence merely to reduce framework-specific code.

Emergency fixes still use a pull request to `main` unless repository access is
being repaired. They receive the same protected validation.

## CI execution model

The repository validates each lifecycle boundary once.

1. **PR to main** — full protected validation: quality, integration, docs,
   security, packed consumers, browser/accessibility evidence, and generated
   artifacts according to the repository workflow.
2. **Push to main** — exact-main delivery only. It rebuilds the deployable
   documentation/reference artifact bound to the commit that actually landed;
   it does not repeat the already-passed merge suite.
3. **Weekly Assurance** — expensive compatibility, dependency/security drift,
   CodeQL, and full assurance checks.
4. **Controlled release** — manual release from current `main`, using verified
   immutable package artifacts and successful current-main CI evidence.
5. **Pages deployment** — consumes a verified current-main Pages artifact and
   never rebuilds source.

The current workflow source of truth is
[`docs/engineering/ci-cd-architecture.md`](../engineering/ci-cd-architecture.md).

## Change impact

Changing code does not require touching every documentation or example surface,
but public impact must be explicit and testable.

- Shared behavior or accessibility changes require downstream adapter and
  browser/accessibility evidence.
- Public properties, events, methods, slots, models, or exports require
  canonical metadata/reference and affected framework verification.
- New reusable components require framework-neutral contracts plus supported
  Native, React, Angular, and Vue surfaces.
- Token/theme/visual changes require token, style, and visual evidence.
- Package/public-entrypoint changes require packed package and external consumer
  verification.
- Workflow, toolchain, root-manifest, or shared CI-script changes require full
  repository validation.
- Generated metadata/reference must be reproducible and fail on drift.

## Release and deployment boundary

Production Pages and npm publication originate only from current `main`.

The release workflow is separately authorized and manual. A green prerelease
package channel or green CI does not itself authorize maturity promotion,
package renaming, publication, or feature-scope expansion.

## Adding packages or framework surfaces

A new package or surface is not complete when it compiles. It must have:

1. workspace/dependency classification;
2. package-boundary verification;
3. build, typecheck, lint, and tests;
4. public entrypoint and packed-consumer evidence;
5. canonical metadata and docs;
6. browser/SSR/accessibility evidence where applicable;
7. explicit release lifecycle classification;
8. CI impact behavior for source, tests, manifests, and published payload.

This contract applies equally to Native HTML / Custom Elements, React, Angular,
Vue, and optional advanced VyrnForge modules.
