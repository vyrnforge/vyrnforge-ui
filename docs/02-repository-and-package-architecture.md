# 02 — Repository and Package Architecture

## Repository strategy

Use one standalone repository for the UI foundation:

```txt
dravyn-ui/
```

Do not store this as a subfolder inside IAM, Atlas, ITSM, or any single application.

This project should be independently versioned and consumed by multiple applications.

## Recommended repository structure

```txt
dravyn-ui/
  docs/
    00-project-charter.md
    01-naming-and-brand-system.md
    02-repository-and-package-architecture.md
    03-native-first-engineering-principles.md
    04-theme-system-spec.md
    05-component-system-roadmap.md
    06-universal-data-grid-spec.md
    07-data-grid-state-and-api-contract.md
    08-data-grid-implementation-roadmap.md
    09-build-release-upgrade-strategy.md
    10-playground-and-documentation-strategy.md
    11-quality-accessibility-test-strategy.md
    12-codex-master-implementation-prompt.md
    13-codex-repo-rebuild-prompt.md

  packages/
    ui-core/
    ui-components/
    ui-data-grid/

  examples/
    basic-playground/
    data-grid-playground/
    component-playground/

  package.json
  tsconfig.base.json
  CHANGELOG.md
  MIGRATION.md
  CONTRIBUTING.md
  README.md
```

## Current transition structure

If the current repository only has `packages/ui-data-grid`, keep it working first.

Recommended transition:

```txt
Phase A
  packages/ui-data-grid only

Phase B
  add Dravyn UI planning docs

Phase C
  add packages/ui-core

Phase D
  add packages/ui-components

Phase E
  optionally refactor ui-data-grid to consume ui-core/ui-components
```

Do not prematurely break the data grid while extracting shared components.

## Package responsibilities

### @dravyn/ui-core

Contains shared foundation only:

* theme tokens
* CSS variables
* density tokens
* variants
* utility types
* shared CSS utilities
* minimal helpers

It should not contain complex application components.

### @dravyn/ui-components

Contains general reusable UI components:

* Button
* IconButton
* Typography
* Field
* TextInput
* Select
* Checkbox
* Popover
* Menu
* Dialog
* Drawer
* Badge
* EmptyState
* ErrorState
* LoadingState
* Panel
* Card
* PageHeader

### @dravyn/ui-data-grid

Contains data grid-specific behavior:

* UniversalDataGrid
* grid state contracts
* column management
* header controls
* row selection
* grouping
* server query model
* export request contract
* saved view contracts
* grid-specific CSS

## Dependency direction

Allowed long-term dependency direction:

```txt
ui-data-grid -> ui-components -> ui-core
```

Forbidden dependency direction:

```txt
ui-core -> ui-components
ui-core -> ui-data-grid
ui-components -> ui-data-grid
```

## Runtime dependency policy

Default runtime dependencies should be minimal.

Allowed default peer dependencies:

```txt
react
react-dom
```

Avoid adding required runtime dependencies unless strongly justified.

## Package naming

Recommended package names:

```json
{
  "name": "@dravyn/ui-data-grid"
}
```

Later:

```json
{
  "name": "@dravyn/ui-core"
}
```

```json
{
  "name": "@dravyn/ui-components"
}
```

## Workspace configuration

Root package example:

```json
{
  "name": "dravyn-ui-workspace",
  "private": true,
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
  "scripts": {
    "build": "npm -ws run build",
    "typecheck": "npm -ws run typecheck",
    "test": "npm -ws run test",
    "build:playground": "npm -w examples/basic-playground run build"
  }
}
```

## Publishing strategy

Start private.

Recommended release options:

* npm pack for local testing
* GitHub Packages for private internal packages
* private npm registry later

Do not publish publicly until APIs are stable and names are reviewed.
