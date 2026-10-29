import { Directive, input } from '@angular/core';
import type { TemporalInputType } from '@vyrnforge/web/temporal-input';

export type { TemporalInputType } from '@vyrnforge/web/temporal-input';

@Directive({
  selector: 'input[vfTemporalInput]',
  standalone: true,
  host: { 'data-vf-temporal-input': '', '[attr.type]': 'type()' },
})
export class VfTemporalInputDirective {
  readonly type = input<TemporalInputType>('date');
}
