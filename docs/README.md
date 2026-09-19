# VyrnForge UI

VyrnForge is a reusable UI foundation for web applications. Native HTML / Custom Elements, React, Angular, and Vue are first-class surfaces over the same design system, behavior contracts, accessibility model, styling foundation, and component semantics.

## Start here

1. [Install VyrnForge](api/import-and-setup.md) for your framework.
2. Browse the generated component reference for component usage and API.
3. Use [Theming and Styling](architecture/03-theming-and-styling.md) for tokens, themes, density, and CSS customization.
4. Use [Accessibility](architecture/05-accessibility-standards.md) for keyboard, focus, labeling, and semantic expectations.
5. Use [Releases and Migration](release/multi-framework-migration-and-limitations.md) when upgrading or choosing between framework surfaces.

## Framework surfaces

| Surface     | Package                      | Use it when                                           |
| ----------- | ---------------------------- | ----------------------------------------------------- |
| React       | `@vyrnforge/ui-components` | Building a React application                          |
| Native HTML | `@vyrnforge/ui-elements`   | Using Custom Elements or a framework-neutral boundary |
| Angular     | `@vyrnforge/ui-angular`    | Building an Angular application                       |
| Vue         | `@vyrnforge/ui-vue`        | Building a Vue application                            |

The non-grid surfaces share VyrnForge foundations rather than becoming separate component libraries.

## Data grid

`@vyrnforge/ui-data-grid` is a specialized React package on its own alpha release track. It is part of VyrnForge, but it does not define the whole library and does not imply Angular, Vue, or Native grid renderers.

## Customize VyrnForge

Prefer shared VyrnForge tokens and public extension points before creating application-specific replacements. Keep product business logic, routing, permissions, backend access, and application state in the consuming application.

## Internal engineering docs

Architecture decisions, governance, testing, CI/CD, release controls, metadata, and generated evidence remain in the repository for maintainers. They are intentionally not part of the normal public documentation navigation.
