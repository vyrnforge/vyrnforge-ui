# Release Policy

VyrnForge UI releases must be explicit, reviewable, and source-of-truth oriented. The current project status is pre-alpha: APIs may change, public npm publication has not started, and licensing approval remains a mandatory gate before publication.

The `latest` npm tag must not point to unfinished alpha packages.

## Maturity stages

| Stage | Audience | API stability | Breaking changes | Migration notes | Production use | Support | Documentation | Consumer validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pre-alpha | Maintainers and invited reviewers | Unstable | Allowed when documented in review context | Required for broad public API moves; optional for internal-only work | Not ready | Best effort only | Source-of-truth docs should stay accurate for current work | Local package builds, docs, playground, and package-consumer checks where relevant |
| Alpha | Early adopters who accept churn | Experimental public APIs | Allowed in prerelease versions | Required for public API, CSS, behavior, or import changes | Not recommended for production | Best effort, no SLA | Installation, import, component, grid, and known-limit docs must match the alpha | External package-consumer fixture and at least one real app validation before publication |
| Beta | Adopters validating near-final APIs | Mostly stable | Avoid unless needed for correctness, accessibility, or security | Required for every breaking change | Limited validation use only | Best effort, no SLA | API, migration, examples, and release notes must be complete enough for validation | Consumer fixture, docs build, playground build, accessibility review, and real app validation |
| Stable 0.x | Consumers accepting minor-version breaking changes | Stable within patch releases | Allowed in minor versions only with migration notes | Required for any public behavior or API break | Case-by-case; not a blanket production recommendation | Best effort unless a future policy says otherwise | Public API docs, changelog, and migration notes are mandatory | Package installation and integration validation before release |
| 1.x stable | General consumers after explicit approval | Stable SemVer public API | Only in major versions except security exceptions | Required before release | May be suitable only after separate readiness approval | Defined by the support policy in effect at that time; no SLA is promised here | Complete public docs, examples, migration notes, and known limitations | Consumer fixture, real application validation, docs/playground, and release checklist completion |

## Gates

- Licensing approval is required before any public package publication.
- Security and internal-content review must pass before public release artifacts are published.
- Release notes and changelog entries must describe user-visible changes without inventing stability claims.
- Package publication must use prerelease npm tags until a stable release is explicitly approved.
