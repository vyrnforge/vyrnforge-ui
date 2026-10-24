import { createElement, type ComponentProps } from 'react';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle, type DialogRootProps } from '../dialog/index.js';
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export interface DrawerRootProps extends DialogRootProps { placement?: DrawerPlacement; }
export function DrawerRoot({ placement = 'end', ...props }: DrawerRootProps) { return createElement(DialogRoot, { ...props, 'data-vf-drawer-root': '', 'data-vf-placement': placement }); }
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;
export const DrawerBody = DialogBody;
export const DrawerClose = DialogClose;
export type DrawerTitleProps = ComponentProps<typeof DrawerTitle>;
export type DrawerDescriptionProps = ComponentProps<typeof DrawerDescription>;
export type DrawerBodyProps = ComponentProps<typeof DrawerBody>;
export type DrawerCloseProps = ComponentProps<typeof DrawerClose>;
