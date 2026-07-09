# Dravyn UI - Repo Map For AI

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
packages/ui-components/
packages/ui-data-grid/
```

## Documentation

Use `docs/README.md` as the canonical documentation entrypoint.

```txt
docs/README.md
docs/governance/
docs/architecture/
docs/roadmap/
docs/benchmark/
docs/metadata/
docs/archive/
docs/packages/
docs/react-docs/
docs/ai/
docs/templates/
docs/prompts/
```

## Where To Put Code

| Work | Location |
| --- | --- |
| Shared tokens/themes | `packages/ui-core` |
| Reusable component | `packages/ui-components/src/components/<Component>` |
| Grid-specific behavior | `packages/ui-data-grid` |
| Docs app example | `examples/basic-playground` or future docs app |
| Architecture docs | `docs/architecture` |
| Component docs | Component README plus docs app page |

## Before Creating New Docs

Read `docs/README.md` and `docs/governance/00-documentation-governance.md`.

Update canonical docs instead of creating duplicates. Archive outdated docs under `docs/archive/<yyyy-mm-topic>/`.
