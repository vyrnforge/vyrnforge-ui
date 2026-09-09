# Import And Setup

VyrnForge UI is consumed through a first-class surface package. Pick the surface
that matches the application: React, Native HTML / Custom Elements, Angular, or
Vue. Shared VyrnForge implementation dependencies are installed transitively and
are not part of the normal application setup model.

The non-grid foundation is distributed through the `beta` prerelease channel.
`@vyrnforge/ui-data-grid` remains independently versioned on the `alpha`
channel. Use explicit prerelease tags.

See [Versioning Policy](../release/versioning-policy.md) for canonical
release-group versions and dependency rules.

## React

Install the first-class React surface:

```bash
npm install @vyrnforge/ui-components@beta
```

Use the public package entrypoint. It loads the React surface styling and the
shared VyrnForge foundations required by that surface.

```tsx
import { Button, Card } from "@vyrnforge/ui-components";

export function Example() {
  return (
    <Card variant="bordered" padding="md">
      <Button variant="primary">Save changes</Button>
    </Card>
  );
}
```

Import from package entrypoints, not package-internal `src` paths. React and
React DOM are peers supplied by the application; see the package manifest for
the supported range.

## Native HTML / Custom Elements

Install the first-class browser-native surface:

```bash
npm install @vyrnforge/ui-elements@beta
```

Register the catalog once at the browser application boundary:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

The package root loads the Native HTML surface styling. It is otherwise safe to
import in the validated server environment and does not register elements until
registration is requested. Applications may also opt into the explicit
registration side-effect entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

Object and array APIs are assigned as DOM properties rather than serialized to
attributes.

## Angular

Install the first-class Angular facade in an Angular application:

```bash
npm install @vyrnforge/ui-angular@beta
```

`@angular/core` and RxJS are peers supplied by the Angular application.
`@angular/forms` is optional and is needed only when the Forms entrypoint is
used.

Register VyrnForge once at the Angular application boundary:

```ts
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";

import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideVyrnForge()],
});
```

`provideVyrnForge()` owns canonical element registration for normal Angular
consumers. The facade supplies Angular selectors, typed inputs/outputs, content
composition metadata, typed element references, supported imperative methods,
and the canonical VyrnForge styling through its element dependency. Consumers
do not install or configure the implementation dependency graph separately.

Applications that use reactive Forms, template-driven Forms, or `ngModel`
import the package-owned bridge from `@vyrnforge/ui-angular/forms`.

See [Angular Package](../packages/ui-angular.md) for Forms, events, composition,
typed references, SSR guidance, migration steps, limitations, and supported
escape hatches. Use the generated component reference for the exact
per-component Angular surface.

## Vue

Install the first-class Vue facade. Existing Vue applications only need the
VyrnForge package; the command below also shows the required Vue peer for a new
or minimal project:

```bash
npm install @vyrnforge/ui-vue@beta vue
```

Install the package plugin at the Vue application boundary:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

The plugin registers the canonical VyrnForge elements and public `Vf*` facade
components. Normal facade consumers do not copy element registration, configure
Vue compiler `isCustomElement` rules, install VyrnForge implementation packages
individually, or maintain fixture-local wrappers.

Use generated `v-model` mappings, Vue-facing typed emits, named slots, and typed
component refs for normal Vue integration. Raw `<vf-*>` elements and canonical
`vf-*` DOM events remain supported interoperability escape hatches when the
application deliberately needs the Native HTML contract.

See [Vue Package](../packages/ui-vue.md) for model mappings, events, slots,
typed refs, native forms, SSR behavior, migration guidance, and supported escape
hatches. Use the generated component reference for the exact per-component Vue
surface.

## Framework-neutral behavior APIs

Most applications should start from a framework surface package. Applications
that intentionally build on the shared controller layer directly can install the
framework-neutral behavior package:

```bash
npm install @vyrnforge/ui-behaviors@beta
```

`@vyrnforge/ui-behaviors` owns portable state transitions and interaction
decisions. Its shared dependencies are installed transitively. It does not own
framework rendering, DOM execution, application state, backend requests, or
business workflows.

## Data grid

The data grid is a specialized React package on an independent alpha track.
Start from the normal React surface and add the grid package:

```bash
npm install @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import {
  UniversalDataGrid,
  type DataGridColumnDef,
} from "@vyrnforge/ui-data-grid";
```

The grid remains React-only. The non-grid multi-framework support model does not
imply Native HTML, Angular, or Vue grid renderers.

## Styles and explicit CSS entrypoints

Normal surface-package imports load the VyrnForge CSS used by that surface. This
is the same path exercised by the clean packed-consumer fixtures.

Explicit public CSS entrypoints remain available for hosts that deliberately
manage stylesheet loading or ordering. For example:

```ts
import "@vyrnforge/ui-components/styles/index.css";
```

or:

```ts
import "@vyrnforge/ui-elements/styles/index.css";
```

Do not import package-internal CSS files. Do not require applications to install
shared foundation packages merely to reproduce the internal dependency graph.

## Themes and overrides

Use shared `--vf-*` variables for application-wide VyrnForge theming. Use
`--udg-*` only for grid-specific overrides.

```css
.my-app {
  --vf-interactive-primary: #003b71;
  --vf-radius-md: 10px;
}

.my-app .udg {
  --udg-row-height: 42px;
}
```

See [Theming And Styling](../architecture/03-theming-and-styling.md) and
[CSS Architecture](../architecture/06-css-architecture.md).

## Package rules

- Choose React, Native HTML, Angular, or Vue first; use its public package as the normal application entrypoint.
- Keep application business logic, authentication, routing, permissions, and application state outside VyrnForge.
- Keep framework runtimes out of shared foundations.
- Prefer VyrnForge tokens and behavior contracts before creating one-off application equivalents.
- Prefer `@vyrnforge/ui-angular` and `@vyrnforge/ui-vue` over application-owned framework wrappers that duplicate canonical VyrnForge behavior.
- Treat `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`, and transitive renderer dependencies as architecture details unless an application intentionally consumes their public framework-neutral APIs.
- Treat the data grid as a separate React alpha track.

## Licensing

VyrnForge UI is source-available under the root
[VyrnForge Source License 1.0](../../LICENSE). See
[Commercial Licensing](../legal/commercial-licensing.md) for production and
commercial-use guidance.
