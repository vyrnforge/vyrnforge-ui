# VyrnForge UI Master Roadmap

## Current direction

VyrnForge is a native-owned, dependency-minimal, general-purpose UI system with
enterprise-grade depth. The canonical product identity and long-term scope live
in [`../governance/01-project-source-of-truth.md`](../governance/01-project-source-of-truth.md).

The foundational multi-framework architecture is established. React, native
HTML / Custom Elements, Angular, and Vue are first-class non-grid web surfaces
sharing canonical contracts, behaviors, tokens, styling, accessibility rules,
and terminology. The data grid remains a specialized React alpha on its own
release track.

The active priority is **not feature expansion**. The repository now enters a
baseline cleanup and hardening program so future product work starts from a
small, current, understandable, and fully verified foundation.

## Current release tracks

### Non-grid beta

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-elements
@vyrnforge/ui-components
@vyrnforge/ui-angular
@vyrnforge/ui-vue
```

### Independent alpha

```text
@vyrnforge/ui-data-grid
```

Exact versions, dist-tags, package membership, and internal dependency alignment
are owned by
[`../metadata/release-groups.json`](../metadata/release-groups.json).
Repository release-readiness evidence must not be confused with actual registry
publication status.

## Completed foundation history

Detailed closed task history belongs to merged Git history, pull requests, CI
evidence, and retained historical records. This roadmap keeps only the milestones
needed to understand the current baseline.

| Sprints | Program | Result | State |
| --- | --- | --- | --- |
| S0-S3 | Repository and quality foundation | Established inventory, quality gates, interaction/accessibility evidence, semantic tokens, and component consistency. | Complete |
| S4-S8 | Multi-framework foundation | Established shared contracts and behaviors, canonical Custom Elements, cross-framework consumers, and prerelease release groups. | Complete |
| S9 | Repository and delivery simplification | Simplified contributor commands, CI orchestration, Pages delivery, release progression, and documentation entrypoints. | Complete |
| S10-S15 | Multi-framework distribution architecture | Established canonical component metadata/generation and first-class React, native HTML, Angular, and Vue distribution. | Complete |

Historical sprint task lists are intentionally not duplicated here. Reintroduce
historical detail only when it is required to explain a current contract or
migration decision.

# Active Sprint — S16 Baseline Cleanup & Hardening

**Gate:** G16 — Clean Baseline

**Goal:** reduce repository, documentation, architecture, tooling, CI/CD, and
release complexity to the smallest set that accurately represents and protects
the current VyrnForge architecture.

S16 is a cleanup program, not a redesign program. Existing working architecture
should be preserved unless concrete repository evidence shows that it is stale,
duplicated, incorrectly owned, or unnecessarily complex.

## S16 execution rules

- No new product features, components, framework surfaces, or speculative
  abstractions.
- Do not rewrite working code merely to make it stylistically cleaner.
- Prefer deletion, consolidation, and reuse over adding another layer.
- One concept should have one canonical source of truth.
- Historical material should not live in current operational paths unless it is
  still required evidence.
- Temporary cleanup inventories, migration notes, and one-time scripts must be
  removed before G16 closes unless they become an intentionally retained source
  of truth.
- Current package manifests, public entrypoints, canonical metadata, and tested
  runtime behavior override stale planning prose.
- Framework-specific exceptions must remain narrow, explicit, evidenced, and
  tested.
- Cleanup must preserve dependency-minimal, framework-independent shared
  foundations and first-class React, native HTML, Angular, and Vue support.

## S16 jobs

| Task | Job | Depends on | Status |
| --- | --- | --- | --- |
| BC-1601 | Repository truth and cleanup inventory | — | Not started |
| BC-1602 | Documentation and source-of-truth cleanup | BC-1601 | Not started |
| BC-1603 | Architecture and package-boundary cleanup | BC-1601 | Not started |
| BC-1604 | Repository and tooling cleanup | BC-1601, BC-1603 | Not started |
| BC-1605 | CI/CD cleanup and validation ownership | BC-1601, BC-1604 | Not started |
| BC-1606 | Release and distribution cleanup | BC-1601, BC-1603, BC-1604 | Not started |
| BC-1607 | Quality, maturity, and evidence cleanup | BC-1602, BC-1603 | Not started |
| BC-1608 | Clean-baseline verification | BC-1602 through BC-1607 | Not started |
| BC-1609 | Cleanup closeout and temporary-artifact removal | BC-1608 | Not started |

BC-1602 and BC-1603 may proceed in parallel after BC-1601. Other work should be
serialized only where the dependencies above represent a real technical
ordering requirement.

## BC-1601 — Repository truth and cleanup inventory

Establish the evidence-backed current state before deleting or restructuring
anything.

### Work

- Inventory packages, applications, examples, fixtures, scripts, workflows,
  generated artifacts, documentation trees, metadata, release files, and root
  configuration.
- Identify current canonical sources versus derived, historical, duplicated,
  transitional, or orphaned material.
- Map package dependency direction and public versus internal entrypoints.
- Identify scripts and CI checks that verify the same invariant through multiple
  paths.
- Identify stale framework assumptions, obsolete consumer fixtures, abandoned
  experiments, dead files, and one-time migration artifacts.
- Identify documentation that restates architecture, maturity, release, or
  component facts already owned elsewhere.
- Classify each cleanup candidate as keep, consolidate, regenerate, replace, or
  delete, with the owning current source of truth.

### Acceptance

- Every planned deletion or consolidation is backed by a current replacement or
  proof that the artifact is no longer required.
- No package, public API, release track, framework surface, or verification path
  is inferred solely from old sprint documentation.
- The inventory is used to execute S16, not retained as a permanent duplicate
  roadmap unless it proves to be a necessary canonical artifact.

## BC-1602 — Documentation and source-of-truth cleanup

Make current documentation concise, navigable, non-duplicated, and clearly
owned.

### Work

- Reconfirm `docs/README.md` as the human documentation entrypoint and the
  project source-of-truth document as product identity authority.
- Reduce duplicate architecture, framework, package, release, maturity,
  contributor, testing, and CI explanations.
- Keep generated references generated; do not maintain handwritten copies of
  generated facts.
- Remove or relocate closed sprint execution narratives from current reader
  paths when Git/PR/CI history already owns that evidence.
- Delete obsolete roadmap documents rather than preserving them merely because
  they once existed.
- Ensure current docs distinguish consumer guidance, maintainer architecture,
  generated API reference, planning, and historical evidence.
- Repair links and navigation after deletion/consolidation.

### Acceptance

- Each important project fact has one obvious canonical owner.
- Current documentation does not require understanding historical sprint IDs.
- No known stale publication, framework-support, package, or maturity claims
  remain.
- Documentation checks and the docs application build pass from a clean clone.

## BC-1603 — Architecture and package-boundary cleanup

Verify the architecture that actually exists and remove transitional structure
that no longer has a purpose.

### Work

- Revalidate responsibilities and dependency direction for `ui-core`,
  `ui-behaviors`, `ui-elements`, `ui-components`, `ui-angular`, `ui-vue`, and
  `ui-data-grid`.
- Confirm framework-neutral contracts, tokens, schemas, behaviors, and generated
  metadata remain outside framework-specific packages where practical.
- Confirm Angular and Vue remain adapters/facades over canonical shared
  foundations rather than independent component implementations.
- Audit React canonical-renderer exceptions and retain only evidenced exceptions.
- Remove dead compatibility shims, obsolete adapter layers, unused abstractions,
  accidental cross-package imports, and internal APIs leaked through public
  entrypoints.
- Normalize terminology and ownership where equivalent concepts have diverged.
- Preserve separate data-grid maturity/release ownership; do not pull grid
  internals into the non-grid critical path during cleanup.

### Acceptance

- Every package has a concise responsibility and justified dependencies.
- Package-boundary verification reflects the intended architecture rather than
  historical exceptions.
- No duplicated framework implementation remains where the canonical foundation
  can own the capability once.
- Public entrypoints expose intentional supported API only.

## BC-1604 — Repository and tooling cleanup

Make a clean clone understandable and reduce permanent maintenance surface.

### Work

- Remove dead scripts, unused configuration, obsolete fixtures, stale generated
  output, abandoned examples, and migration-only files found by BC-1601.
- Consolidate one-off verification helpers when a maintained shared verifier
  already owns the invariant.
- Normalize package and root command naming where equivalent operations use
  inconsistent terminology.
- Keep the normal contributor command surface centered on:

  ```bash
  npm ci
  npm run check
  npm run test
  npm run build
  ```

- Keep specialist commands only when they protect a distinct release,
  compatibility, security, accessibility, browser, packaging, or generation
  responsibility.
- Verify generated artifacts are either reproducible and checked, or removed
  from source control when retention has no value.

### Acceptance

- No known dead root script or tracked obsolete fixture remains.
- A new contributor can identify normal setup, validation, test, and build paths
  without reading CI internals.
- Root commands and package scripts have clear ownership and minimal duplication.
- Clean-clone local behavior matches CI assumptions.

## BC-1605 — CI/CD cleanup and validation ownership

Reduce workflow complexity without weakening meaningful guarantees.

### Work

- Inventory every required check and map it to the invariant it owns.
- Remove duplicate validation performed at multiple orchestration levels without
  additional evidence value.
- Keep fast merge validation separate from expensive assurance, release, or
  manually authorized publication work.
- Ensure CI calls repository-owned commands instead of reimplementing validation
  logic in YAML where practical.
- Simplify changed-path scope detection only where correctness is preserved.
- Keep package-boundary, generated-artifact, packed-consumer, accessibility,
  browser/runtime, SSR/bundler, security, and release checks when they protect
  distinct contracts.
- Improve failure naming/output so a failed check identifies the violated
  contract rather than only a wrapper job.
- Remove obsolete workflow triggers and closed-program automation.

### Acceptance

- Every persistent workflow and required check has one documented purpose.
- The merge gate is strong but not a duplicate execution of the full release
  pipeline.
- Release/publication operations remain explicitly separated from ordinary CI.
- CI passes on the cleaned repository and branch protection references only
  checks that still exist and matter.

## BC-1606 — Release and distribution cleanup

Align repository claims, package metadata, release tracks, and consumer evidence.

### Work

- Verify release-group metadata against package manifests and public dependency
  relationships.
- Remove stale prerelease/release scripts, notes, manifests, or dry-run machinery
  superseded by the current release model.
- Verify React, native HTML, Angular, and Vue non-grid packages through packed
  package consumers rather than workspace-only imports.
- Verify the data grid remains independently versioned/matured where intended.
- Ensure GitHub release documentation, npm dist-tag assumptions, registry
  publication status, and repository readiness are not conflated.
- Retain trusted publishing/provenance/security checks only in the smallest
  release path that actually needs them.
- Verify SSR/server-safe imports and supported bundler consumption from packed
  artifacts.

### Acceptance

- Release metadata and package manifests describe one consistent release model.
- A fresh external-style consumer can install and build each supported surface
  from packed artifacts.
- No obsolete release-line or publication path remains active.
- No cleanup task performs an npm publication or stable-release promotion.

## BC-1607 — Quality, maturity, and evidence cleanup

Make quality evidence current and proportional to what VyrnForge actually
claims.

### Work

- Audit component maturity metadata against present implementation,
  documentation, tests, accessibility evidence, and cross-framework support.
- Remove obsolete maturity evidence formats and closed migration exceptions when
  they no longer affect current promotion rules.
- Consolidate accessibility, visual-regression, compatibility, performance, and
  consumer evidence where multiple artifacts encode the same result.
- Keep manual evidence requirements explicit where automation cannot replace
  them.
- Ensure beta/alpha labels remain honest and are not upgraded merely because S16
  cleanup passes.

### Acceptance

- Maturity metadata has no known legacy exception that exists only because an
  old migration once needed it.
- Current automated evidence is reproducible.
- Manual evidence remains clearly separated from automated green checks.
- G16 makes no unsupported production-readiness or stable-maturity claim.

## BC-1608 — Clean-baseline verification

Run the cleaned repository as a consumer and contributor would, and fix causes
rather than documenting around failures.

### Required evidence

- fresh install with `npm ci`;
- `npm run check`;
- `npm run test`;
- `npm run build`;
- full repository CI equivalent;
- package packing and package-boundary verification;
- React, native HTML, Angular, and Vue packed-consumer builds/runtime checks;
- data-grid alpha checks without promoting it into the non-grid release group;
- browser, accessibility, and visual checks required by current contracts;
- SSR/bundler verification;
- documentation application build and link/currentness validation;
- release dry-run where current release policy requires it, with publishing
  disabled.

### Acceptance

- All required evidence passes from the cleaned repository state.
- There are no unexplained ignored failures, temporary bypasses, or cleanup-only
  exceptions.
- Any intentionally deferred debt is concrete, current, and recorded outside the
  G16 acceptance path rather than hidden inside passing scripts.

## BC-1609 — Cleanup closeout and temporary-artifact removal

Close S16 without leaving a cleanup project embedded permanently in the product.

### Work

- Delete temporary inventories, migration notes, one-time scripts, temporary
  workflows, debug artifacts, and cleanup-only flags created during S16.
- Regenerate intentional generated references after final structure changes.
- Update this roadmap to mark S16/G16 complete and reduce S16 execution detail to
  the minimum historical summary needed for future planning.
- Update canonical documentation only where final repository behavior changed.
- Confirm the final commit still passes the required G16 evidence after temporary
  cleanup material is removed.

### Acceptance

- S16 leaves behind the cleaned product and its durable sources of truth, not a
  permanent pile of cleanup scaffolding.
- The active roadmap is ready for the next product-development sprint without
  carrying closed S16 task detail indefinitely.

## G16 — Clean Baseline gate

G16 passes only when all of the following are true:

1. Current documentation has clear canonical ownership with no known stale or
   unnecessary duplicate operational docs.
2. Package responsibilities, public entrypoints, and dependency direction match
   the intended multi-framework architecture.
3. Obsolete repository files, scripts, fixtures, generated artifacts, migration
   scaffolding, and closed-program automation identified by S16 are removed.
4. Normal contributor commands are small, documented, and reproducible from a
   clean clone.
5. Persistent CI/CD checks have distinct responsibilities and the required merge
   gate is green.
6. Release metadata and packed-package consumer evidence accurately represent
   current beta/alpha tracks without making a stable-release claim.
7. Component maturity and quality evidence are current and do not depend on
   obsolete migration exceptions.
8. React, native HTML, Angular, and Vue retain first-class non-grid support from
   the same shared VyrnForge foundations.
9. The React data-grid alpha remains valid and isolated from unrelated S16
   expansion work.
10. Temporary S16 artifacts are removed and the final cleaned state still passes
    the complete required validation.

## Explicitly deferred until G16 passes

Feature expansion is frozen during S16 except for fixes required to preserve
existing contracts or make the clean baseline pass. Deferred work includes:

- new general-purpose components;
- new advanced modules;
- data-grid feature expansion or multi-framework grid renderers;
- new framework targets;
- AI-native consumer features beyond cleanup of already-existing context;
- broad visual redesign;
- speculative architecture revisions;
- maturity promotion to stable solely because cleanup completed.

After G16, product planning should be driven by real consumer/application needs,
with reusable capabilities implemented once in shared VyrnForge foundations and
adapted consistently across supported surfaces.

## Planning rules

- Product identity and long-term scope are canonical in
  `docs/governance/01-project-source-of-truth.md`.
- `docs/metadata/components.json` owns structured component status and maturity.
- `docs/metadata/release-groups.json` owns release-group membership and exact
  release metadata.
- Current package manifests and tested public entrypoints override stale planning
  examples about implemented state.
- Historical task identifiers belong in Git/PR/CI evidence unless they remain
  necessary to explain a current contract or migration.
- New reusable UI should extend existing VyrnForge foundations before creating a
  separate implementation.
- Shared tokens, contracts, schemas, metadata, generators, and framework-neutral
  logic remain framework-agnostic where practical.
- Framework packages remain adapters/facades over shared foundations, with narrow
  evidenced exceptions.
- Application-specific business logic and runtime engines stay outside core
  VyrnForge packages.
- Advanced capabilities must be optional and must not impose unnecessary
  dependency, runtime, CSS, or setup cost on consumers that do not use them.
