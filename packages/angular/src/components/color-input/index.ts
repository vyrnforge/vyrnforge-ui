import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfColorInput]', standalone: true, host: { 'data-vf-color-input': '', type: 'color' } })
export class VfColorInputDirective {}
