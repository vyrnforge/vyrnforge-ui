import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <TooltipRoot open={open} onOpenChange={setOpen} placement="right">
      <TooltipTrigger>
        <Button type="button" variant="secondary" size="sm">
          Help
        </Button>
      </TooltipTrigger>
      <TooltipContent>Supplementary help controlled by React state.</TooltipContent>
    </TooltipRoot>
  );
}
const root = document.querySelector('#root');
if (root) createRoot(root).render(<Example />);
