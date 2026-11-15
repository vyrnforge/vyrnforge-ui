import { SelectContent, SelectOption, SelectRoot, SelectTrigger } from '@vyrnforge/react/select';
export function Example() {
  return (
    <SelectRoot defaultValue="one">
      <SelectTrigger>Choose</SelectTrigger>
      <SelectContent aria-label="Choose an option">
        <SelectOption value="one">One</SelectOption>
        <SelectOption value="two">Two</SelectOption>
      </SelectContent>
    </SelectRoot>
  );
}
