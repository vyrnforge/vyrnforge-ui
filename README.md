# Dravyn UI

Dravyn UI is a native-first enterprise UI foundation for reusable application components.

The project started as a Universal Data Grid package, but the workspace is now structured for a broader UI system: shared core tokens, reusable component primitives, and data-heavy enterprise components.

## Packages

Current packages:

```txt
@dravyn/ui-core
@dravyn/ui-components
@dravyn/ui-data-grid
```

`@dravyn/ui-core` provides the shared token and theme foundation.
`@dravyn/ui-components` provides hardened native React primitives for actions, typography, forms, feedback, simple layout, and overlays.
`@dravyn/ui-data-grid` remains backward compatible with its `--udg-*` variables while aligning defaults to shared `--dv-*` tokens.

## Install

```bash
npm install @dravyn/ui-data-grid
```

Import the component and CSS:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
import {
  UniversalDataGrid
} from "@dravyn/ui-data-grid";
```

Recommended CSS import order:

1. `@dravyn/ui-core/styles/index.css`
2. `@dravyn/ui-components/styles/index.css`
3. `@dravyn/ui-data-grid/styles/index.css`

`ui-core` owns shared `--dv-*` tokens. `ui-components` consumes those shared variables directly. `ui-data-grid` keeps its backward-compatible `--udg-*` variables, but maps many defaults to `--dv-*` tokens when core CSS is present.

Global app theme override:

```css
.my-app {
  --dv-primary: #003b71;
  --dv-radius-md: 10px;
}
```

Grid-specific override:

```css
.my-app .udg {
  --udg-header-bg: #f8fafc;
  --udg-row-height: 42px;
}
```

## Development

```bash
npm install
npm run build
npm run typecheck
npm run test
npm run build:playground
```

Run the playground locally:

```bash
npm run dev:playground
```

The playground is organized into Overview, Core, Components, Data Grid, and Patterns sections. It uses simple React state routing and demonstrates shared theme tokens across primitives and the grid without adding a router dependency.

## Workspace Structure

```txt
docs/
packages/
  ui-core/
  ui-components/
  ui-data-grid/
examples/
  basic-playground/
```

## Documentation

The Dravyn UI documentation is the source of truth for project direction:

```txt
docs/00-project-charter.md
docs/01-naming-and-brand-system.md
docs/02-repository-and-package-architecture.md
docs/03-native-first-engineering-principles.md
docs/04-theme-system-spec.md
docs/05-component-system-roadmap.md
docs/06-universal-data-grid-spec.md
docs/07-data-grid-state-and-api-contract.md
docs/08-data-grid-implementation-roadmap.md
docs/09-build-release-upgrade-strategy.md
docs/10-playground-and-documentation-strategy.md
docs/11-quality-accessibility-test-strategy.md
docs/12-codex-master-implementation-prompt.md
docs/13-codex-repo-rebuild-prompt.md
```

## Dependency Policy

Dravyn UI should remain native-first and dependency-light.

Do not add MUI, TanStack, Redux, Radix, Tailwind, Headless UI, Emotion, styled-components, icon libraries, CSS frameworks, or other heavy runtime dependencies without review and a written reason.
