# Framework documentation apps

This directory owns the browser bundles used by the React, Angular, and Vue documentation routes.

The documentation generator remains framework-neutral. It emits structured application-chrome facts (framework choices, navigation, version, routes) plus semantic article markup. Each renderer in `renderers/` consumes the chrome model through its framework's public VyrnForge integration instead of reverse-detecting components from generated HTML hooks or treating one framework implementation as the source of truth.

## Structure

- `build.mjs` — bundles each framework renderer with public package aliases.
- `page-model.js` — reads the generated page model and owns the common rendered-event contract.
- `fragment.js` — parses ordinary semantic article fragments without writing them into the live DOM.
- `renderers/react.js` — React-owned AppShell, SideNav, Input, Link, and semantic article rendering.
- `renderers/angular.ts` — Angular-owned AppShell, SideNav, Input, Link directives and inert semantic article mounting.
- `renderers/vue.js` — Vue-owned AppShell, SideNav, Input, Link VNodes and semantic article rendering.
- `verify.mjs` — guards the renderer boundary and rejects wholesale runtime HTML injection or hook-to-component inference.

The framework switcher is route navigation, not an in-page state widget. It is rendered as one compact icon list in the application header, uses the matching public VyrnForge Link integration where that framework exposes one, identifies the current route with `aria-current`, and preserves the current logical documentation route when switching frameworks. Native Web and Custom Elements use semantic anchors because Custom Elements does not currently expose a Link surface.

Keep framework-specific lifecycle, component types, and rendering mechanics inside the matching renderer. Shared documentation facts and presentation contracts belong outside the framework renderers. Ordinary article semantics such as headings, paragraphs, tables, code, and prose remain framework-neutral; interactive/library chrome must use the matching public VyrnForge integration.
