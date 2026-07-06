# Universal Data Grid Documentation Pack

This pack defines a reusable, enterprise-grade Universal Data Grid for React + Redux applications.

Recommended placement in each project:

```text
docs/ui/universal-data-grid/
```

Recommended implementation package path in a monorepo:

```text
packages/ui-data-grid/
```

Recommended app usage path when not using a package yet:

```text
src/shared/data-grid/
```

## Files

1. `docs/ui/universal-data-grid/00-universal-data-grid-master-spec.md`
   - Product and engineering specification.

2. `docs/ui/universal-data-grid/01-package-build-reuse-upgrade-guide.md`
   - How to compile, package, reuse, version, and upgrade across projects.

3. `docs/ui/universal-data-grid/02-api-contract-and-state-model.md`
   - TypeScript API contracts, state model, data source contract, exporter contract.

4. `docs/ui/universal-data-grid/03-implementation-requirements-and-phases.md`
   - Build phases, acceptance criteria, test requirements, and implementation checklist.

5. `docs/ui/universal-data-grid/04-codex-implementation-prompt.md`
   - Ready-to-use Codex prompt for implementation.

6. `docs/ui/universal-data-grid/05-integration-examples.md`
   - Example install, provider setup, client mode usage, server mode usage, and exporter usage.

## Recommended stack

- React
- TypeScript
- Redux Toolkit
- RTK Query for server fetching where needed
- TanStack Table
- TanStack Virtual
- MUI Material components for shell and controls
- Vite library mode or tsup for compilation
- Storybook for component verification
- Vitest + React Testing Library for tests

## Primary goal

Create one reusable grid foundation that can support:

- Resource list pages
- Admin tables
- Searchable catalogs
- Report preview tables
- Export-driven data views
- Future analytics/report builder workflows
