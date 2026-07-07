# @dravyn/ui-components

Native-first Dravyn UI component primitives built with React, TypeScript, and CSS variables.

## CSS

Import core tokens first, then component styles:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
```

`@dravyn/ui-components` uses shared `--dv-*` variables from `@dravyn/ui-core`. Override those tokens at an app shell or page boundary to theme all Dravyn components consistently.

## Components

```tsx
import {
  Button,
  TextInput,
  EmptyState
} from "@dravyn/ui-components";
```

Current primitives include:

- `Button`
- `IconButton`
- `Text`
- `Heading`
- `Badge`
- `Field`
- `TextInput`
- `SearchInput`
- `Select`
- `Checkbox`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `Skeleton`

The package depends on `@dravyn/ui-core` for shared token direction and keeps React/React DOM as peer dependencies.
