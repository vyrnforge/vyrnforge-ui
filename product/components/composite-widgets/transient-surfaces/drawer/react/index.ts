import { createElement, type ComponentProps } from 'react';
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  type DialogRootProps,
} from '../dialog/index.js';
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export interface DrawerRootProps extends DialogRootProps {
  placement?: DrawerPlacement;
}
export function DrawerRoot({ placement = 'end', ...props }: DrawerRootProps) {
  const rootProps = { ...props, 'data-vf-drawer-root': '', 'data-vf-placement': placement };
  return createElement(DialogRoot, rootProps);
}
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;
export const DrawerBody = DialogBody;
export const DrawerHeader = DialogHeader;
export const DrawerFooter = DialogFooter;
export type DrawerHeaderProps = ComponentProps<typeof DrawerHeader>;
export type DrawerFooterProps = ComponentProps<typeof DrawerFooter>;
export const DrawerClose = DialogClose;
export type DrawerTitleProps = ComponentProps<typeof DrawerTitle>;
export type DrawerDescriptionProps = ComponentProps<typeof DrawerDescription>;
export type DrawerBodyProps = ComponentProps<typeof DrawerBody>;
export type DrawerCloseProps = ComponentProps<typeof DrawerClose>;
