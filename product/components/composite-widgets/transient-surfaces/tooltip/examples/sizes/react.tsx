import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';

function Example() {
  return (
    <Flow direction="inline" gap="md" wrap="wrap">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <TooltipRoot key={size} placement="bottom">
          <TooltipTrigger>
            <Button type="button" variant="secondary" size="sm">
              {size}
            </Button>
          </TooltipTrigger>
          <TooltipContent size={size} arrow={size !== 'md'}>
            {size === 'md' ? 'No arrow' : 'With arrow'}
          </TooltipContent>
        </TooltipRoot>
      ))}
    </Flow>
  );
}
const root = document.querySelector('#root');
if (root) createRoot(root).render(<Example />);
