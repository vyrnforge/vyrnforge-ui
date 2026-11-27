import { Slider, type SliderProps } from '@vyrnforge/react/slider';
const props: SliderProps = { min: 0, max: 100, step: 5, name: 'volume', size: 'sm', orientation: 'vertical', marks: [{ value: 0, label: '0%' }], valueLabelDisplay: 'auto', formatValue: v => v + '%' };
const control: typeof Slider = Slider;
void [props, control];

const simple: SliderProps = { tooltip: true };
const advanced: SliderProps = { tooltip: { display: 'always', placement: 'top-start', size: 'sm', arrow: true, format: v => v + '%' } };
// @ts-expect-error invalid tooltip placement
const invalid: SliderProps = { tooltip: { placement: 'center' } };
void [simple, advanced, invalid];
