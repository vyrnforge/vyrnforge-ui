# Migration Guide

## 0.x Versions

The `0.x` API is unstable while the Universal Data Grid contract is being shaped.

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

