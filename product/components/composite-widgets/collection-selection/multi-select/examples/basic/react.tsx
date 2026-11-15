import {
  MultiSelectContent,
  MultiSelectOption,
  MultiSelectRoot,
  MultiSelectTrigger,
} from '@vyrnforge/react/multi-select';
export function Example() {
  return (
    <MultiSelectRoot>
      <MultiSelectTrigger>Choose frameworks</MultiSelectTrigger>
      <MultiSelectContent aria-label="Frameworks">
        <MultiSelectOption value="React">React</MultiSelectOption>
        <MultiSelectOption value="Vue">Vue</MultiSelectOption>
      </MultiSelectContent>
    </MultiSelectRoot>
  );
}
