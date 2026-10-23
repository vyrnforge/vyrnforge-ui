import { VfTemporalInputDirective, type TemporalInputType } from '@vyrnforge/angular/temporal-input';
const type: TemporalInputType = 'week';
const control: typeof VfTemporalInputDirective = VfTemporalInputDirective;
// @ts-expect-error Color is not a temporal type.
const invalid: TemporalInputType = 'color';
void [type, control, invalid];
