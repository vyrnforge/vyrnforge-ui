import { Directive, input } from '@angular/core';
import { VfDialogBodyDirective, VfDialogCloseDirective, VfDialogDescriptionDirective, VfDialogRootDirective, VfDialogTitleDirective } from '../dialog/index.js';
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
@Directive({ selector: 'dialog[vfDrawerRoot]', standalone: true, hostDirectives: [{ directive: VfDialogRootDirective, inputs: ['id', 'open', 'defaultOpen', 'backdropDismiss', 'titleId', 'descriptionId', 'initialFocus'], outputs: ['openChange', 'dismissRequest'] }], host: { 'data-vf-drawer-root': '', '[attr.data-vf-placement]': 'placement()' } })
export class VfDrawerRootDirective { readonly placement = input<DrawerPlacement>('end'); }
export { VfDialogTitleDirective as VfDrawerTitleDirective, VfDialogDescriptionDirective as VfDrawerDescriptionDirective, VfDialogBodyDirective as VfDrawerBodyDirective, VfDialogCloseDirective as VfDrawerCloseDirective };
