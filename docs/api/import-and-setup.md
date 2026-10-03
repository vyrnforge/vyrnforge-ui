# Getting Started

Start with the framework your application already uses. Native HTML / Custom Elements, React, Angular, and Vue are equal first-class VyrnForge surfaces over the same tokens, accessibility model, behavior contracts, and component terminology.

Use public package entrypoints only. Shared implementation dependencies can be installed transitively, but applications should depend on the framework-facing package that matches their runtime.

## Native HTML / Custom Elements

Install the native surface:

```bash
npm install @vyrnforge/ui-elements@beta
```

Register VyrnForge once at the browser boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

Then use the public custom elements:

```html
<vf-button variant="primary">Save changes</vf-button>
```

Use the public `@vyrnforge/ui-elements/register` entrypoint when side-effect registration better matches the host. Assign object and array APIs as DOM properties rather than serializing complex values into attributes.

## React

Install the first-class React surface:

```bash
npm install @vyrnforge/ui-components@beta
```

React and React DOM remain application peers:

```tsx
import { Button } from "@vyrnforge/ui-components";

export function SaveButton() {
  return <Button variant="primary">Save changes</Button>;
}
```

Import from public package entrypoints, never internal `src` paths. React props, callbacks, refs, styling, accessibility, and behavior stay aligned with the shared VyrnForge contracts.

## Angular

Install the first-class Angular surface:

```bash
npm install @vyrnforge/ui-angular@beta
```

Register VyrnForge during application bootstrap:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideVyrnForge()],
});
```

Use `@vyrnforge/ui-angular/forms` only when Angular Forms integration is needed. Keep application state management outside the library.

## Vue

Install the first-class Vue surface:

```bash
npm install @vyrnforge/ui-vue@beta vue
```

Install the plugin once:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

Use the public `Vf*` components, generated `v-model` mappings, slots, emits, and typed refs. Vue remains an adapter over the shared VyrnForge foundations rather than a separate component system.

## Styling

Framework packages load the styling required by their public surface. Hosts that intentionally control stylesheet loading can use documented style entrypoints such as:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

Use shared `--vf-*` custom properties for theme, density, spacing, typography, colors, borders, elevation, motion, responsive behavior, and accessibility states. Prefer tokens over hard-coded values.

## Data Grid advanced module

Data Grid is an optional advanced VyrnForge module, not a separate UI foundation. The currently shipped package exposes a React alpha surface:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Do not infer Native HTML, Angular, or Vue grid support from the React package. Additional framework surfaces require explicit shared grid contracts, implementation, and verification.

## Version and release selection

Package versions, prerelease tags, peer ranges, framework readiness, and compatibility evidence are release metadata rather than guide-page constants. Use the documentation version selector and canonical release metadata when choosing a version.

## Next

Continue with Components for public APIs and framework-specific usage, Framework Examples for verified packed-consumer examples, Theming & Styling for token-driven customization, Accessibility for keyboard and semantic expectations, and Releases & Migration before upgrading framework integrations.
