import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfSlider]', standalone: true, host: { 'data-vf-slider': '', type: 'range' } })
export class VfSliderDirective {}
