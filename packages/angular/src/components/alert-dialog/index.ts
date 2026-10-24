import { Directive } from '@angular/core';
import { VfDialogBodyDirective, VfDialogCloseDirective, VfDialogDescriptionDirective, VfDialogRootDirective, VfDialogTitleDirective } from '../dialog/index.js';

@Directive({ selector: 'dialog[vfAlertDialogRoot]', standalone: true, hostDirectives: [{ directive: VfDialogRootDirective, inputs: ['id', 'open', 'defaultOpen', 'titleId', 'descriptionId', 'initialFocus'], outputs: ['openChange', 'dismissRequest'] }], host: { role: 'alertdialog', 'data-vf-alert-dialog-root': '' } })
export class VfAlertDialogRootDirective {}
export { VfDialogTitleDirective as VfAlertDialogTitleDirective, VfDialogDescriptionDirective as VfAlertDialogDescriptionDirective, VfDialogBodyDirective as VfAlertDialogBodyDirective, VfDialogCloseDirective as VfAlertDialogCancelDirective, VfDialogCloseDirective as VfAlertDialogActionDirective };
