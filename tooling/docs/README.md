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

## Product-owned example placement

An executable example's `example.json` may declare an optional `documentationSection` matching an exact shared `##` heading in that product unit's `docs/index.md`. This is a framework-neutral **content association**, not a second component inventory, a framework runtime contract or a new API surface. The documentation compiler exposes the association with the existing verified framework-specific example and rejects targets that are missing from the shared authored guidance.

The Native renderer uses a first unassigned example as a quick-start usage preview, places examples with an associated section alongside that section's explanation, and keeps any additional unassigned examples in the remaining examples gallery. Each example is rendered once, from its checked-in framework-specific source. Product units without placement metadata keep their existing behavior. Do not infer or hardcode a section from a component name or filename, and do not fabricate a preview when the selected port has no executable source.

This metadata describes **where** a verified example is shown, not the example's behavior or which framework ports are supported. Those remain owned by product-unit guidance, framework adapters and public package evidence.

## Metadata-driven accessibility standards

Product units own their existing `accessibility.json` beside their implementation and shared guide. No Button-specific documentation markup, per-route standards list, or separate visual metadata file is required. `framework-documentation.mjs` compiles the product evidence into `standardReferences` via the pure, framework-neutral `standard-references.mjs` projection.

The Native docs application renders **one shared accessibility evidence section** automatically on every product-backed showcase, guide-only pattern, and individual API page when that page carries accessibility metadata. The compact header keeps authoritative W3C/WHATWG standards visible and uses native `details/summary` to reveal mapped criterion links. These remain operable without JavaScript and are styled with VyrnForge Web tokens/CSS. Catalogs, gateway pages, and foundations have no product-unit accessibility evidence by default, so they do not fabricate an equivalent component claim.

The projection recognizes the HTML/native baselines and WCAG 2.2 criterion IDs currently present in repository metadata. Known references open precise official standards or informative WCAG Understanding pages. Unrecognized references remain readable metadata with no invented deep link; the shared reference catalog can be extended independently of individual pages. A `review-required` metadata status appears explicitly as review pending. Metadata represents an **intent/evidence mapping**, never a certification, maturity promotion, or proof that the user-facing product passes WCAG. Adding a new product unit's metadata automatically participates in this layout wherever an actual public documentation page exists.

Future React/Angular/Vue/Elements renderers should consume the **same `standardReferences` model** while using their own idiomatic rendering and the common styling contract; do not copy the native HTML renderer into other framework runtimes.

## Current Phase

The rollout remains Native HTML-first. Native Web is the first renderer and consumes semantic HTML plus public `@vyrnforge/web` AppShell, SideNav, control hooks, and canonical CSS. The underlying compiler model is now framework-scoped rather than Native-owned so future React, Angular, Vue, and Elements renderers can consume the same Product Graph catalog and standardized content slots while rendering through their own VyrnForge ports.

The Native documentation application exposes distinct Foundations, Component Showcase, and API Reference route families. The Component Showcase catalog is discovered from public Native Web Product Graph surfaces; complete showcase pages require shared authored guidance plus executable Native examples. API Reference remains available for every public Native Web component surface even when its showcase guidance is not yet complete.
