import {
  VfTemporalFieldInputDirective,
  type TemporalFieldInputType,
} from '@vyrnforge/angular/temporal-field';

const type: TemporalFieldInputType = 'time';
const directive: typeof VfTemporalFieldInputDirective = VfTemporalFieldInputDirective;
// @ts-expect-error TemporalField must remain limited to temporal Input modes.
const invalid: TemporalFieldInputType = 'color';
void [type, directive, invalid];
