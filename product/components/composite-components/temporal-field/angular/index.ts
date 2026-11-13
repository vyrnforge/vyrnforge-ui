import { Directive, input } from '@angular/core';

export type TemporalFieldInputType = 'date' | 'time' | 'datetime-local' | 'month' | 'week';

@Directive({
  selector: '[vfTemporalFieldRoot]',
  standalone: true,
  host: {
    'data-vf-temporal-field-root': '',
  },
})
export class VfTemporalFieldRootDirective {}

@Directive({
  selector: 'input[vfTemporalFieldInput]',
  standalone: true,
  host: {
    'data-vf-input': '',
    'data-vf-temporal-field-input': '',
    '[attr.type]': 'type()',
  },
})
export class VfTemporalFieldInputDirective {
  readonly type = input<TemporalFieldInputType>('date');
}
