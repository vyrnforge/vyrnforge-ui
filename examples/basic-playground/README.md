# VyrnForge Playground

This Vite application is VyrnForge's human-facing exploration surface. It shows
how developers compose the library into real application UI using public package
APIs.

## Purpose

The playground answers practical consumer questions:

- What can I build with VyrnForge?
- Which component or pattern fits this task?
- What does it look and behave like across themes and densities?
- Which package and framework consumption path should I use today?
- Can I edit and copy a working example?
- What related components, accessibility requirements, and limitations matter?

Component maturity, package identity, framework support, and reusable pattern
descriptions come from `docs/generated/consumer-knowledge.json`. That generated
projection derives from canonical metadata; the playground must not maintain a
second support or maturity table.

Human-authored live examples are allowed because they demonstrate composition and
interaction, but they must use public VyrnForge APIs and remain verified by the
playground build/browser checks.

## Information architecture

- **Foundations** — shared tokens, themes, density, and styling extension points.
- **Components** — focused interactive component references and editable examples.
- **Patterns** — reusable application compositions such as forms, settings,
  resource lists, details, assignments, and application shells.
- **Advanced Modules** — optional specialized packages such as the independently
  released React data grid.
- **Internal QA** — stress matrices and torture cases remain addressable for
  engineering tests but are intentionally excluded from normal public navigation.

The docs application is the source-of-truth / AI-context inspector. AI tools should
consume the generated task-scoped files under `docs/generated/ai-context/` rather
than scrape the playground.

## Component pages

`ComponentDemoPage` owns the common component reference layout. `LiveExample`
evaluates trusted editable JSX examples in a restricted VyrnForge scope. Import
blocks are read-only; copied code combines the verified import with current example
source.

Do not duplicate package component styling in playground CSS. Playground styles
are limited to documentation layout, preview framing, responsive behavior, and
editor presentation.

## Run

From the repository root:

```bash
npm run dev:playground
npm run build:playground
```

Package CSS is consumed in the recommended order: core, components, then optional
module CSS such as the data grid.
