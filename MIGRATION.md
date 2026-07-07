# Migration Guide

## 0.x Versions

The `0.x` API is unstable while Dravyn UI and the Universal Data Grid contract are being shaped.

Breaking changes may happen in minor releases before `1.0.0`, including changes to:

- public TypeScript types
- component props
- state shape
- core helper signatures
- CSS class names and variables

Consumers should pin exact versions during `0.x` adoption and review the changelog before upgrading.

## Native-First Direction

This package is intentionally native-first and lightweight. It does not depend on MUI, TanStack Table, TanStack Virtual, Redux, RTK Query, or other runtime frameworks.

Future migrations should preserve this direction unless a heavier dependency has a clear, documented justification.

## Early Namespace Alignment

Early local scaffolding used the placeholder package name `@your-org/ui-data-grid`.

The Dravyn-aligned package name is:

```txt
@dravyn/ui-data-grid
```

Update imports and CSS imports accordingly:

Before:

```tsx
import { UniversalDataGrid } from "@your-org/ui-data-grid";
import "@your-org/ui-data-grid/style.css";
```

After:

```tsx
import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import "@dravyn/ui-data-grid/style.css";
```
