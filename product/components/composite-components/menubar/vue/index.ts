import { defineComponent, h } from 'vue';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../menu/index.js';
export const MenubarRoot = defineComponent({ name: 'MenubarRoot', setup(_, { attrs, slots }) { return () => h('div', { ...attrs, role: 'menubar', 'data-vf-menubar-root': '' }, slots.default?.()); } });
export const MenubarMenu = MenuRoot;
export const MenubarTrigger = defineComponent({ name: 'MenubarTrigger', setup(_, { attrs, slots }) { return () => h(MenuTrigger, { ...attrs, role: 'menuitem', 'data-vf-menubar-trigger': '', onKeydown: (event: KeyboardEvent) => { if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return; const bar = (event.currentTarget as HTMLElement).closest('[role="menubar"]'); const items = Array.from(bar?.querySelectorAll<HTMLButtonElement>('[data-vf-menubar-trigger]') ?? []); const index = items.indexOf(event.currentTarget as HTMLButtonElement); if (index < 0) return; event.preventDefault(); items[(index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length]?.focus(); } }, slots); } });
export const MenubarContent = MenuContent;
export const MenubarItem = MenuItem;
