import { TemporalFieldInput, type TemporalFieldInputType } from '@vyrnforge/vue/temporal-field';

const type: TemporalFieldInputType = 'week';
const component: typeof TemporalFieldInput = TemporalFieldInput;
// @ts-expect-error TemporalField must remain limited to temporal Input modes.
const invalid: TemporalFieldInputType = 'number';
void [type, component, invalid];
