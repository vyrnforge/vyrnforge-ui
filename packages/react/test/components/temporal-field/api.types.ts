import {
  TemporalFieldInput,
  type TemporalFieldInputProps,
  type TemporalFieldInputType,
} from '@vyrnforge/react/temporal-field';

const type: TemporalFieldInputType = 'datetime-local';
const props: TemporalFieldInputProps = { type, name: 'startsAt' };
const component: typeof TemporalFieldInput = TemporalFieldInput;
// @ts-expect-error TemporalField must remain limited to temporal Input modes.
const invalid: TemporalFieldInputType = 'text';
void [props, component, invalid];
