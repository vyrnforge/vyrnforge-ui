import { Directive, input } from '@angular/core';

export type SeparatorOrientation = 'horizontal' | 'vertical';

@Directive({
  selector: 'hr[vfSeparator]',
  standalone: true,
  host: {
    'data-vf-separator': '',
    '[attr.data-vf-separator-orientation]': 'vfSeparatorOrientation()',
    '[attr.aria-orientation]': 'vfSeparatorOrientation() === "vertical" ? "vertical" : null',
  },
})
export class VfSeparatorDirective {
  readonly vfSeparatorOrientation = input<SeparatorOrientation>('horizontal');
}
