import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfRadio]', standalone: true, host: { 'data-vf-radio': '', type: 'radio' } })
export class VfRadioDirective {}
