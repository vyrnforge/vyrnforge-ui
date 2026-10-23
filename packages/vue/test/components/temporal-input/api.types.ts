import { TemporalInput, type TemporalInputType } from '@vyrnforge/vue/temporal-input';
const type: TemporalInputType = 'datetime-local';
const control: typeof TemporalInput = TemporalInput;
// @ts-expect-error Color is not a temporal type.
const invalid: TemporalInputType = 'color';
void [type, control, invalid];
