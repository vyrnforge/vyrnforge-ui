import {
  VfToastCloseDirective,
  VfToastRootDirective,
  VfToastViewportDirective,
} from '@vyrnforge/angular/toast';

declare const root: VfToastRootDirective;
root.open;
root.defaultOpen;
root.duration;
root.openChange;
root.requestClose();

void VfToastViewportDirective;
void VfToastCloseDirective;
