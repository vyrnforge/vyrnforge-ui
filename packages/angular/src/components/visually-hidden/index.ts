import { Directive } from '@angular/core';

@Directive({
  selector: '[vfVisuallyHidden]',
  standalone: true,
  host: {
    'data-vf-visually-hidden': '',
  },
})
export class VfVisuallyHiddenDirective {}
