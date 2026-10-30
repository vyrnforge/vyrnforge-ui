# Release tooling

Changesets is the single source of package release intent, version calculation, dependency-range updates, and generated package changelogs for the current VyrnForge rebuild.

Use `pnpm changeset` for a consumer-visible package change and select the affected package surfaces with `patch`, `minor`, or `major` significance. The Changeset summary must carry the human-readable release, deprecation, compatibility, or migration context needed by reviewers. Repository-only work that intentionally changes no package contract may use an empty Changeset (`---` / `---`) so the intent is explicit without inventing a package bump.

`pnpm verify:release` exercises representative multi-package Changesets behavior and validates the current release-intent state. `pnpm release:version` applies Changesets versioning and changelog generation for review.

Publication is not currently enabled for the private rebuild. Release Readiness is a non-publishing evidence gate; packed-package/API/consumer validation can prove release-shaped artifacts without authorizing publication. Publishing commands, credentials, environments, or trusted-publishing machinery require a separate accepted release decision before they may become active repository infrastructure.

The retired owner-local fragment parser and custom changelog renderer are not part of the release model. Historical `product/*/changes/` or package-local change-fragment files, where they still exist as provenance, must not be treated as current version intent. New release intent belongs in `.changeset/`.

Validation selection belongs to `tooling/impact/`, durable package/release invariants belong to `tooling/verify/`, and package or product behavior remains with its owner. Release tooling composes maintained evidence; it does not become a second source of package or product truth.
