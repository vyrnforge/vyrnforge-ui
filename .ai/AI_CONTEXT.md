# VyrnForge AI Bootstrap

VyrnForge is a dependency-minimal, general-purpose web UI foundation with
enterprise-grade depth. It is one contract-driven system spanning design tokens,
reusable behavior, accessibility, framework integrations, components, patterns,
tooling, and optional advanced modules. It is not only a component package or a
data-grid library.

## Use the smallest context that can answer the task

Consumer-facing AI context is generated from canonical metadata. Do not begin a
normal UI task by loading the full documentation set.

1. Read `docs/generated/ai-context/index.json`.
2. If the user names a component, read only
   `docs/generated/ai-context/components/<id>.json`.
3. If the user describes a page/workflow, inspect the matching pattern slice under
   `docs/generated/ai-context/patterns/`, then read only the component slices it
   references.
4. If the component is unknown, inspect the smallest matching category slice under
   `docs/generated/ai-context/categories/` before opening component slices.
5. Expand into architecture, release, or governance Markdown only for cross-cutting
   design decisions, support claims, package changes, or policy work.

Local queries can use:

```bash
npm run query:ai-context -- --component button --framework react
npm run query:ai-context -- --pattern settings
npm run query:ai-context -- --search combobox
```

The deployed docs application exposes the same generated tree under
`ai-context/` so tools do not need to scrape rendered documentation.

## Current package model

| Package                    | Role                                                        | Track             |
| -------------------------- | ----------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | framework-neutral design tokens, themes, density, utilities | non-grid beta     |
| `@vyrnforge/ui-behaviors`  | framework-neutral controllers and interaction contracts     | non-grid beta     |
| `@vyrnforge/ui-components` | first-class React renderer                                  | non-grid beta     |
| `@vyrnforge/ui-elements`   | first-class Native HTML / Custom Elements renderer          | non-grid beta     |
| `@vyrnforge/ui-data-grid`  | specialized React data grid                                 | independent alpha |

React and Native HTML are current first-class renderer/package surfaces. Angular
and Vue are approved first-class targets and currently verified consumers of the
Custom Element contract; do not claim first-class Angular/Vue packages until their
distribution gates pass.

## Hard constraints

- Reuse or extend existing VyrnForge components, primitives, behaviors, tokens,
  contracts, patterns, generators, or packages before inventing UI.
- Keep shared foundations framework-neutral where practical; framework packages
  adapt shared contracts rather than becoming separate component libraries.
- Use `--vf-*` tokens and `vf-*` classes for shared styling. `--udg-*` / `udg-*`
  remain grid-specific compatibility surface unless deliberately generalized.
- Keep application state, business data, auth, permissions, routing, persistence,
  fetching, and backend workflows in consuming applications.
- Do not require Redux, Zustand, Pinia, NgRx, TanStack, MUI, Tailwind, Radix,
  shadcn/ui, Chakra, Ant Design, or similar large dependencies without approval.
- Do not deep-import package internals or infer public APIs from implementation
  details.
- Never invent a missing contract, framework package, support level, or maturity
  state. Canonical metadata wins.
- Accessibility, keyboard/focus behavior, i18n, responsive behavior, SSR safety,
  compatibility, and performance are core requirements.

## Escalation map

Use these only when the compact generated context is insufficient:

- product identity: `docs/governance/01-project-source-of-truth.md`
- package boundaries: `docs/architecture/01-package-boundaries.md`
- state ownership: `docs/architecture/02-state-and-adapter-ownership.md`
- styling: `docs/architecture/03-theming-and-styling.md`
- component contracts: `docs/architecture/09-component-contracts-and-events.md`
- Custom Elements/forms: `docs/architecture/10-custom-elements-and-form-association.md`
- current framework support: `docs/metadata/multi-framework.json`
- active G11-G15 gates: `docs/metadata/multi-framework-program-gates.json`
- release process: `docs/release/README.md`

For repository changes, run targeted checks while working and the current root
validation commands (`npm run check`, `npm run test`, `npm run build`, `npm run ci`)
as appropriate. Do not mark gates or capabilities complete without required
evidence.
