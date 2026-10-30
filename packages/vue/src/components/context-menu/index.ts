import { computed, defineComponent, getCurrentInstance, h, inject, nextTick, provide, ref, type InjectionKey, type Ref } from 'vue';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const itemSelector = '[data-vf-context-menu-item]';
function itemsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(itemSelector));
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}
function itemDisabled(item: HTMLButtonElement): boolean {
  return item.disabled || item.getAttribute('aria-disabled') === 'true';
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface ContextMenuContext {
  open: Ref<boolean>;
  setOpen(value: boolean): void;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
}
const key: InjectionKey<ContextMenuContext> = Symbol('vf-context-menu');
function useContextMenu(): ContextMenuContext {
  const value = inject(key);
  if (!value) throw new Error('ContextMenu parts must be used inside ContextMenuRoot.');
  return value;
}

export const ContextMenuRoot = defineComponent({
  name: 'ContextMenuRoot',
  props: { open: Boolean, defaultOpen: Boolean },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const instance = getCurrentInstance();
    const internal = ref(props.defaultOpen);
    const hasOpenProp = () => Boolean(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'open'));
    const expanded = computed(() => hasOpenProp() ? props.open : internal.value);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const openRef = computed({
      get: () => expanded.value,
      set(value) {
        if (!hasOpenProp()) internal.value = value;
        emit('update:open', value);
      },
    });
    provide(key, {
      open: openRef,
      anchor,
      surface,
      setOpen(value) { openRef.value = value; },
      focusMenu(edge) {
        void nextTick(() => {
          if (!surface.value) return;
          const items = itemsFor(surface.value);
          const states = items.map((item) => ({ disabled: itemDisabled(item) }));
          const index = resolveEnabledIndex(states, edge === 'first' ? -1 : items.length, edge);
          if (index != null) items[index]?.focus();
        });
      },
    });
    return () => slots.default?.();
  },
});

export const ContextMenuTrigger = defineComponent({
  name: 'ContextMenuTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useContextMenu();
    return () => h('div', {
      ...attrs,
      ref: (node: unknown) => { menu.anchor.value = node as HTMLElement | null; },
      'data-vf-context-menu-trigger': '',
      onContextmenu: (event: MouseEvent) => {
        invoke(attrs.onContextmenu, event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        menu.setOpen(true);
        menu.focusMenu('first');
      },
    }, slots.default?.());
  },
});

export const ContextMenuContent = defineComponent({
  name: 'ContextMenuContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useContextMenu();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    return () => menu.open.value ? h('div', {
      ...attrs,
      ref: (node: unknown) => { menu.surface.value = node as HTMLElement | null; },
      role: 'menu',
      tabindex: -1,
      'data-vf-context-menu-content': '',
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          menu.setOpen(false);
          menu.anchor.value?.focus();
          return;
        }
        const root = event.currentTarget as HTMLElement;
        const items = itemsFor(root);
        const currentItem = itemFromTarget(root, event.target);
        const current = currentItem ? items.indexOf(currentItem) : -1;
        const states = items.map((item) => ({ disabled: itemDisabled(item) }));
        let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
        if (event.key === 'ArrowDown') intent = 'next';
        else if (event.key === 'ArrowUp') intent = 'previous';
        else if (event.key === 'Home') intent = 'first';
        else if (event.key === 'End') intent = 'last';
        let next: number | null = null;
        if (intent) next = resolveEnabledIndex(states, current, intent);
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          query += event.key;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => { query = ''; }, 500);
          next = findTypeaheadMatch(items.map((item) => ({
            textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
            disabled: itemDisabled(item),
          })), query, { startIndex: current });
        }
        if (next == null) return;
        event.preventDefault();
        items[next]?.focus();
      },
    }, slots.default?.()) : null;
  },
});

export const ContextMenuItem = defineComponent({
  name: 'ContextMenuItem',
  props: { disabled: Boolean },
  emits: ['select'],
  inheritAttrs: false,
  setup(props, { attrs, slots, emit }) {
    const menu = useContextMenu();
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      role: 'menuitem',
      tabindex: -1,
      disabled: props.disabled,
      'aria-disabled': props.disabled || undefined,
      'data-vf-context-menu-item': '',
      onClick: (event: MouseEvent) => {
        invoke(attrs.onClick, event);
        if (event.defaultPrevented || props.disabled) return;
        emit('select');
        menu.setOpen(false);
        menu.anchor.value?.focus();
      },
    }, slots.default?.());
  },
});
