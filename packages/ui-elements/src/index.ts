import "./styles/index.css";

export const vyrnForgeUiElementsVersion = "0.1.0-alpha.1";

export type {
  VyrnForgeElementForTagName,
  VyrnForgeHTMLElementTagNameMap,
  VyrnForgePublicElementTagName,
} from "./custom-elements";

export {
  VyrnForgeElement,
  type VyrnForgeAttributeType,
  type VyrnForgeChangedProperties,
  type VyrnForgeElementEventListener,
  type VyrnForgePropertyDeclaration,
  type VyrnForgePropertyDeclarations,
} from "./base/VyrnForgeElement";
export {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormAssociationMode,
  type VyrnForgeFormInternals,
  type VyrnForgeFormState,
  type VyrnForgeFormStateRestoreMode,
  type VyrnForgeFormValue,
  type VyrnForgeValidityFlags,
} from "./base/VyrnForgeFormAssociatedElement";
export {
  assertVyrnForgeEventName,
  createVyrnForgeEvent,
  createVyrnForgeEventDispatcher,
  dispatchVyrnForgeEvent,
  vyrnForgeEventDispatcher,
  type VyrnForgeActionDetail,
  type VyrnForgeCanonicalEventDetailMap,
  type VyrnForgeCancelDetail,
  type VyrnForgeCheckedChangeDetail,
  type VyrnForgeConfirmDetail,
  type VyrnForgeDismissDetail,
  type VyrnForgeEventMapName,
  type VyrnForgeEventName,
  type VyrnForgeEventOptions,
  type VyrnForgeEventReason,
  type VyrnForgeInputValueChangeDetail,
  type VyrnForgeInvalidDetail,
  type VyrnForgeOpenChangeDetail,
  type VyrnForgePressedChangeDetail,
  type VyrnForgeResetDetail,
  type VyrnForgeSelectionChangeDetail,
  type VyrnForgeToastChangeDetail,
  type VyrnForgeTypedEventDispatcher,
  type VyrnForgeValueChangeDetail,
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
  vyrnForgeElementRegistrations,
  type VyrnForgeElementConstructor,
  type VyrnForgeElementDefinition,
  type VyrnForgeElementRegistration,
  type VyrnForgeElementRegistry,
  type VyrnForgeElementTagName,
} from "./registry";
export * from "./components";
