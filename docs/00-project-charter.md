# 00 — Dravyn UI Project Charter

## Project name

**Dravyn UI**

## Project purpose

Dravyn UI is a native-first enterprise UI foundation for reusable application components.

The project began as a reusable Universal Data Grid, but the intended scope is broader:

* shared design tokens
* light/dark/enterprise themes
* compact enterprise interaction patterns
* reusable application primitives
* advanced data management components
* optional future workflow and reporting components

The goal is not to build a decorative UI library. The goal is to build reusable, maintainable, enterprise-grade components that can be used across multiple internal and customer-facing applications.

## Target applications

Dravyn UI should be reusable across:

* IAM applications
* ITAM applications
* ITSM applications
* Atlas Intelligence Platform
* Gateway / reverse proxy admin UI
* Admin portals
* Customer portals
* Reporting and exporter screens
* Operational workspaces
* Internal tools

## Product philosophy

Dravyn UI should prioritize:

1. clarity
2. speed of work
3. consistency
4. accessibility
5. maintainability
6. scalability
7. extensibility
8. visual polish without unnecessary decoration

## Native-first principle

The default implementation should use:

```txt
React
TypeScript
Native HTML
Scoped CSS
CSS variables
Small pure utilities
```

The default implementation should avoid:

```txt
MUI
TanStack Table
Redux as internal dependency
Tailwind
Radix as required dependency
Headless UI as required dependency
Emotion
styled-components
icon libraries
large runtime dependencies
```

This does not mean other apps cannot use those technologies. It means Dravyn UI should not force every consuming app to adopt them.

## Strategic component priority

The Universal Data Grid remains the first strategic component because enterprise software is data-heavy.

However, the project should evolve into a component system with:

* theme system
* typography
* buttons
* forms
* overlays
* navigation
* feedback states
* data display primitives
* data management patterns
* workflow components

## Success criteria

Dravyn UI is successful when:

* one package can be upgraded across multiple products
* common UI behavior is consistent
* components are compact and enterprise-ready by default
* teams do not repeatedly rebuild the same table, menu, input, badge, and empty-state patterns
* project-specific styling can be applied through tokens and theme overrides
* components remain accessible and keyboard usable
* components remain easy to test and reason about
