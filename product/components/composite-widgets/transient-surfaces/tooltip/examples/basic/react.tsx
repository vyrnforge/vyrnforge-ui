import { Button } from '@vyrnforge/react/button';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '@vyrnforge/react/tooltip';
export default () => (
  <TooltipRoot>
    <TooltipTrigger>
      <Button type="button">Info</Button>
    </TooltipTrigger>
    <TooltipContent>More information</TooltipContent>
  </TooltipRoot>
);
