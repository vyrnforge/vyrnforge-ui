import {
  VfToastRootElement,
  VfToastViewportElement,
  defineToastRootElement,
  defineToastViewportElement,
} from '@vyrnforge/elements/toast';

declare const root: VfToastRootElement;
root.open = true;
root.open = false;
root.open = undefined;
root.defaultOpen = true;
root.duration = 5000;
root.requestClose();

void VfToastViewportElement;
void defineToastViewportElement;
void defineToastRootElement;
