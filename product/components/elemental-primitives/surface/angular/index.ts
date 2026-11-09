import { Directive } from '@angular/core';

@Directive({
  selector: '[vfSurface]',
  standalone: true,
  host: {
    'data-vf-surface': '',
  },
})
export class VfSurfaceDirective {}
