import { Radio, type RadioProps } from '@vyrnforge/react/radio';
const props: RadioProps = { name: 'plan', value: 'basic' };
const control: typeof Radio = Radio;
void [props, control];
