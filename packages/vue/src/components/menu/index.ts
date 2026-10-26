import { computed, defineComponent, h, inject, nextTick, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)); }
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null; return item && root.contains(item) ? item : null; }
function invoke(handler: unknown, event: Event) { if (typeof handler === 'function') handler(event); else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event); }

interface MenuContext { open: Ref<boolean>; setOpen(value: boolean): void; anchor: Ref<HTMLElement | null>; surface: Ref<HTMLElement | null>; placement: Ref<FloatingPlacement>; focusMenu(edge: 'first' | 'last'): void; }
const key: InjectionKey<MenuContext> = Symbol('vf-menu');
function useMenu(): MenuContext { const value = inject(key); if (!value) throw new Error('Menu parts must be used inside MenuRoot.'); return value; }

export const MenuRoot = defineComponent({
  name: 'MenuRoot',
  props: {
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const internal = ref(props.defaultOpen);
    const expanded = computed(() => props.open ?? internal.value);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const openRef = computed({ get: () => expanded.value, set: (value) => { if (props.open === undefined) internal.value = value; emit('update:open', value); } });
    provide(key, {
      open: openRef,
      setOpen: (value) => { openRef.value = value; },
      anchor,
      surface,
      placement: computed(() => props.placement),
      focusMenu(edge) {
        void nextTick(() => {
          const items = surface.value ? menuItems(surface.value) : [];
          const index = resolveEnabledIndex(items.map(() => ({})), edge === 'first' ? -1 : items.length, edge);
          if (index != null) items[index]?.focus();
        });
      },
    });
    return () => slots.default?.();
  },
});

export const MenuTrigger = defineComponent({
  name: 'MenuTrigger', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useMenu();
    const openAndFocus = (edge: 'first' | 'last') => { menu.setOpen(true); menu.focusMenu(edge); };
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      ref: (node: unknown) => { menu.anchor.value = node as HTMLElement | null; },
      'data-vf-menu-trigger': '',
      'aria-haspopup': 'menu',
      'aria-expanded': menu.open.value,
      onClick: (event: MouseEvent) => { invoke(attrs.onClick, event); if (event.defaultPrevented) return; if (menu.open.value) menu.setOpen(false); else openAndFocus('first'); },
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'ArrowUp') { event.preventDefault(); openAndFocus('last'); }
        else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openAndFocus('first'); }
      },
    }, slots.default?.());
  },
});

export const MenuContent = defineComponent({
  name: 'MenuContent', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useMenu();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    return () => menu.open.value ? h('div', {
      ...attrs,
      ref: (node: unknown) => { menu.surface.value = node as HTMLElement | null; },
      role: 'menu',
      tabindex: -1,
      'data-vf-menu-content': '',
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') { event.preventDefault(); menu.setOpen(false); menu.anchor.value?.focus(); return; }
        if (event.key === 'Tab') { menu.setOpen(false); menu.anchor.value?.focus(); return; }
        const root = event.currentTarget as HTMLElement;
        const items = menuItems(root);
        const currentItem = itemFromTarget(root, event.target);
        const current = currentItem ? items.indexOf(currentItem) : -1;
        let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
        if (event.key === 'ArrowDown') intent = 'next';
        else if (event.key === 'ArrowUp') intent = 'previous';
        else if (event.key === 'Home') intent = 'first';
        else if (event.key === 'End') intent = 'last';
        let next: number | null = null;
        if (intent) next = resolveEnabledIndex(items.map(() => ({})), current, intent);
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          query += event.key;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => { query = ''; }, 500);
          next = findTypeaheadMatch(items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })), query, { startIndex: current });
        }
        if (next == null) return;
        event.preventDefault();
        items[next]?.focus();
      },
    }, slots.default?.()) : null;
  },
});

export const MenuItem = defineComponent({
  name: 'MenuItem', props: { disabled: Boolean }, emits: ['select'], inheritAttrs: false,
  setup(props, { attrs, slots, emit }) {
    const menu = useMenu();
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      role: 'menuitem',
      tabindex: -1,
      disabled: undefined,
      'aria-disabled': props.disabled || undefined,
      'data-vf-menu-item': '',
      onClick: (event: MouseEvent) => {
        if (props.disabled) { event.preventDefault(); return; }
        invoke(attrs.onClick, event);
        if (event.defaultPrevented) return;
        emit('select');
        menu.setOpen(false);
        menu.anchor.value?.focus();
      },
    }, slots.default?.());
  },
});

export const MenuSeparator = defineComponent({ name: 'MenuSeparator', setup(_, { attrs }) { return () => h('div', { ...attrs, role: 'separator', 'data-vf-menu-separator': '' }); } });
