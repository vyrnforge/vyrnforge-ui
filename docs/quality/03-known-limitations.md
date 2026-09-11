# Known Limitations

This document summarizes current release-level limitations without duplicating the per-component catalog.

## Prerelease maturity

VyrnForge packages remain prerelease. A package's `beta` or `alpha` channel does not automatically promote every component to stable maturity.

Canonical component maturity, evidence, and component-specific limitations live in [`../metadata/components.json`](../metadata/components.json). Use that catalog and the public API docs when evaluating a specific component.

## Framework boundaries

- Native HTML / Custom Elements, React, Angular, and Vue are first-class non-grid surfaces over the same VyrnForge design, behavior, accessibility, and styling model.
- Angular and Vue packages are thin facades over canonical Custom Elements and shared contracts where practical; first-class support does not require independent component implementations.
- Angular Forms and Vue model integrations translate framework conventions into shared VyrnForge contracts. They are not generic business-form frameworks.
- `@vyrnforge/ui-data-grid` remains React-only on its independent alpha track. Non-grid multi-framework support does not imply data-grid parity.
- Mobile-native platforms are outside the current web support model.

## Browser and server boundaries

Package-root server-safe import and bundler compatibility do not mean browser-only Custom Element internals are server-rendered. Native element lifecycle, form association, and browser DOM behavior execute in browser contexts.

## Application ownership

VyrnForge does not own application authentication, authorization, routing, backend data fetching, tenant state, business workflows, or a required global store. Framework- or product-specific integrations remain consuming-application responsibilities unless a reusable VyrnForge abstraction is deliberately approved.

## Stability decisions

Before stable promotion, use the component maturity model, current evidence, migration policy, and real consumer feedback rather than inferring stability from package-channel names alone.
