# Documentation Compilation

This directory owns repository-internal documentation compilation for VyrnForge.

It sits between the Product Graph and presentation applications. Documentation tooling may combine product-unit guidance, public package metadata, executable examples, accessibility evidence, and other repository-derived facts into a framework-neutral documentation model. It does not own public page styling, framework runtime rendering, or component semantics.

## Rules

- Discover documentable product units through the Product Graph boundary in `tooling/product/`; do not maintain a second component inventory.
- Treat product-owned documentation and examples as authoring inputs, and public package exports as consumer-facing implementation truth.
- Keep compiled documentation models framework-neutral. Framework or Native presentation belongs in `apps/docs`.
- Do not import React, Angular, Vue, Custom Elements, or other framework runtimes into shared documentation compilation.
- Do not fabricate unsupported framework surfaces or package entrypoints.
- Prefer portable authored content. Presentation-specific markup and styling belong to the docs application.
- Executable examples must come from checked-in product-owned examples and use supported public surfaces.
- Repository accessibility metadata is evidence input, not an automatic compliance claim.
- This tooling is repository-only and must never become a runtime dependency of published VyrnForge packages.

## Current Phase

The documentation rollout is Native HTML-first. `native-documentation.mjs` currently compiles only Product Graph components that have a Web surface and a product-owned `docs/index.md`, beginning with Button. Components without rebuilt Native guidance remain unpublished rather than receiving placeholder pages. React, Angular, Vue, and Custom Elements documentation compilation is intentionally out of scope until the Native Web foundation is established.
