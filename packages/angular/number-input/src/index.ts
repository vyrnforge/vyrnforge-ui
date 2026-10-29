import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfNumberInput]', standalone: true, host: { 'data-vf-number-input': '', type: 'number' } })
export class VfNumberInputDirective {}
