import {
  VfToastElement,
  VfToastViewportElement,
  defineToastElement,
  defineToastViewportElement,
  type ToastOpenChangeDetail,
} from '@vyrnforge/elements/toast';

declare const root: VfToastElement;
root.open = true;
root.open = false;
root.open = undefined;
root.defaultOpen = true;
root.duration = 5000;
const detail: ToastOpenChangeDetail = { open: false };
void detail;
void VfToastViewportElement;
void defineToastElement;
void defineToastViewportElement;
