# VyrnForge UI

VyrnForge is a reusable UI library and UI foundation for web applications.
VyrnForge itself owns the design system, component contracts, behavior model,
accessibility model, styling foundation, terminology, documentation, and
developer concepts.

Native HTML / Custom Elements, React, Angular, and Vue are **equal first-class
surfaces** over that shared VyrnForge product model. Current implementation
reuse between packages does not create a product hierarchy.

## Start here

1. Read [Project Source of Truth](governance/01-project-source-of-truth.md) for
   product scope and the framework-surface model.
2. [Install VyrnForge](api/import-and-setup.md) for your framework.
3. Browse the generated component reference for component usage and API.
4. Use [Theming and Styling](architecture/03-theming-and-styling.md) for tokens,
   themes, density, and CSS customization.
5. Use [Accessibility](architecture/05-accessibility-standards.md) for keyboard,
   focus, labeling, and semantic expectations.
6. Use
   [Releases and Migration](release/multi-framework-migration-and-limitations.md)
   when upgrading or choosing framework integration.

## Framework surfaces

- Native HTML / Custom Elements: `@vyrnforge/ui-elements`
- React: `@vyrnforge/ui-components`
- Angular: `@vyrnforge/ui-angular`
- Vue: `@vyrnforge/ui-vue`

These package names are distribution boundaries, not product hierarchy. In
particular, `@vyrnforge/ui-components` is the current React package name; the
canonical VyrnForge component model is framework-neutral.

## Data grid

Advanced capabilities sit below the common UI system rather than becoming
additional framework surfaces. Data Grid is the current example:
`@vyrnforge/ui-data-grid` is presently React-only alpha, but its long-term
architecture belongs to shared grid contracts and supported framework adapters.

## Customize VyrnForge

Prefer shared VyrnForge tokens, behaviors, components, contracts, and public
extension points before creating application-specific replacements. Keep product
business logic, routing, permissions, backend access, persistence, and
application state in the consuming application.

## Internal engineering docs

Internal architecture, governance, testing, CI/CD, release controls, metadata,
and generated evidence stay in the repository without becoming parallel public
documentation.

- [Documentation Governance](governance/documentation.md) owns documentation
  authority, lifecycle, cleanup, and generated-projection rules.
- [Trunk Delivery](governance/05-trunk-delivery.md) owns branch, PR, dependency,
  merge, and delivery topology.
- [Documentation Authoring](engineering/documentation-authoring.md) is the
  contributor workflow for public documentation.

Contributors should update canonical owners and generated inputs rather than
editing Docs application routes, sidebars, search indexes, or generated
registries as shortcuts.
