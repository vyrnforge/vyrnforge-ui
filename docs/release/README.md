# Release Documentation

This directory is the source of truth for VyrnForge UI release governance.

VyrnForge UI is currently in an early alpha prerelease stage and is
source-available under the VyrnForge Source License 1.0.
`@vyrnforge/ui-core@0.1.0-alpha.0` is the historical first public prerelease,
and `0.1.0-alpha.1` is the initial coordinated alpha published for all three
packages. Future coordinated prereleases use the manually dispatched trusted
publishing workflow, protected `npm-release` environment, registry verification,
and automated Git tag plus GitHub prerelease record.

The explicit prerelease dist-tag is authoritative. npm may retain a
registry-managed `latest` tag, but it is not a stable-release signal during
alpha.

| Document | Purpose |
| --- | --- |
| [release-policy.md](release-policy.md) | Maturity stages and expectations from pre-alpha through 1.x stable. |
| [versioning-policy.md](versioning-policy.md) | Package versioning, prerelease identifiers, synchronized versions, and compatibility rules. |
| [publication-procedure.md](publication-procedure.md) | Controlled OIDC publication, registry verification, and release-record procedure. |
| [release-responsibility-matrix.md](release-responsibility-matrix.md) | Workflow, package, deployment, npm, registry, and release-record responsibilities. |
| [deprecation-and-migration-policy.md](deprecation-and-migration-policy.md) | Deprecation, compatibility, migration, and removal rules. |
| [release-readiness-checklist.md](release-readiness-checklist.md) | Reusable release checklist for alpha, beta, and stable releases. |
| [external-consumer-verification.md](external-consumer-verification.md) | Packed package consumer fixture and verification command. |
