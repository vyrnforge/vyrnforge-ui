# Getting Started

Choose the package for your application. Shared VyrnForge dependencies are installed transitively; normal consumers should not reproduce the internal package graph.

The non-grid surfaces use the `beta` prerelease channel. The data grid remains on an independent `alpha` track.

## React

```bash
npm install @vyrnforge/ui-components@beta
```

```tsx
import { Button } from "@vyrnforge/ui-components";

export function SaveButton() {
  return <Button variant="primary">Save changes</Button>;
}
```

React and React DOM are application peers. Import from public package entrypoints, not `src` paths.

## Native HTML / Custom Elements

```bash
npm install @vyrnforge/ui-elements@beta
```

Register once at the browser boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

You can also opt into the explicit registration entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

Assign object and array APIs as DOM properties rather than serializing them into attributes.

## Angular

```bash
npm install @vyrnforge/ui-angular@beta
```

Register VyrnForge once:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideVyrnForge()],
});
```

Use `@vyrnforge/ui-angular/forms` only when Angular Forms integration is needed.

## Vue

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

Then use the public `Vf*` components, generated `v-model` mappings, slots, emits, and typed refs.

## Data grid

For the specialized React grid:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

The grid is currently React-only.

## Styling

Normal surface-package imports load the CSS required by that surface. Hosts that intentionally control stylesheet loading can use public style entrypoints such as:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

Use shared `--vf-*` custom properties for application-wide theming. Use `--udg-*` only for grid-specific overrides.

## Next

- Browse **Components** for per-component usage and API.
- Read [Theming and Styling](../architecture/03-theming-and-styling.md) for customization.
- Read [Accessibility](../architecture/05-accessibility-standards.md) for keyboard and semantic expectations.
- Read [Releases and Migration](../release/multi-framework-migration-and-limitations.md) before upgrading or changing framework integration.
