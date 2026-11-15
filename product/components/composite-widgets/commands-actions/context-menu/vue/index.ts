import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
  provide,
  ref,
  type InjectionKey,
  type Ref,
} from 'vue';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const menuItemSelector = '[data-vf-context-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-context-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-context-menu-content]') === root ? item : null;
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface ContextMenuContext {
  open: Ref<boolean>;
  setOpen(value: boolean): void;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
  focusRequest: Ref<'first' | 'last' | null>;
  focusRevision: Ref<number>;
}
const key: InjectionKey<ContextMenuContext> = Symbol('vf-context-menu');
function useContextMenu(): ContextMenuContext {
  const value = inject(key);
  if (!value) throw new Error('Menu parts must be used inside ContextMenuRoot.');
  return value;
}

export const ContextMenuRoot = defineComponent({
  name: 'ContextMenuRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const internal = ref(props.defaultOpen);
    const expanded = computed(() => props.open ?? internal.value);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const focusRequest = ref<'first' | 'last' | null>(null);
    const focusRevision = ref(0);
    const openRef = computed({
      get: () => expanded.value,
      set: (value) => {
        if (value === expanded.value) return;
        if (props.open === undefined) internal.value = value;
        emit('update:open', value);
      },
    });
    provide(key, {
      open: openRef,
      setOpen: (value) => {
        openRef.value = value;
      },
      anchor,
      surface,
      focusRequest,
      focusRevision,
      focusMenu(edge) {
        focusRequest.value = edge;
        focusRevision.value += 1;
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
    function openMenu(event: Event) {
      const target = event.target;
      const trigger = event.currentTarget as HTMLElement;
      if (event.defaultPrevented || !(target instanceof Element) || target.closest('[data-vf-context-menu-trigger]') !== trigger) return;
      event.preventDefault();
      trigger.focus();
      menu.setOpen(true);
      menu.focusMenu('first');
    }
    return () => h('div', {
      ...attrs,
      tabindex: attrs.tabindex ?? attrs.tabIndex ?? 0,
      ref: (node: unknown) => { menu.anchor.value = node as HTMLElement | null; },
      'data-vf-context-menu-trigger': '',
      onContextmenu(event: MouseEvent) {
        invoke(attrs.onContextmenu, event);
        openMenu(event);
      },
      onKeydown(event: KeyboardEvent) {
        invoke(attrs.onKeydown, event);
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) openMenu(event);
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
    let restoreFocus = false;
    function sync() {
      const surface = menu.surface.value;
      const trigger = menu.anchor.value;
      if (!surface || !trigger) return;
      if (!menu.open.value) {
        menu.focusRequest.value = null;
        if (timer !== null) clearTimeout(timer);
        timer = null;
        query = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = menu.focusRequest.value;
      menu.focusRequest.value = null;
      if (!edge || !surface.matches(':popover-open')) return;
      const items = menuItems(surface);
      const index = resolveNavigationIndex(
        items.map(() => ({})),
        edge === 'first' ? -1 : items.length,
        edge,
      );
      if (index != null) items[index]?.focus();
    }
    onMounted(sync);
    watch([menu.open, menu.focusRevision, menu.anchor, menu.surface], sync, { flush: 'post' });
    onBeforeUnmount(() => {
      if (timer !== null) clearTimeout(timer);
    });
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: (node: unknown) => {
            menu.surface.value = node as HTMLElement | null;
          },
          role: 'menu',
          tabindex: -1,
          popover: 'auto',
          'data-vf-context-menu-content': '',
          'data-vf-placement': 'bottom-start',
          'data-vf-open': menu.open.value ? '' : undefined,
          onBeforetoggle(event: Event) {
            invoke(attrs.onBeforetoggle, event);
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            restoreFocus = surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
          },
          onToggle(event: Event) {
            invoke(attrs.onToggle, event);
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            const actual = surface.matches(':popover-open');
            if (!actual && restoreFocus) {
              restoreFocus = false;
              const active = surface.ownerDocument.activeElement;
              if (!active || active === surface.ownerDocument.body || surface.contains(active))
                menu.anchor.value?.focus();
            }
            if (actual === menu.open.value) return;
            menu.setOpen(actual);
            void nextTick(sync);
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (
              event.defaultPrevented ||
              !(event.target instanceof HTMLElement) ||
              event.target.closest('[data-vf-context-menu-content]') !== event.currentTarget
            )
              return;
            if (event.key === 'Escape') {
              event.preventDefault();
              menu.setOpen(false);
              return;
            }
            if (event.key === 'Tab') {
              menu.setOpen(false);
              menu.anchor.value?.focus();
              return;
            }
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
            if (intent)
              next = resolveNavigationIndex(
                items.map(() => ({})),
                current,
                intent,
              );
            else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
              query += event.key;
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                query = '';
              }, 500);
              next = findTypeaheadMatch(
                items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })),
                query,
                { startIndex: current },
              );
            }
            if (next == null) return;
            event.preventDefault();
            items[next]?.focus();
          },
        },
        slots.default?.(),
      );
  },
});

export const ContextMenuItem = defineComponent({
  name: 'ContextMenuItem',
  props: { disabled: Boolean },
  emits: ['select'],
  inheritAttrs: false,
  setup(props, { attrs, slots, emit }) {
    const menu = useContextMenu();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          role: 'menuitem',
          tabindex: -1,
          disabled: undefined,
          'aria-disabled': props.disabled || attrs['aria-disabled'] || undefined,
          'data-vf-context-menu-item': '',
          onClick: (event: MouseEvent) => {
            if (props.disabled || attrs['aria-disabled'] === true || attrs['aria-disabled'] === 'true') {
              event.preventDefault();
              return;
            }
            invoke(attrs.onClick, event);
            if (event.defaultPrevented) return;
            emit('select');
            menu.setOpen(false);
          },
        },
        slots.default?.(),
      );
  },
});

