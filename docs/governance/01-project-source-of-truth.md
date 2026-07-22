# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a **native-first enterprise UI foundation** for internal tools,
admin portals, customer portals, data-heavy applications, and workflow systems.
It is not only a data-grid package and it is no longer architected as a
React-only library.

The first multi-framework beta focuses on all public non-grid components:

- first-class React components;
- first-class native HTML Custom Elements;
- verified Angular and Vue consumption;
- framework-neutral behavior contracts;
- shared design tokens and CSS-variable styling.

## Package roles

| Package                    | Role                                                                                 | Release direction           |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities | Non-grid beta               |
| `@vyrnforge/ui-behaviors`  | Planned framework-neutral component controllers and state rules                      | Non-grid beta               |
| `@vyrnforge/ui-components` | First-class React renderer                                                           | Non-grid beta               |
| `@vyrnforge/ui-elements`   | Planned native Custom Element renderer                                               | Non-grid beta               |
| `@vyrnforge/ui-data-grid`  | Existing specialized React data-grid package                                         | Independent alpha; deferred |

## Framework support policy

React and native HTML are first-class target renderers. Angular and Vue become
officially supported only after clean consumer and browser evidence passes
GMF4. Mobile-native platforms are outside this web beta program.

Architecture examples and fixtures are not support claims.

## Principles

- Native-first and browser-standards-oriented.
- CSS-variable theming with `--vf-*` shared tokens.
- Dependency-minimal.
- Store-agnostic.
- Framework-neutral behavior where reuse is valuable.
- Thin idiomatic renderer adapters.
- Controlled and uncontrolled state contracts.
- Light DOM by default.
- Accessibility by default.
- Enterprise density and data-management strength.
- Documentation and metadata as one source of truth.

## Non-goals

VyrnForge does not aim to be:

- a Material or Ant Design clone;
- a Tailwind, Radix, or TanStack wrapper;
- a required Redux framework;
- four independent framework-specific implementations;
- a React application embedded inside Angular or Vue;
- a mobile-native cross-platform renderer in the first beta;
- a spreadsheet, BI pivot, chart, or report-generation platform.

## Beta north star

VyrnForge should publish the smallest credible multi-framework enterprise UI
foundation that can build complete non-grid application surfaces without
forcing teams into a large third-party design system. The data grid can mature
on its own release track after that foundation is released.
