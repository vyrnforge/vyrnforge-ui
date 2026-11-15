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
  type PropType,
  type Ref,
} from 'vue';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

function adjacentMenubarTrigger(
  trigger: HTMLElement | null,
  event: Pick<KeyboardEvent, 'key'>,
): HTMLButtonElement | null {
  if (!trigger?.matches('[data-vf-menubar-trigger]') || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'))
    return null;
  const bar = trigger.closest('[data-vf-menubar-root]');
  if (!bar) return null;
  const items = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-vf-menubar-trigger]')).filter(
    (item) => item.closest('[data-vf-menubar-root]') === bar,
  );
  const direction = getComputedStyle(bar).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent = navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction);
  if (!intent) return null;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    items.indexOf(trigger as HTMLButtonElement),
    intent,
  );
  return next == null || items[next] === trigger ? null : (items[next] ?? null);
}

function submenuArrow(trigger: HTMLElement, opening: boolean): 'ArrowLeft' | 'ArrowRight' {
  const rtl = getComputedStyle(trigger).direction === 'rtl';
  return opening === rtl ? 'ArrowLeft' : 'ArrowRight';
}

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface MenuContext {
  parent: MenuContext | null;
  open: Ref<boolean>;
  setOpen(value: boolean): void;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  placement: Ref<FloatingPlacement>;
  focusMenu(edge: 'first' | 'last'): void;
  focusRequest: Ref<'first' | 'last' | null>;
  focusRevision: Ref<number>;
}
const key: InjectionKey<MenuContext> = Symbol('vf-menu');
const contentKey: InjectionKey<MenuContext> = Symbol('vf-menu-content');
function closeMenuChain(menu: MenuContext): MenuContext {
  let current = menu;
  current.setOpen(false);
  while (current.parent) {
    current = current.parent;
    current.setOpen(false);
  }
  return current;
}
const menusByTrigger = new WeakMap<HTMLElement, MenuContext>();
function useMenu(): MenuContext {
  const value = inject(key);
  if (!value) throw new Error('Menu parts must be used inside MenuRoot.');
  return value;
}

export const MenuRoot = defineComponent({
  name: 'MenuRoot',
  props: {
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const parent = inject(contentKey, null);
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
      parent,
      open: openRef,
      setOpen: (value) => {
        openRef.value = value;
      },
      anchor,
      surface,
      placement: computed(() => props.placement),
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

export const MenuTrigger = defineComponent({
  name: 'MenuTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useMenu();
    const openAndFocus = (edge: 'first' | 'last') => {
      menu.setOpen(true);
      menu.focusMenu(edge);
    };
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          ref: (node: unknown) => {
            if (menu.anchor.value) menusByTrigger.delete(menu.anchor.value);
            menu.anchor.value = node as HTMLElement | null;
            if (menu.anchor.value) menusByTrigger.set(menu.anchor.value, menu);
          },
          ...(menu.parent ? { role: 'menuitem', tabindex: -1, 'data-vf-menu-item': '' } : {}),
          'data-vf-menu-trigger': '',
          'aria-haspopup': 'menu',
          'aria-expanded': menu.open.value,
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (
              event.defaultPrevented ||
              (event.currentTarget as HTMLElement).matches(':disabled,[aria-disabled="true"]')
            )
              return;
            if (menu.open.value) menu.setOpen(false);
            else openAndFocus('first');
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            const trigger = event.currentTarget as HTMLElement;
            if (event.defaultPrevented || trigger.matches(':disabled,[aria-disabled="true"]')) return;
            if (menu.parent) {
              if (event.key === submenuArrow(trigger, true) || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openAndFocus('first');
              }
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              openAndFocus('last');
            } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openAndFocus('first');
            }
          },
        },
        slots.default?.(),
      );
  },
});

export const MenuContent = defineComponent({
  name: 'MenuContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const menu = useMenu();
    provide(contentKey, menu);
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let restoreFocus = false;
    let switchTarget: HTMLButtonElement | null = null;
    function sync() {
      const surface = menu.surface.value;
      const trigger = menu.anchor.value;
      if (!surface || !trigger) return;
      if (!menu.open.value || (menu.parent && !menu.parent.open.value)) {
        menu.focusRequest.value = null;
        if (timer !== null) clearTimeout(timer);
        timer = null;
        query = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        const next = switchTarget;
        switchTarget = null;
        const targetMenu = next ? menusByTrigger.get(next) : undefined;
        if (next?.isConnected && targetMenu) {
          next.focus();
          targetMenu.setOpen(true);
          targetMenu.focusMenu('first');
        }
        return;
      }
      switchTarget = null;
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = menu.focusRequest.value;
      menu.focusRequest.value = null;
      if (!edge || !surface.matches(':popover-open')) return;
      const items = menuItems(surface);
      const index = resolveNavigationIndex(
        items.map((item) => ({ eligible: !item.matches(':disabled') })),
        edge === 'first' ? -1 : items.length,
        edge,
      );
      if (index != null) items[index]?.focus();
    }
    onMounted(sync);
    watch([menu.open, menu.focusRevision, menu.anchor, menu.surface, () => menu.parent?.open.value], sync, {
      flush: 'post',
    });
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
          'data-vf-menu-content': '',
          'data-vf-menu-submenu': menu.parent ? '' : undefined,
          'data-vf-placement': menu.placement.value,
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
              event.target.closest('[data-vf-menu-content]') !== event.currentTarget
            )
              return;
            const nextTrigger = adjacentMenubarTrigger(menu.anchor.value, event);
            if (nextTrigger && menusByTrigger.has(nextTrigger)) {
              event.preventDefault();
              switchTarget = nextTrigger;
              menu.setOpen(false);
              void nextTick(sync);
              return;
            }
            if (
              event.key === 'Escape' ||
              (menu.parent && menu.anchor.value && event.key === submenuArrow(menu.anchor.value, false))
            ) {
              event.preventDefault();
              menu.setOpen(false);
              return;
            }
            if (event.key === 'Tab') {
              closeMenuChain(menu).anchor.value?.focus();
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
                items.map((item) => ({ eligible: !item.matches(':disabled') })),
                current,
                intent,
              );
            else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
              query += event.key;
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                query = '';
              }, 500);
              next = findTypeaheadMatch(
                items.map((item) => ({
                  textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
                  eligible: !item.matches(':disabled'),
                })),
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

export const MenuItem = defineComponent({
  name: 'MenuItem',
  props: { disabled: Boolean },
  emits: ['select'],
  inheritAttrs: false,
  setup(props, { attrs, slots, emit }) {
    const menu = useMenu();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          role: 'menuitem',
          tabindex: -1,
          disabled: undefined,
          'aria-disabled': props.disabled || undefined,
          'data-vf-menu-item': '',
          onClick: (event: MouseEvent) => {
            if (props.disabled) {
              event.preventDefault();
              return;
            }
            invoke(attrs.onClick, event);
            if (event.defaultPrevented) return;
            emit('select');
            closeMenuChain(menu);
          },
        },
        slots.default?.(),
      );
  },
});

export const MenuSeparator = defineComponent({
  name: 'MenuSeparator',
  setup(_, { attrs }) {
    return () => h('div', { ...attrs, role: 'separator', 'data-vf-menu-separator': '' });
  },
});
