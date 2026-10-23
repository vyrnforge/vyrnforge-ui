import { TemporalInput, type TemporalInputProps, type TemporalInputType } from '@vyrnforge/react/temporal-input';
const type: TemporalInputType = 'month';
const props: TemporalInputProps = { type, name: 'month' };
const control: typeof TemporalInput = TemporalInput;
// @ts-expect-error Color is not a temporal type.
const invalid: TemporalInputType = 'color';
void [type, props, control, invalid];
