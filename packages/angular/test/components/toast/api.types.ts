import {
  VfToastCloseDirective,
  VfToastDescriptionDirective,
  VfToastRootDirective,
  VfToastTitleDirective,
  VfToastViewportDirective,
} from '@vyrnforge/angular/toast';

declare const root: VfToastRootDirective;
const open: boolean | undefined = root.open();
const defaultOpen: boolean = root.defaultOpen();
const duration: number = root.duration();
root.requestClose();
void open;
void defaultOpen;
void duration;
void VfToastViewportDirective;
void VfToastTitleDirective;
void VfToastDescriptionDirective;
void VfToastCloseDirective;
