import { ToggleGroupItem, ToggleGroupRoot } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { listIcon } from '@vyrnforge/icons/list';
import { gridIcon } from '@vyrnforge/icons/grid';
import '@vyrnforge/web/styles/icon.css';

export function Example() {
  return (
    <>
      <ToggleGroupRoot type="multiple" aria-label="Text formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroupRoot>
      <ToggleGroupRoot type="single" defaultValue="list" aria-label="View mode">
        <ToggleGroupItem value="list" data-vf-icon-only="" aria-label="List view">
          <Icon icon={listIcon} />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" data-vf-icon-only="" aria-label="Grid view">
          <Icon icon={gridIcon} />
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </>
  );
}
