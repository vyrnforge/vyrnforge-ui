import { Slider, type SliderProps } from '@vyrnforge/react/slider';
const props: SliderProps = { min: 0, max: 100, step: 5, name: 'volume' };
const control: typeof Slider = Slider;
void [props, control];
