import { Directive } from '@angular/core';

@Directive({
  selector: 'textarea[vfTextarea]',
  standalone: true,
  host: {
    'data-vf-textarea': '',
  },
})
export class VfTextareaDirective {}
