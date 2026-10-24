import { createElement, type ComponentProps } from 'react';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle, type DialogDismissRequest, type DialogDismissReason, type DialogRootProps } from '../dialog/index.js';

export type AlertDialogDismissReason = DialogDismissReason;
export type AlertDialogDismissRequest = DialogDismissRequest;
export type AlertDialogRootProps = Omit<DialogRootProps, 'backdropDismiss'>;
export function AlertDialogRoot(props: AlertDialogRootProps) { return createElement(DialogRoot, { ...props, role: 'alertdialog', backdropDismiss: false, 'data-vf-alert-dialog-root': '' }); }
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogBody = DialogBody;
export const AlertDialogCancel = DialogClose;
export const AlertDialogAction = DialogClose;
export type AlertDialogTitleProps = ComponentProps<typeof AlertDialogTitle>;
export type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogDescription>;
export type AlertDialogBodyProps = ComponentProps<typeof AlertDialogBody>;
export type AlertDialogCancelProps = ComponentProps<typeof AlertDialogCancel>;
export type AlertDialogActionProps = ComponentProps<typeof AlertDialogAction>;
