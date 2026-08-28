import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
import type { VyrnForgeElementRegistry } from "@vyrnforge/ui-elements";
import type { App, Component, Plugin } from "vue";

import { VfButton } from "./generated/VfButton.generated";
import { VfDialog } from "./generated/VfDialog.generated";
import { VfTabs } from "./generated/VfTabs.generated";
import { VfTextInput } from "./generated/VfTextInput.generated";

export interface VyrnForgeVueOptions {
  readonly elementRegistry?: VyrnForgeElementRegistry;
}

export const vyrnForgeVueComponents = Object.freeze([
  VfButton,
  VfDialog,
  VfTabs,
  VfTextInput,
] as readonly Component[]);

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

export function createVyrnForgeVue(
  options: VyrnForgeVueOptions = {},
): Plugin {
  return {
    install(app: App) {
      installVyrnForgeVue(app, options);
    },
  };
}

export const VyrnForgeVue: Plugin = createVyrnForgeVue();
