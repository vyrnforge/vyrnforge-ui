# Vue package boundary

`@vyrnforge/ui-vue` is the first-class Vue facade over the canonical `@vyrnforge/ui-elements` implementation.

The package owns Vue-facing adapters and typing. Canonical rendering, shared behavior contracts, accessibility semantics, styling, and framework-independent state remain below the facade. Direct VyrnForge implementation coupling is limited to `@vyrnforge/ui-elements` unless a separately documented framework exception is approved.

## Normal Vue setup

The supported low-friction path is the package plugin:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

`VyrnForgeVue` registers the canonical VyrnForge custom elements plus the package's public `Vf*` facade components. Normal consumers therefore do not copy the internal fixture's `@vyrnforge/ui-elements/register` side-effect import and do not need Vue compiler `isCustomElement` configuration when they consume the facade components.

`createVyrnForgeVue(options)` and `installVyrnForgeVue(app, options)` are provided for controlled setup, including hosts that supply an explicit custom-element registry.

The initial workspace promotes the proven generated Vue slices for button, dialog, tabs, and text input. Catalog-wide generation, model mapping, fixture migration, compatibility/accessibility evidence, and release-matrix integration remain separate dependency-tracked Vue work.

The workspace is intentionally private while the Vue lane is staged. The later release-integration task owns removing that staging guard and adding the Vue artifact to canonical package/release verification once its required compatibility and accessibility evidence is complete.

This page records the package boundary and setup contract only. Consumer API and migration guidance belongs to the dedicated Vue documentation task after the package-consumption cutover is complete.
