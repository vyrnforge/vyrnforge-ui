import { Directive } from '@angular/core';
export { VfMenuContentDirective as VfSplitButtonContentDirective, VfMenuItemDirective as VfSplitButtonItemDirective, VfMenuRootDirective as VfSplitButtonRootDirective, VfMenuTriggerDirective as VfSplitButtonTriggerDirective } from '../menu/index.js';
@Directive({ selector: 'button[vfSplitButtonAction]', standalone: true, host: { type: 'button', 'data-vf-split-button-action': '' } }) export class VfSplitButtonActionDirective {}
