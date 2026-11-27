import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';

function Example() {
  return (
    <Flow direction="inline" gap="md" wrap="wrap">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <TooltipRoot key={placement} placement={placement}>
          <TooltipTrigger>
            <Button type="button" variant="secondary" size="sm">
              {placement}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Preferred placement: {placement}</TooltipContent>
        </TooltipRoot>
      ))}
    </Flow>
  );
}
const root = document.querySelector('#root');
if (root) createRoot(root).render(<Example />);
