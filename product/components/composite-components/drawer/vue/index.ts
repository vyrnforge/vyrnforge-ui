import { defineComponent, h, type PropType } from 'vue';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle, type DialogRootProps } from '../dialog/index.js';
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom'; export interface DrawerRootProps extends DialogRootProps { placement?: DrawerPlacement; }
export const DrawerRoot = defineComponent({ name: 'VfDrawerRoot', inheritAttrs: false, props: { placement: { type: String as PropType<DrawerPlacement>, default: 'end' } }, setup(props, { attrs, slots }) { return () => h(DialogRoot, { ...attrs, 'data-vf-drawer-root': '', 'data-vf-placement': props.placement }, slots.default?.()); } });
export const DrawerTitle = DialogTitle; export const DrawerDescription = DialogDescription; export const DrawerBody = DialogBody; export const DrawerClose = DialogClose;
