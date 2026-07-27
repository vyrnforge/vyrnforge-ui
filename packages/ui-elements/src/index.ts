import "./styles/index.css";

export const vyrnForgeUiElementsVersion = "0.1.0-alpha.1";

export {
  VyrnForgeElement,
  type VyrnForgeAttributeType,
  type VyrnForgeChangedProperties,
  type VyrnForgePropertyDeclaration,
  type VyrnForgePropertyDeclarations,
} from "./base/VyrnForgeElement";
export {
  createVyrnForgeEvent,
  dispatchVyrnForgeEvent,
  type VyrnForgeEventName,
  type VyrnForgeEventOptions,
} from "./events";
export {
  assertVyrnForgeElementTagName,
  createVyrnForgeElementRegistration,
  defineVyrnForgeElement,
  getVyrnForgeElementRegistry,
  registerVyrnForgeElement,
  registerVyrnForgeElementDefinitions,
  registerVyrnForgeElements,
  vyrnForgeElementDefinitions,
  type VyrnForgeElementConstructor,
  type VyrnForgeElementDefinition,
  type VyrnForgeElementRegistration,
  type VyrnForgeElementRegistry,
  type VyrnForgeElementTagName,
} from "./registry";
