import {
  provideEnvironmentInitializer,
  type EnvironmentProviders,
} from "@angular/core";
import {
  registerVyrnForgeElements,
  type VyrnForgeElementRegistry,
} from "@vyrnforge/ui-elements";

export interface VyrnForgeAngularOptions {
  readonly elementRegistry?: VyrnForgeElementRegistry;
}

export function provideVyrnForge(
  options: VyrnForgeAngularOptions = {},
): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    registerVyrnForgeElements(options.elementRegistry);
  });
}
