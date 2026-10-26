import { ComboboxContent, ComboboxInput, ComboboxOption, ComboboxRoot } from '@vyrnforge/react/combobox';

export function Example() {
  return <ComboboxRoot><ComboboxInput aria-label="Framework"/><ComboboxContent><ComboboxOption value="React">React</ComboboxOption><ComboboxOption value="Vue">Vue</ComboboxOption></ComboboxContent></ComboboxRoot>;
}
