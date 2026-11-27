import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { infoIcon } from '@vyrnforge/icons/info';
import { Flow } from '@vyrnforge/react/layout';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '@vyrnforge/react/tooltip';

function Example() {
  return <Flow direction="inline" align="center" gap="sm">
    <TooltipRoot placement="right">
      <TooltipTrigger>
        <Button type="button" variant="ghost" size="sm" iconOnly aria-label="About this setting"><Icon icon={infoIcon} size="sm" /></Button>
      </TooltipTrigger>
      <TooltipContent>Changes apply to future sessions.</TooltipContent>
    </TooltipRoot>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<Example />);
