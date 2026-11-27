import { createRoot } from 'react-dom/client';
import { ThemeScope, colors } from '@vyrnforge/react';
import { Button } from '@vyrnforge/react/button';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';

function Example() {
  return (
    <ThemeScope tokens={{ tooltip: { background: colors.accent, foreground: colors.onAccent, radius: '8px' } }}>
      <TooltipRoot placement="right">
        <TooltipTrigger>
          <Button type="button" variant="secondary" size="sm">
            Themed help
          </Button>
        </TooltipTrigger>
        <TooltipContent>Uses the current theme accent roles.</TooltipContent>
      </TooltipRoot>
    </ThemeScope>
  );
}
const root = document.querySelector('#root');
if (root) createRoot(root).render(<Example />);
