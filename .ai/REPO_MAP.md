# VyrnForge UI - Repo Map For AI

## Root

```txt
package.json
README.md
AGENTS.md
.ai/
docs/
packages/
examples/
```

## Packages

```txt
packages/ui-core/
packages/ui-behaviors/   # MF-5001–MF-5007 current
packages/ui-components/
packages/ui-elements/    # foundation current; public renderers after GMF2
packages/ui-data-grid/   # independent React alpha
```

## Documentation

Use `docs/README.md` as the canonical documentation entrypoint.

```txt
docs/README.md
docs/governance/
docs/architecture/
docs/roadmap/
docs/api/
docs/benchmark/
docs/metadata/
docs/archive/
docs/packages/
docs/react-docs/
docs/ai/
docs/templates/
docs/prompts/
tests/consumers/
```

## Where To Put Code

| Work                       | Location                                            |
| -------------------------- | --------------------------------------------------- |
| Shared tokens/themes       | `packages/ui-core`                                  |
| Framework-neutral behavior | `packages/ui-behaviors`                             |
| React component            | `packages/ui-components/src/components/<Component>` |
| Native Custom Element      | `packages/ui-elements`                              |
| Grid-specific behavior     | `packages/ui-data-grid` (deferred release track)    |
| Docs app example           | `examples/basic-playground` or future docs app      |
| Architecture docs          | `docs/architecture`                                 |
| Public API docs            | `docs/api`                                          |
| Component docs             | Component README plus docs app page                 |

## Before Creating New Docs

Read `docs/README.md` and `docs/governance/00-documentation-governance.md`.

Update canonical docs instead of creating duplicates. Archive outdated docs under `docs/archive/<yyyy-mm-topic>/`.
