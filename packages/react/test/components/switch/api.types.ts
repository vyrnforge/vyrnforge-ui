import { Switch, type SwitchProps } from '@vyrnforge/react/switch';
const props: SwitchProps = { name: 'enabled', disabled: false };
const control: typeof Switch = Switch;
void [props, control];
