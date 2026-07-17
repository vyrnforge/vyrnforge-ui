# Public Vs Internal API

This document defines what consuming apps may rely on.

## Public API

Public API includes:

- package entry exports from `@vyrnforge/ui-core`
- package entry exports from `@vyrnforge/ui-components`
- package entry exports from `@vyrnforge/ui-data-grid`
- documented React components
- documented component props and exported types
- documented CSS variables
- documented CSS import paths
- documented data-grid state contracts
- documented persistence, server-query, and export-request adapter contracts
- documented metadata JSON files under `docs/metadata/`

If an API is exported but not documented yet, treat it as available but verify package docs and metadata before using it in new product code.

## Internal API

Internal API includes:

- private helper files
- non-exported hooks
- non-exported utilities
- implementation details inside `src/components`, `src/core`, `src/hooks`, and `src/adapters`
- internal class names not documented in `css-class-reference.md`
- test utilities
- generated build output
- docs-app-only classes such as `dv-docs-*`

Internal APIs may change without a compatibility guarantee.

## Agent Rules

- Before using a VyrnForge component, check API docs and metadata.
- Do not import from deep internal package paths unless explicitly asked.
- Do not use undocumented internal APIs as app contracts.
- If a needed API is missing, document the gap and add it in a dedicated implementation task.
