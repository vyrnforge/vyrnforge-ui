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
   the product scope and surface model.
2. [Install VyrnForge](api/import-and-setup.md) for your framework.
3. Browse the generated component reference for component usage and API.
4. Use [Theming and Styling](architecture/03-theming-and-styling.md) for tokens,
   themes, density, and CSS customization.
5. Use [Accessibility](architecture/05-accessibility-standards.md) for keyboard,
   focus, labeling, and semantic expectations.
6. Use [Releases and Migration](release/multi-framework-migration-and-limitations.md)
   when upgrading or choosing framework integration.

## First-class surfaces

- Native HTML / Custom Elements: `@vyrnforge/ui-elements`
- React: `@vyrnforge/ui-components`
- Angular: `@vyrnforge/ui-angular`
- Vue: `@vyrnforge/ui-vue`

These package names are current distribution details. They do not assign product
ownership. In particular, `@vyrnforge/ui-components` is the current React
package name; the canonical VyrnForge component model is framework-neutral.

## Advanced UI modules

Advanced capabilities are VyrnForge modules below the common UI system, not
additional framework surfaces.

Data Grid is the current example. `@vyrnforge/ui-data-grid` is presently a
React-only alpha implementation, but Data Grid conceptually belongs to the
advanced-module layer and should evolve through shared grid contracts plus
supported Native, React, Angular, and Vue integrations when that work is
explicitly prioritized.

## Customize VyrnForge

Prefer shared VyrnForge tokens, behaviors, components, contracts, and public
extension points before creating application-specific replacements. Keep product
business logic, routing, permissions, backend access, persistence, and
application state in the consuming application.

## Internal engineering docs

Architecture decisions, governance, testing, CI/CD, release controls, metadata,
and generated evidence remain in the repository for maintainers. They are
intentionally not part of the normal public documentation navigation.
