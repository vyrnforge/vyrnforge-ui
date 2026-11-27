import { TooltipContent } from '@vyrnforge/react/tooltip';
import type { TooltipContentProps } from '@vyrnforge/react/tooltip';
const props: TooltipContentProps = { arrow: true, size: 'lg' };
// @ts-expect-error unsupported semantic size
const invalid: TooltipContentProps = { size: 'xl' };
void [TooltipContent, props, invalid];
