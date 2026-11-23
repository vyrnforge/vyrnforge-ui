import { ToggleButton, type ToggleButtonProps } from '@vyrnforge/react/toggle-button';
const props: ToggleButtonProps = { pressed: true, size: 'lg', iconOnly: true, onPressedChange: () => undefined };
// @ts-expect-error unsupported Button size
const invalid: ToggleButtonProps = { size: 'xl' };
const control: typeof ToggleButton = ToggleButton;
void [props, control, invalid];
