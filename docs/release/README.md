# Release Documentation

This directory is the source of truth for VyrnForge UI release governance.

VyrnForge UI maintains two explicit prerelease tracks. The synchronized
`non-grid-beta` group contains `ui-core`, `ui-behaviors`, `ui-components`, and
`ui-elements`; `ui-data-grid` remains independently versioned on the alpha
track. Publication uses the manually dispatched trusted-publishing workflow,
the protected `npm-release` environment, registry verification, and automated
Git tag plus GitHub prerelease creation.

The selected release-group manifest and prerelease dist-tag are authoritative.
An npm-managed `latest` tag is not a stability signal while packages remain in
prerelease.

| Document                                                                                     | Purpose                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [release-policy.md](release-policy.md)                                                       | Maturity stages and expectations from pre-alpha through 1.x stable.                                               |
| [versioning-policy.md](versioning-policy.md)                                                 | BT-8002 release groups, exact prerelease versions, identifiers, dependency alignment, and compatibility rules.    |
| [publication-procedure.md](publication-procedure.md)                                         | Controlled OIDC publication, registry verification, and release-record procedure.                                 |
| [release-responsibility-matrix.md](release-responsibility-matrix.md)                         | Workflow, package, deployment, npm, registry, and release-record responsibilities.                                |
| [deprecation-and-migration-policy.md](deprecation-and-migration-policy.md)                   | Deprecation, compatibility, migration, and removal rules.                                                         |
| [multi-framework-migration-and-limitations.md](multi-framework-migration-and-limitations.md) | React versus native-element selection, Angular/Vue integration, beta guarantees, exclusions, and migration paths. |
| [release-readiness-checklist.md](release-readiness-checklist.md)                             | Reusable release checklist for alpha, beta, and stable releases.                                                  |
| [external-consumer-verification.md](external-consumer-verification.md)                       | Packed package consumer fixture and verification command.                                                         |
| [beta-package-artifact-verification.md](beta-package-artifact-verification.md)               | BT-8003 tarball payload, public entry-point, offline-install, report, and cleanup verification.                   |
| [beta-package-size-budgets.md](beta-package-size-budgets.md)                                 | BT-8004 package, JavaScript, declaration, and CSS growth budgets plus temporary waiver governance.                |
| [security-workflow-hardening.md](security-workflow-hardening.md)                             | BT-8006 dependency, CodeQL, workflow-lint, permission, and protected-gate controls.                               |

The executable BT-8005 environment matrix is documented in
[`docs/testing/compatibility-release-matrix.md`](../testing/compatibility-release-matrix.md).
