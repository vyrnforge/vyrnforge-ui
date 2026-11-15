import { ToggleGroupItem, ToggleGroupRoot } from '@vyrnforge/react/toggle-group';
export function Example() {
  return (
    <ToggleGroupRoot type="multiple" aria-label="Text formatting">
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
    </ToggleGroupRoot>
  );
}
