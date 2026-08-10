# Release Documentation

This directory is the source of truth for VyrnForge release governance.

VyrnForge maintains two explicit prerelease tracks:

- the synchronized non-grid `beta` group contains `ui-core`, `ui-behaviors`,
  `ui-components`, and `ui-elements`;
- `ui-data-grid` remains independently versioned on the `alpha` track.

Publication uses one manually dispatched release workflow. It verifies a
successful current-main CI candidate, creates and verifies immutable package
tarballs once, waits for protected publication approval, publishes the exact
retained tarballs through npm OIDC, verifies the public registry and provenance,
then records the Git tag and GitHub prerelease.

A registry-managed `latest` tag is not a VyrnForge stability signal while
packages remain prerelease.

## Canonical release docs

| Document                                                                                     | Purpose                                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [release-policy.md](release-policy.md)                                                       | Release maturity stages and expectations.                                            |
| [versioning-policy.md](versioning-policy.md)                                                 | Release groups, exact repository versions, prerelease tags, and compatibility rules. |
| [publication-procedure.md](publication-procedure.md)                                         | The single controlled publication progression.                                       |
| [release-responsibility-matrix.md](release-responsibility-matrix.md)                         | CI, package, deployment, npm, registry, and release-record ownership.                |
| [deprecation-and-migration-policy.md](deprecation-and-migration-policy.md)                   | Deprecation, compatibility, migration, and removal rules.                            |
| [multi-framework-migration-and-limitations.md](multi-framework-migration-and-limitations.md) | Framework selection, integration boundaries, guarantees, and limitations.            |
| [release-readiness-checklist.md](release-readiness-checklist.md)                             | Reusable prerelease/stable release readiness checklist.                              |
| [external-consumer-verification.md](external-consumer-verification.md)                       | Packed package consumer verification.                                                |
| [beta-package-artifact-verification.md](beta-package-artifact-verification.md)               | Tarball payload and entrypoint verification.                                         |
| [beta-package-size-budgets.md](beta-package-size-budgets.md)                                 | Package-size budget policy.                                                          |
| [security-workflow-hardening.md](security-workflow-hardening.md)                             | Release/security workflow boundaries.                                                |
| [trusted-publishing-provenance.md](trusted-publishing-provenance.md)                         | Trusted publishing, provenance, and external evidence.                               |

Release-specific evidence is retained under `release/evidence/` and is
historical/audit material rather than an alternative release procedure.
