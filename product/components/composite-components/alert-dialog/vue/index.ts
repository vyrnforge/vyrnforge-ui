import { defineComponent, h } from 'vue';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle, type DialogDismissReason, type DialogDismissRequest, type DialogRootProps } from '../dialog/index.js';
export type AlertDialogDismissReason = DialogDismissReason; export type AlertDialogDismissRequest = DialogDismissRequest; export type AlertDialogRootProps = Omit<DialogRootProps, 'backdropDismiss'>;
export const AlertDialogRoot = defineComponent({ name: 'VfAlertDialogRoot', inheritAttrs: false, setup(_p, { attrs, slots }) { return () => h(DialogRoot, { ...attrs, role: 'alertdialog', backdropDismiss: false, 'data-vf-alert-dialog-root': '' }, slots.default?.()); } });
export const AlertDialogTitle = DialogTitle; export const AlertDialogDescription = DialogDescription; export const AlertDialogBody = DialogBody; export const AlertDialogCancel = DialogClose; export const AlertDialogAction = DialogClose;
