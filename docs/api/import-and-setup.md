# Getting Started

Start with the framework surface your application already uses, then keep the same VyrnForge concepts as the application grows. Native HTML / Custom Elements, React, Angular, and Vue are equal first-class VyrnForge surfaces over the same design tokens, accessibility model, behavior contracts, and component terminology.

Use public package entrypoints only. Shared implementation packages may be installed transitively, but consuming applications should depend on the framework-facing package that matches their runtime.

## Native HTML / Custom Elements

Install the native element surface:

```bash
npm install @vyrnforge/ui-elements@beta
```

Register VyrnForge once at the browser boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

Then use the `vf-*` custom elements directly:

```html
<vf-button variant="primary">Save changes</vf-button>
```

For hosts that prefer side-effect registration, use the public `@vyrnforge/ui-elements/register` entrypoint. Assign object and array APIs as DOM properties instead of serializing complex values into attributes.

## React

Install the first-class React surface:

```bash
npm install @vyrnforge/ui-components@beta
```

React and React DOM remain application peers. Import components from the public package entrypoint:

```tsx
import { Button } from "@vyrnforge/ui-components";

export function SaveButton() {
  return <Button variant="primary">Save changes</Button>;
}
```

Do not import internal `src` paths. VyrnForge keeps React props, callbacks, refs, styling, accessibility, and behavior aligned with the shared cross-framework contracts while remaining idiomatic React.

## Angular

Install the first-class Angular surface:

```bash
npm install @vyrnforge/ui-angular@beta
```

Register VyrnForge once during application bootstrap:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideVyrnForge()],
});
```

Use `@vyrnforge/ui-angular/forms` only when Angular Forms integration is required. Keep framework-specific state management in the consuming application rather than coupling it to VyrnForge.

## Vue

Install the first-class Vue surface:

```bash
npm install @vyrnforge/ui-vue@beta vue
```

Install the VyrnForge plugin once:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

Use the public `Vf*` components, generated `v-model` mappings, slots, emits, and typed refs. Vue remains an adapter over the same VyrnForge foundations rather than a separate component library.

## Styling

Framework packages load the styling required by their public surface. Applications that intentionally manage stylesheets can use documented public style entrypoints such as:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

Use shared `--vf-*` custom properties for theme, density, spacing, typography, color, elevation, border, motion, responsive, and accessibility states. Prefer tokens over hard-coded values.

## Data Grid advanced module

Data Grid is an optional advanced VyrnForge module, not a separate UI system. The currently shipped package exposes a React alpha surface:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Do not infer Native HTML, Angular, or Vue grid support from the React package. Additional framework surfaces require explicit shared grid contracts, implementation, and verification.

## Version and release selection

Package versions, prerelease tags, peer ranges, framework readiness, and compatibility evidence are release metadata, not guide-page constants. Use the version selector in this documentation and the canonical package/release metadata when choosing a version.

Avoid copying stale prerelease assumptions into application setup code.

## Next

Continue with Components for public APIs and framework-specific usage, Framework Examples for verified packed-consumer examples, Theming & Styling for token-driven customization, Accessibility for keyboard and semantic expectations, and Releases & Migration before upgrading framework integrations.
