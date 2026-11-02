# Framework documentation apps

This directory owns the browser bundles used by the React, Angular, and Vue documentation routes.

The documentation generator remains framework-neutral. It emits one page model containing semantic documentation content and navigation facts. Each renderer in `renderers/` consumes that model through its framework's public VyrnForge integration instead of treating one framework implementation as the source of truth.

## Structure

- `build.mjs` — bundles each framework renderer with public package aliases.
- `page-model.js` — reads the generated page model and owns the common rendered-event contract.
- `fragment.js` — parses generated semantic fragments without writing them into the live DOM.
- `renderers/react.js` — React-owned rendering and React VyrnForge surfaces.
- `renderers/angular.ts` — Angular template/directive rendering and Angular VyrnForge surfaces.
- `renderers/vue.js` — Vue-owned VNodes and Vue VyrnForge surfaces.
- `verify.mjs` — guards the renderer boundary and rejects wholesale runtime HTML injection.

Keep framework-specific lifecycle, component types, and rendering mechanics inside the matching renderer. Shared documentation facts and presentation contracts belong outside the framework renderers.
