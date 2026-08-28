import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
import type { VyrnForgeElementRegistry } from "@vyrnforge/ui-elements";
import type { App, Plugin } from "vue";

import { vyrnForgeVueGeneratedComponents } from "./generated/catalog.generated";

export interface VyrnForgeVueOptions {
  readonly elementRegistry?: VyrnForgeElementRegistry;
}

export const vyrnForgeVueComponents = vyrnForgeVueGeneratedComponents;

export function installVyrnForgeVue(
  app: App,
  options: VyrnForgeVueOptions = {},
): App {
  registerVyrnForgeElements(options.elementRegistry);

  for (const component of vyrnForgeVueComponents) {
    const name = (component as { name?: string }).name;
    if (!name) {
      throw new TypeError("VyrnForge Vue facade component is missing a name");
    }
    app.component(name, component);
  }

  return app;
}

export function createVyrnForgeVue(options: VyrnForgeVueOptions = {}): Plugin {
  return {
    install(app: App) {
      installVyrnForgeVue(app, options);
    },
  };
}

export const VyrnForgeVue: Plugin = createVyrnForgeVue();
