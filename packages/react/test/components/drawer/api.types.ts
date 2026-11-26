import type { DrawerHeaderProps, DrawerFooterProps } from '@vyrnforge/react/drawer';

const header: DrawerHeaderProps = { divider: true, children: 'Header' };
const footer: DrawerFooterProps = { children: 'Footer' };
void [header, footer];
