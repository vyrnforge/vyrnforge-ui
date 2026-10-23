import { ColorInput, type ColorInputProps } from '@vyrnforge/react/color-input';
const props: ColorInputProps = { name: 'accent', defaultValue: '#2563eb' };
const control: typeof ColorInput = ColorInput;
void [props, control];
