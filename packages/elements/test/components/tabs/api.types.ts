import {
  VfTabsElement,
  defineTabsElement,
  type TabsActivation,
  type TabsOrientation,
  type TabsValueChangeDetail,
  type TabsValueChangeEvent,
} from '@vyrnforge/elements/tabs';

const orientation: TabsOrientation = 'vertical';
const activation: TabsActivation = 'manual';
const element: VfTabsElement = document.createElement('vf-tabs') as VfTabsElement;
element.value = 'overview';
element.defaultValue = 'overview';
element.orientation = orientation;
element.activation = activation;
const detail: TabsValueChangeDetail = { value: element.value };
const event: TabsValueChangeEvent = new CustomEvent('vf-value-change', { detail });
const register: (registry?: CustomElementRegistry) => void = defineTabsElement;
void [event, register];

// @ts-expect-error unsupported orientation
const invalidOrientation: TabsOrientation = 'diagonal';
// @ts-expect-error unsupported activation
const invalidActivation: TabsActivation = 'focus';
void [invalidOrientation, invalidActivation];
