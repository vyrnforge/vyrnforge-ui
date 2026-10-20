import { Directive, input } from '@angular/core';
import type { TextVariant } from '@vyrnforge/web/text';

export type { TextVariant } from '@vyrnforge/web/text';

@Directive({
  selector: '[vfText]',
  standalone: true,
  host: {
    'data-vf-text': '',
    '[attr.data-vf-text-variant]': 'variant()',
  },
})
export class VfTextDirective {
  readonly variant = input<TextVariant>('body', { alias: 'vfText' });
}
