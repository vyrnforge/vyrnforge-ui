import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
import type { VyrnForgeElementRegistry } from "@vyrnforge/ui-elements";
import type { App } from "vue";

import { vyrnForgeVueGeneratedComponents } from "./generated/catalog.generated";

export interface VyrnForgeVueOptions {
  readonly elementRegistry?: VyrnForgeElementRegistry;
}

export interface VyrnForgeVuePlugin {
  install(app: unknown): void;
}

export const vyrnForgeVueComponents = vyrnForgeVueGeneratedComponents;

function asVueApp(app: unknown): App {
  if (
    !app ||
    typeof app !== "object" ||
    !("component" in app) ||
    typeof (app as { component?: unknown }).component !== "function"
  ) {
    throw new TypeError(
      "VyrnForge Vue setup requires a Vue application instance",
    );
  }
  return app as App;
}

export function installVyrnForgeVue<TApp>(
  app: TApp,
  options: VyrnForgeVueOptions = {},
): TApp {
  const vueApp = asVueApp(app);
  registerVyrnForgeElements(options.elementRegistry);

  for (const component of vyrnForgeVueComponents) {
    const name = (component as { name?: string }).name;
    if (!name) {
      throw new TypeError("VyrnForge Vue facade component is missing a name");
    }
    vueApp.component(name, component);
  }

  return app;
}

export function createVyrnForgeVue(
  options: VyrnForgeVueOptions = {},
): VyrnForgeVuePlugin {
  return {
    install(app: unknown) {
      installVyrnForgeVue(app, options);
    },
  };
}

export const VyrnForgeVue = createVyrnForgeVue();
