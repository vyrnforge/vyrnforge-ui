# Future Release Group Metadata Requirements

- Task: MFD-1013
- Status: Accepted target design
- Depends on: MFD-1003, MFD-1004

## Purpose

The current `docs/metadata/release-groups.json` accurately describes the implemented release topology, but future framework packages require a generalized metadata model. S15 must be able to add or reclassify publishable packages without editing verifier constants, fixed package arrays, historical task identifiers, or hard-coded package counts.

## Required release-line data

Each release line/group must be representable as data with:

- stable release-line id;
- channel/prerelease policy;
- semantic version source;
- npm dist-tag;
- synchronized versus independently versioned policy;
- publish-together policy;
- package membership/order;
- internal dependency requirements and closure rules;
- Git tag/GitHub Release identity policy;
- artifact, provenance, registry, and consumer-verification requirements;
- optional package-specific policies such as CSS or size-budget applicability.

## Required package classification

Every publishable workspace must be classified exactly once into an approved release line unless metadata explicitly marks it unpublished/internal. Package classification must include package name, workspace directory, framework/runtime role, release line, dependencies, and declared verification policies.

Adding `@vyrnforge/ui-angular` or `@vyrnforge/ui-vue` after their implementation gates must require metadata additions, not edits to hard-coded package counts or verifier package lists.

## Independence and dependency closure

The model must support both synchronized groups and independently versioned release lines. A release line may consume packages from another line only through explicit version/dependency policy.

Selected release preparation must derive the complete required package dependency closure and publish order from metadata. A dist-tag alone is not sufficient to define release scope.

## Release identity

Git tag and GitHub Release identity must include release-line/group identity so two independent lines can publish the same semantic version without collision or ambiguity.

The exact tag syntax is defined/implemented by MFD-1506; this task requires the metadata to carry enough identity information for that decision.

## Workflow input rules

Manual release orchestration should select an approved release line/group. Version, dist-tag, package membership, and dependency closure must derive from canonical metadata rather than independent operator inputs that can conflict.

## Historical metadata

Historical BT-8002/RS task identifiers may remain in archived/current-state evidence, but the generalized active schema must not require them to classify or publish a package. Fixed values such as `nonGridBetaPackageCount: 4` must not be architectural requirements in schema v2.

## Trust and verification

The generalized model must preserve the established release trust boundaries: immutable artifacts, verification before publication, protected publication, npm trusted publishing/OIDC, provenance, integrity, registry verification, and GitHub Release evidence.

Framework packages must use the same trust model rather than introducing separate publication paths.

## Acceptance mapping

This design gives S15 enough metadata requirements to derive membership, dependencies, versions, tags, release identity, package policies, and trust checks for current and future release lines without historical task constants or fixed package counts.
