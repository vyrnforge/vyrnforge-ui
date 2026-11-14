import {
  ColorPickerInput,
  ColorPickerRoot,
  ColorPickerSwatch,
  ColorPickerTextInput,
} from '@vyrnforge/react/color-picker';
export function Example() {
  return (
    <ColorPickerRoot defaultValue="#3366ff">
      <ColorPickerInput aria-label="Choose color" />
      <ColorPickerTextInput aria-label="Color value" />
      <ColorPickerSwatch />
    </ColorPickerRoot>
  );
}
