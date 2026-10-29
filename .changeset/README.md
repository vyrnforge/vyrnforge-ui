# Changesets

Changesets is the single source of package release intent, version calculation, dependency-range updates, and generated package changelogs for the current rebuild.

For a consumer-visible change, run `pnpm changeset`, select the affected publishable packages, choose `patch`, `minor`, or `major`, and write a reviewable summary. Preserve deprecation, compatibility, migration, and breaking-change context in that summary and the owning canonical documentation.

For repository-only work that intentionally changes no package contract, an empty Changeset is permitted:

```md
---
---

Internal repository tooling only; no package release intent.
```

Historical owner-local `changes/` fragments are provenance only and are not current release input. VyrnForge compatibility, migration, package-validation, and release-evidence requirements remain canonical project policy.
