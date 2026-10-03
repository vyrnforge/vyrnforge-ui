# Getting Started

VyrnForge is one UI foundation with four first-class framework surfaces. Start with the surface your application already uses; the design tokens, accessibility model, behavior contracts, and component terminology stay shared.

## Choose your framework surface

Use the public package that matches the host application. Do not build against internal package paths or treat one framework adapter as the canonical implementation for the others.

| Surface | Public package | Primary authoring model |
| --- | --- | --- |
| Native HTML / Custom Elements | `@vyrnforge/ui-elements` | HTML + TypeScript |
| React | `@vyrnforge/ui-components` | TSX |
| Angular | `@vyrnforge/ui-angular` | Angular templates + TypeScript |
| Vue | `@vyrnforge/ui-vue` | Vue SFC + TypeScript |

## Install and initialize

### Native HTML / Custom Elements

```bash
npm install @vyrnforge/ui-elements@beta
```

Register the native surface once at the browser boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

Then author public elements directly:

```html
<vf-button variant="primary">Save changes</vf-button>
```

Use `@vyrnforge/ui-elements/register` when side-effect registration better matches the host. Assign object and array APIs as DOM properties rather than serializing complex values into attributes.

### React

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

Use public exports only. Props, callbacks, refs, styling, accessibility, and behavior remain aligned with the shared VyrnForge contracts.

### Angular

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

Use `@vyrnforge/ui-angular/forms` only when Angular Forms integration is needed. Application state management remains owned by the consuming app.

### Vue

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

Use public `Vf*` components, generated `v-model` mappings, slots, emits, and typed refs.

## Style with shared tokens

Framework packages expose the same VyrnForge styling foundation. Hosts that intentionally control stylesheet loading can use documented style entrypoints such as:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

Customize through shared `--vf-*` custom properties for theme, density, spacing, typography, color, borders, elevation, motion, responsive behavior, and accessibility states. Prefer VyrnForge tokens over framework-specific hard-coded values.

## Verify the integration

Before building application-specific wrappers, confirm the selected surface works directly:

1. render one public VyrnForge component;
2. verify keyboard and focus behavior;
3. switch the documentation framework selector and compare the equivalent surface;
4. run the verified framework example from **Framework Examples**;
5. use the component reference for public props, events, slots, methods, and styling contracts.

If a reusable capability is missing, extend the shared VyrnForge foundation before creating a one-off application component.

## Add advanced modules only when needed

Data Grid is an optional advanced VyrnForge module, not a separate UI foundation. The currently shipped package exposes a React alpha surface:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Do not infer Native HTML, Angular, or Vue grid support from the React package. Additional surfaces require explicit shared grid contracts, implementation, and verification.

## Choose a release intentionally

Versions, prerelease tags, peer ranges, framework readiness, and compatibility evidence come from release metadata rather than hard-coded guide assumptions. Use the documentation version selector and the canonical release metadata when selecting a version.

## Continue from here

Use **Components** for public APIs and framework-specific usage, **Framework Examples** for verified packed-consumer examples, **Theming & Styling** for shared customization, **Accessibility** for keyboard and semantic expectations, and **Releases & Migration** before upgrading framework integrations.
