import "./styles/index.css";

export const vyrnForgeUiElementsVersion = "0.1.0-alpha.1";

export { VyrnForgeElement } from "./base/VyrnForgeElement";
export {
  createVyrnForgeEvent,
  dispatchVyrnForgeEvent,
  type VyrnForgeEventName,
  type VyrnForgeEventOptions,
} from "./events";
export {
  defineVyrnForgeElement,
  getVyrnForgeElementRegistry,
  registerVyrnForgeElements,
  type VyrnForgeElementConstructor,
  type VyrnForgeElementRegistry,
} from "./registry";
