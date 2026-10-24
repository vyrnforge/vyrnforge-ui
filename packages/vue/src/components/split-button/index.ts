import { defineComponent, h } from 'vue';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../menu/index.js';
export const SplitButtonRoot = defineComponent({ name: 'SplitButtonRoot', setup(_, { attrs, slots }) { return () => h(MenuRoot, null, { default: () => h('div', { ...attrs, 'data-vf-split-button-root': '' }, slots.default?.()) }); } });
export const SplitButtonAction = defineComponent({ name: 'SplitButtonAction', setup(_, { attrs, slots }) { return () => h('button', { ...attrs, type: (attrs.type as string | undefined) ?? 'button', 'data-vf-split-button-action': '' }, slots.default?.()); } });
export const SplitButtonTrigger = defineComponent({ name: 'SplitButtonTrigger', setup(_, { attrs, slots }) { return () => h(MenuTrigger, { ...attrs, 'data-vf-split-button-trigger': '', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'More actions' }, slots); } });
export const SplitButtonContent = MenuContent;
export const SplitButtonItem = MenuItem;
