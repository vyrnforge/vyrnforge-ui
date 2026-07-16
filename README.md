# Dravyn UI

Dravyn UI is a native-first enterprise UI foundation for internal tools, admin portals, customer portals, data-heavy applications, and workflow systems.

This repository is not only a data-grid project. The data grid is one specialized package inside the broader Dravyn UI foundation.

## Packages

```txt
@dravyn/ui-core
@dravyn/ui-components
@dravyn/ui-data-grid
```

| Package | Role |
| --- | --- |
| `@dravyn/ui-core` | Shared tokens, themes, density, and utilities. |
| `@dravyn/ui-components` | Native React primitives and reusable application components. |
| `@dravyn/ui-data-grid` | Specialized enterprise data-management grid. |

## Documentation

The canonical documentation entrypoint is:

- [docs/README.md](docs/README.md)

Agent and AI context entrypoints:

- [AGENTS.md](AGENTS.md)
- [.ai/AI_CONTEXT.md](.ai/AI_CONTEXT.md)

Do not create competing source-of-truth documents. If a topic overlaps existing docs, update the canonical document listed in [docs/README.md](docs/README.md) or archive outdated material under `docs/archive/`.

## Development

```bash
npm install
npm run build
npm run typecheck
npm run test
npm run build:playground
npm run build:docs
npm run quality
```

Run the playground locally:

```bash
npm run dev:playground
```

Run the documentation app locally:

```bash
npm run dev:docs
```

The playground is for interactive component behavior examples. The docs app is a source-of-truth documentation viewer and AI-readable reference layer over the markdown docs.

## Dependency Policy

Dravyn UI should remain native-first and dependency-minimal.

Do not add MUI, TanStack, Redux, Radix, Tailwind, Headless UI, Emotion, styled-components, icon libraries, CSS frameworks, or other heavy runtime dependencies without explicit review and a written reason.
