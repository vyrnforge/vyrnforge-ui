import type * as Behaviors from "@vyrnforge/ui-behaviors";
import type * as Components from "@vyrnforge/ui-components";
import type * as Core from "@vyrnforge/ui-core";
import type * as Elements from "@vyrnforge/ui-elements";

import "@vyrnforge/ui-core/index.css";
import "@vyrnforge/ui-core/style.css";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/index.css";
import "@vyrnforge/ui-components/style.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-elements/index.css";
import "@vyrnforge/ui-elements/register";
import "@vyrnforge/ui-elements/style.css";
import "@vyrnforge/ui-elements/styles/index.css";

import elementsManifest from "@vyrnforge/ui-elements/custom-elements.json";

export type BetaEntryPointTypes = {
  behaviors: typeof Behaviors;
  components: typeof Components;
  core: typeof Core;
  elements: typeof Elements;
};

export const registeredTagCount = elementsManifest.vyrnforge.registeredTagCount;
