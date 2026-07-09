# React Documentation App Spec

## Purpose

The React docs app should serve two audiences:

1. humans reviewing and using Dravyn components
2. AI agents learning the library structure, APIs, examples, and constraints

The docs app should not be only a data-grid playground.

## Recommended app structure

```txt
apps/docs/
  src/
    app/
      DocsApp.tsx
      DocsShell.tsx
      DocsNav.tsx
      routes.ts
    pages/
      overview/
      core/
      components/
      data-grid/
      patterns/
      ai/
    examples/
    data/
    styles/
```

If keeping `examples/basic-playground`, it should evolve toward this structure.

## Main sections

| Section | Purpose |
| --- | --- |
| Overview | project positioning, package roles, install/import |
| Core | tokens, themes, density, utilities |
| Components | per-component examples and API notes |
| Data Grid | grid scenarios and workflows |
| Patterns | real enterprise screens using multiple components |
| AI | AI usage guide, component map, task prompts |

## Docs app requirements

Each example page should include:

- title
- purpose
- package imports
- live example
- code snippet
- prop notes
- accessibility notes
- AI usage notes
- related components

## Dogfooding rule

The docs app must consume Dravyn UI for common UI primitives.

- Use `@dravyn/ui-components` for buttons, badges, cards, panels, inputs, selects, empty states, alerts, headings, and text.
- Keep docs app CSS limited to documentation layout, sidebar layout, markdown presentation, metadata master-detail layout, responsive layout, and code block presentation.
- Do not create a second docs-only design system with custom generic cards, badges, buttons, inputs, panels, or alerts.
- If a missing primitive is needed, prefer adding it to `@dravyn/ui-components` in a dedicated component sprint instead of building a reusable replacement inside `apps/docs`.

## Do not do

- Do not make every example a table.
- Do not hide package import requirements.
- Do not create examples that depend on app-specific data/auth.
- Do not require external UI frameworks.
