import { NumberInput, type NumberInputProps } from '@vyrnforge/react/number-input';
const props: NumberInputProps = { min: 0, max: 10, step: 1, name: 'count' };
const control: typeof NumberInput = NumberInput;
void [props, control];
