# Getting Started

Choose the VyrnForge surface for your application. Native HTML / Custom
Elements, React, Angular, and Vue are equal first-class surfaces over the same
VyrnForge UI system. Shared implementation dependencies are installed
transitively; their internal direction does not indicate product priority.

Current package names, public entrypoints, peer requirements, and release
classification are owned by package manifests and canonical metadata. The
commands below show the supported package entrypoints; use the release tag or
version appropriate to the current published release.

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

React and React DOM are application peers. Import from public package entrypoints,
not `src` paths.

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

You can instead opt into the explicit registration entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

Assign object and array APIs as DOM properties rather than serializing them into
attributes.

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
See [Angular package guidance](../../packages/ui-angular/README.md) for the supported peer
and Forms contract.

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

Then use the public `Vf*` components, generated `v-model` mappings, slots,
emits, and typed refs. See [Vue package guidance](../../packages/ui-vue/README.md) for the
current peer and facade contract.

## Data Grid advanced module

Data Grid is an optional advanced VyrnForge UI module, not another framework
surface. The currently shipped package exposes a React-only alpha surface:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

This current package does not imply that Native, Angular, or Vue grid renderers
already exist. Future grid surface support requires shared grid contracts and
explicit implementation/evidence. Verify the current release state in canonical
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
