# System Overview

## Package architecture

```txt
@vyrnforge/ui-core
  tokens
  themes
  density
  utility classes

@vyrnforge/ui-components
  depends on ui-core
  reusable native React primitives
  forms, actions, overlays, feedback, layout

@vyrnforge/ui-data-grid
  depends on ui-core and ui-components
  UniversalDataGrid
  grid state/core/adapters
  data-management workflows
```

## Dependency direction

Allowed:

```txt
ui-components -> ui-core
ui-data-grid -> ui-core
ui-data-grid -> ui-components
```

Forbidden:

```txt
ui-core -> ui-components
ui-core -> ui-data-grid
ui-components -> ui-data-grid
```

## Design logic

The architecture separates:

| Layer | Owns |
| --- | --- |
| Core | tokens, CSS variables, shared utilities |
| Components | reusable React UI primitives |
| Data grid | specialized data-management behavior |
| App | data fetching, auth, permissions, business workflows |

## Why this matters

This keeps VyrnForge:

- reusable across different products
- easy to theme
- not locked into Redux/MUI/TanStack/Tailwind
- easier for AI agents to navigate
- easier to upgrade without copy-paste divergence
