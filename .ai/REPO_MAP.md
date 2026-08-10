# VyrnForge UI - Repo Map For AI

## Root

```text
package.json
README.md
AGENTS.md
.ai/
docs/
packages/
apps/
examples/
tests/
scripts/
```

## Packages

```text
packages/ui-core/        # framework-neutral design foundation
packages/ui-behaviors/   # framework-neutral controllers and behavior
packages/ui-components/  # first-class React renderer
packages/ui-elements/    # first-class native Custom Element renderer
packages/ui-data-grid/   # independent React alpha data grid
```

## Documentation

Use `docs/README.md` as the canonical reader-oriented entrypoint.

```text
docs/api/           # public usage and API contracts
docs/architecture/  # package, state, styling, renderer, accessibility contracts
docs/governance/    # ownership, source-of-truth, metadata, repository governance
docs/release/       # release policy and publication
docs/roadmap/       # current planning
docs/quality/       # current limitations plus quality/evidence material
docs/testing/       # browser and consumer contracts/evidence
docs/metadata/      # structured catalogs and verification state
docs/generated/     # generated references
docs/archive/       # historical/replaced guidance
```

## Where code belongs

| Work                       | Location                    |
| -------------------------- | --------------------------- |
| Shared tokens/themes       | `packages/ui-core`          |
| Framework-neutral behavior | `packages/ui-behaviors`     |
| React components           | `packages/ui-components`    |
| Native Custom Elements     | `packages/ui-elements`      |
| Grid-specific behavior     | `packages/ui-data-grid`     |
| Human docs application     | `apps/docs`                 |
| Interactive examples       | `examples/basic-playground` |
| Consumer fixtures          | `tests/consumers`           |
| Browser verification       | `tests/browser`             |
| Repository automation      | `scripts`                   |
| Architecture docs          | `docs/architecture`         |
| Public API docs            | `docs/api`                  |

## Before creating docs

Read `docs/README.md` and
`docs/governance/00-documentation-governance.md`.

Update canonical docs instead of creating duplicates. Component status belongs
in `docs/metadata/components.json`; generated references derive from canonical
metadata.
