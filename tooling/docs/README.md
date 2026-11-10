# Documentation Compilation

This directory owns repository-internal documentation compilation for VyrnForge.

It sits between the Product Graph and presentation applications. Documentation tooling combines product-unit guidance, public package metadata, executable examples, accessibility evidence, framework adaptations, and other repository-derived facts into normalized documentation models. It does not own public page styling, framework runtime rendering, or component semantics.

## Rules

- Discover component availability through the Product Graph boundary in `tooling/product/`; do not maintain a second component inventory.
- Scope a component catalog to the active framework surface and its real public package projection. Documentation-file presence is not component availability truth.
- Treat shared product-owned documentation as semantic guidance, framework-adjacent documentation as narrow adaptation guidance, and public package exports as consumer-facing implementation truth.
- Keep shared documentation compilation free of React, Angular, Vue, Elements, or other framework runtimes. Framework runtime rendering belongs in `apps/docs`.
- Do not fabricate unsupported framework surfaces or package entrypoints.
- Prefer portable authored content. Presentation-specific markup and styling belong to the docs application.
- Executable examples must come from checked-in product-owned examples and use supported public surfaces for the active framework.
- Repository accessibility metadata is evidence input, not an automatic compliance claim.
- Component showcase readiness and API/reference availability are different states. A public framework surface may have generated reference before complete authored showcase guidance.
- Foundations such as styling and tokens are separate documentation surfaces and should be linked from component pages instead of duplicated into every component.
- Public component browsing uses a consumer-facing documentation taxonomy (for example Forms & Inputs, Actions, Navigation, Layout, and Content & Media). Product Graph layers remain repository ownership metadata and must not define public navigation.
- The documentation taxonomy classifies already-discovered Product Graph components for presentation only. It must never become a second source of component availability or package truth.
- This tooling is repository-only and must never become a runtime dependency of published VyrnForge packages.

## Model

`framework-documentation.mjs` is the framework-neutral compiler boundary. It maps an active documentation framework to its Product Graph surface, discovers the framework-scoped component catalog, composes shared semantic content with optional framework-owned adaptation content, selects executable examples for that framework, and exposes separate showcase and API page models.

`native-documentation.mjs` adapts that shared model for the current Native Web renderer. It resolves public `@vyrnforge/web` CSS assets and Native foundation pages without redefining the component inventory.

Framework-specific authored adaptations may live with the corresponding product-unit framework surface as `docs/index.md` or `docs.md`. They supplement shared component guidance; they do not copy or fork it.

## Current Phase

The rollout remains Native HTML-first. Native Web is the first renderer and consumes semantic HTML plus public `@vyrnforge/web` AppShell, SideNav, control hooks, and canonical CSS. The underlying compiler model is now framework-scoped rather than Native-owned so future React, Angular, Vue, and Elements renderers can consume the same Product Graph catalog and standardized content slots while rendering through their own VyrnForge ports.

The Native documentation application exposes distinct Foundations, Component Showcase, and API Reference route families. The Component Showcase catalog is discovered from public Native Web Product Graph surfaces; complete showcase pages require shared authored guidance plus executable Native examples. API Reference remains available for every public Native Web component surface even when its showcase guidance is not yet complete.
