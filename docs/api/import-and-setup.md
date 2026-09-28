# Getting Started

Choose the VyrnForge surface for your application. Shared implementation
dependencies are installed transitively; normal consumers should not reproduce
or coordinate the internal package graph.

Current package names, public entrypoints, peer requirements, and release
classification are owned by package manifests and canonical metadata. The
commands below show the supported package entrypoints; use the release tag or
version appropriate to the current published release.

## React

```bash
npm install @vyrnforge/ui-components
```

```tsx
import { Button } from "@vyrnforge/ui-components";

export function SaveButton() {
  return <Button variant="primary">Save changes</Button>;
}
```

React and React DOM are application peers. Import from public package entrypoints,
not `src` paths.

## Native HTML / Custom Elements

```bash
npm install @vyrnforge/ui-elements
```

Register once at the browser boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

You can instead opt into the explicit registration entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

Assign object and array APIs as DOM properties rather than serializing them into
attributes.

## Angular

```bash
npm install @vyrnforge/ui-angular
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
See [Angular package guidance](../packages/ui-angular.md) for the supported peer
and Forms contract.

## Vue

```bash
npm install @vyrnforge/ui-vue vue
```

Install the plugin once:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

Then use the public `Vf*` components, generated `v-model` mappings, slots,
emits, and typed refs. See [Vue package guidance](../packages/ui-vue.md) for the
current peer and facade contract.

## Data grid

The optional specialized data grid currently uses the React surface:

```bash
npm install @vyrnforge/ui-components @vyrnforge/ui-data-grid
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

The data grid has its own release classification and does not imply Native,
Angular, or Vue grid renderers. Verify its current release state in canonical
release metadata before adoption.

## Styling

Normal surface-package imports load the CSS required by that surface. Hosts that
intentionally control stylesheet loading can use documented public style
entrypoints such as:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

Use shared `--vf-*` custom properties for application-wide theming. Use
grid-specific variables only for grid-specific overrides.

## Version and release selection

Do not hard-code prerelease channel policy into setup guidance. Current package
release groups, tags, peer ranges, and compatibility evidence change
independently of this getting-started flow.

Use:

- [Release documentation](../release/README.md) for current release governance;
- [Package metadata](../metadata/packages.json) and release metadata for
  package/release classification;
- package manifests for current peer dependencies and exports;
- [Multi-Framework Migration and Limitations](../release/multi-framework-migration-and-limitations.md)
  for framework guarantees and limitations.

## Next

- Browse **Components** for per-component usage and API.
- Read [Theming and Styling](../architecture/03-theming-and-styling.md) for customization.
- Read [Accessibility](../architecture/05-accessibility-standards.md) for keyboard and semantic expectations.
- Read [Releases and Migration](../release/multi-framework-migration-and-limitations.md) before upgrading or changing framework integration.
