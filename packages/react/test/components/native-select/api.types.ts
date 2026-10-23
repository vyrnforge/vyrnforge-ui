import { NativeSelect, type NativeSelectProps } from '@vyrnforge/react/native-select';
const props: NativeSelectProps = { name: 'region', required: true };
const control: typeof NativeSelect = NativeSelect;
void [props, control];
