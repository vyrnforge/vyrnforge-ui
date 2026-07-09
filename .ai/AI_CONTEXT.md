# Dravyn UI - AI Context

## Project Identity

Dravyn UI is a native-first enterprise UI foundation for internal tools, admin portals, customer portals, data-heavy applications, and workflow systems.

It is not only a data-grid package.

Use `docs/README.md` as the canonical documentation entrypoint.

## Packages

| Package | Owns |
| --- | --- |
| `@dravyn/ui-core` | tokens, themes, density, utilities |
| `@dravyn/ui-components` | reusable native React components |
| `@dravyn/ui-data-grid` | UniversalDataGrid and grid-specific behavior |

## Canonical Docs

| Topic | Source |
| --- | --- |
| Project identity | `docs/governance/01-project-source-of-truth.md` |
| Package boundaries | `docs/architecture/01-package-boundaries.md` |
| State and Redux policy | `docs/architecture/02-state-and-adapter-ownership.md` |
| Styling and themes | `docs/architecture/03-theming-and-styling.md` |
| Clean code boundaries | `docs/architecture/04-clean-code-boundaries.md` |
| Roadmap | `docs/roadmap/00-master-roadmap.md` |
| Component inventory | `docs/roadmap/01-component-inventory.md` |
| Public API usage | `docs/api/README.md` |
| Benchmarks | `docs/benchmark/` |
| AI-readable metadata | `docs/metadata/` and `.ai/COMPONENT_MAP.json` |

## Hard Rules

- Do not add Redux/Zustand/TanStack state inside Dravyn packages.
- Do not add MUI, AntD, Tailwind, Radix, Headless UI, styled-components, Emotion, or icon libraries by default.
- Keep native React + TypeScript + CSS.
- Keep static visual styling in CSS, not TSX.
- Use `--dv-*` tokens for shared design.
- Use `--udg-*` variables only for grid-specific styling.
- Do not store row data in grid state.
- Do not fetch data inside the grid package.
- Do not generate export files inside the grid package by default.
- Before using a Dravyn component, token, grid contract, or adapter, check `docs/api/` and `docs/metadata/`.
- Do not use undocumented internal APIs unless explicitly asked.
- Archive outdated docs under `docs/archive/<yyyy-mm-topic>/` instead of leaving duplicate guidance in place.
- Update `docs/metadata/` and `.ai/COMPONENT_MAP.json` when public components, package entry points, CSS imports, state contracts, or AI usage rules change.

## Dependency Direction

Allowed:

- `ui-components -> ui-core`
- `ui-data-grid -> ui-core`
- `ui-data-grid -> ui-components`

Forbidden:

- `ui-core -> ui-components`
- `ui-components -> ui-data-grid`

## Required Validation

Run after implementation changes:

```bash
npm run build
npm run typecheck
npm run test
npm run build:playground
```

For documentation-only changes, validate file placement, links, and `git diff --check`.
