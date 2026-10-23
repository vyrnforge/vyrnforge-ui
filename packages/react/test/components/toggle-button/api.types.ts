import { ToggleButton, type ToggleButtonProps } from '@vyrnforge/react/toggle-button';
const props: ToggleButtonProps = { pressed: true, onPressedChange: () => undefined };
const control: typeof ToggleButton = ToggleButton;
void [props, control];
