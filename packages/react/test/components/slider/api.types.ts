import { Slider, type SliderProps } from '@vyrnforge/react/slider';
const props: SliderProps = { min: 0, max: 100, step: 5, name: 'volume', size: 'sm', orientation: 'vertical', marks: [{ value: 0, label: '0%' }], valueLabelDisplay: 'auto', formatValue: v => v + '%' };
const control: typeof Slider = Slider;
void [props, control];
