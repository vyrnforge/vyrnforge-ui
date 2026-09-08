# Import And Setup

VyrnForge UI is package-based. Install and import only the packages your
application uses.

The non-grid foundation is distributed through the `beta` prerelease channel.
`@vyrnforge/ui-data-grid` remains independently versioned on the `alpha`
channel. Use explicit prerelease tags.

See [Versioning Policy](../release/versioning-policy.md) for canonical
release-group versions and dependency rules.

## React

React applications use `@vyrnforge/ui-components` as the first-class React
renderer.

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";

import { Button, Card } from "@vyrnforge/ui-components";

export function Example() {
  return (
    <Card variant="bordered" padding="md">
      <Button variant="primary">Save changes</Button>
    </Card>
  );
}
```

Import from package entrypoints, not package-internal `src` paths.

## Native HTML Custom Elements

Native HTML applications use `@vyrnforge/ui-elements`.

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";

import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

The package root is side-effect free. Applications may also opt into the
explicit registration entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

Object and array APIs are assigned as DOM properties rather than serialized to
attributes.

## Angular

Angular applications use `@vyrnforge/ui-angular` as the first-class facade over
the canonical Custom Element implementation.

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-angular@beta
```

Import the shared package styles once, then register VyrnForge at the Angular
application boundary:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";

import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";

import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideVyrnForge()],
});
```

The generated facade supplies Angular selectors, typed inputs/outputs, content
composition metadata, typed element references, and supported imperative method
access without requiring applications to copy registration code or private
fixture adapters.

Applications that use reactive Forms, template-driven Forms, or `ngModel`
import the package-owned Forms bridge from `@vyrnforge/ui-angular/forms`.
`@angular/forms` remains an optional peer for applications that do not use that
entrypoint.

See [Angular Package](../packages/ui-angular.md) for Forms, events, composition,
typed references, SSR guidance, migration steps, limitations, and supported
escape hatches. Use the generated component reference for the exact per-component
Angular surface.

## Vue

Vue is a verified consumer of the native Custom Element renderer, not a
separate VyrnForge component implementation.

Install and register `@vyrnforge/ui-elements` using the native setup above, then
configure the consuming Vue compiler to recognize the `vf-*` Custom Elements.
Use DOM property binding for complex values and canonical events for component
changes.

For idiomatic `v-model` translation, follow:

- [Vue Consumer Contract](../testing/vue-consumer-contract.md)
- [Vue Model Adapter Contract](../testing/vue-model-adapter-contract.md)

The model adapter is a thin consumer integration over the shared native
contract.

## Framework-neutral behaviors

Applications may consume the shared controller APIs directly:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-behaviors@beta
```

`@vyrnforge/ui-behaviors` owns portable state transitions and interaction
decisions. It does not own framework rendering, DOM execution, application
state, backend requests, or business workflows.

## Data grid

The data grid is a specialized React package on an independent alpha track.

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import {
  UniversalDataGrid,
  type DataGridColumnDef,
} from "@vyrnforge/ui-data-grid";
```

The grid remains React-only. The non-grid multi-framework support model does not
imply native HTML, Angular, or Vue grid renderers.

## CSS order

Foundation styles come first, followed by the renderer or specialized package
styles used by the application.

React:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

Native HTML and Angular:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
```

React plus data grid:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

Do not import package-internal CSS files.

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

- Keep application business logic, authentication, routing, permissions, and
  application state outside VyrnForge.
- Keep framework runtimes out of shared foundations.
- Prefer VyrnForge tokens and behavior contracts before creating one-off
  application equivalents.
- Treat React, native HTML, and Angular as first-class non-grid consumption
  surfaces through their public packages.
- Treat Vue as a verified consumer of the native renderer until its facade lane
  completes its release integration.
- Treat the data grid as a separate React alpha track.

## Licensing

VyrnForge UI is source-available under the root
[VyrnForge Source License 1.0](../../LICENSE). See
[Commercial Licensing](../legal/commercial-licensing.md) for production and
commercial-use guidance.
