# Dravyn UI Documentation Pack

Dravyn UI is the native-first enterprise UI foundation that started from the Universal Data Grid project.

The name is dragon-inspired without making the product feel like a game asset. It is intended to feel strong, technical, and reusable across enterprise applications.

## Recommended repository name

```txt
 dravyn-ui
```

## Recommended package namespace

```txt
@dravyn/ui-core
@dravyn/ui-components
@dravyn/ui-data-grid
```

## What this pack contains

```txt
docs/
  project/
    00-project-charter.md
    01-naming-and-brand-system.md
    02-repository-and-package-architecture.md
    03-native-first-engineering-principles.md
    09-build-release-upgrade-strategy.md
    11-quality-accessibility-test-strategy.md
  ui/
    04-theme-system-spec.md
    10-playground-and-documentation-strategy.md
  component-system/
    05-component-system-roadmap.md
  data-grid/
    06-universal-data-grid-spec.md
    07-data-grid-state-and-api-contract.md
    08-data-grid-implementation-roadmap.md
  prompts/
    12-codex-master-implementation-prompt.md
    13-codex-repo-rebuild-prompt.md
```

## Intended direction

The project should not remain only a custom data table. The data grid is the first strategic component, but the long-term target is a reusable native-first UI system:

```txt
Dravyn UI
  ui-core        theme, tokens, density, utilities
  ui-components  primitives and reusable app components
  ui-data-grid   advanced enterprise data grid
```

## Recommended next step

Use `docs/prompts/13-codex-repo-rebuild-prompt.md` to align your repository documentation, package names, and project direction around Dravyn UI without breaking the current implementation.
