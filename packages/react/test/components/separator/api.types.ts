import { Separator, type SeparatorOrientation, type SeparatorProps } from '@vyrnforge/react/separator';
const orientation: SeparatorOrientation = 'vertical';
const props: SeparatorProps = { orientation, id: 'divider', 'aria-label': 'Section divider' };
const component: typeof Separator = Separator;
// @ts-expect-error unsupported orientation
const invalid: SeparatorOrientation = 'diagonal';
void [orientation, props, component, invalid];
