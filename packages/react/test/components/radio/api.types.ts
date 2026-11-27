import { Radio, type RadioProps } from '@vyrnforge/react/radio';
const props: RadioProps = { name: 'plan', value: 'basic', size: 'lg' };
const control: typeof Radio = Radio;
void [props, control];

// @ts-expect-error Radio size is a visual token, not the native text-input size.
const invalidSize: RadioProps = { size: 5 };
void invalidSize;
