import { Directive, input } from '@angular/core';
import type { InputType } from '@vyrnforge/web/input';

export type { InputType } from '@vyrnforge/web/input';

@Directive({
  selector: 'input[vfInput]',
  standalone: true,
  host: {
    'data-vf-input': '',
    '[attr.type]': 'type()',
  },
})
export class VfInputDirective {
  readonly type = input<InputType>('text');
}
