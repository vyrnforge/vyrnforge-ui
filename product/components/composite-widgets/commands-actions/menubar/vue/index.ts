import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../menu/index.js';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';

const rootSelector = '[data-vf-menubar-root]';
const triggerSelector = '[data-vf-menubar-trigger]';

function triggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(triggerSelector)).filter(
    (item) => item.closest(rootSelector) === root,
  );
}

function triggerFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(triggerSelector) : null;
  return item?.closest(rootSelector) === root ? item : null;
}

function syncTabStops(root: HTMLElement, preferred?: HTMLButtonElement | null): void {
  const items = triggers(root);
  const eligible = items.filter((item) => !item.matches(':disabled'));
  const remembered = eligible.find((item) => item.tabIndex === 0);
  const active = preferred && eligible.includes(preferred) ? preferred : (remembered ?? eligible[0]);
  for (const item of items) {
    const tabIndex = item === active ? 0 : -1;
    if (item.tabIndex !== tabIndex) item.tabIndex = tabIndex;
  }
}

type NavigationEvent = Pick<KeyboardEvent, 'key' | 'defaultPrevented' | 'preventDefault'>;
function moveFocus(root: HTMLElement, current: HTMLButtonElement, event: NavigationEvent): void {
  if (event.defaultPrevented) return;
  const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent =
    event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          ? navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction)
          : null;
  if (!intent) return;
  const items = triggers(root);
  const index = items.indexOf(current);
  if (index < 0) return;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    index,
    intent,
  );
  if (next == null) return;
  const item = items[next];
  if (!item) return;
  event.preventDefault();
  syncTabStops(root, item);
  item.focus();
}

function observeTriggers(root: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => {
    syncTabStops(root, triggerFromTarget(root, root.ownerDocument.activeElement));
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'data-vf-menubar-trigger', 'data-vf-menubar-root'],
  });
  return observer;
}

function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

export const MenubarRoot = defineComponent({
  name: 'MenubarRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const root = ref<HTMLElement | null>(null);
    let observer: MutationObserver | undefined;
    onMounted(() => {
      if (!root.value) return;
      syncTabStops(root.value);
      if (typeof MutationObserver !== 'undefined') observer = observeTriggers(root.value);
    });
    onBeforeUnmount(() => observer?.disconnect());
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: root,
          role: 'menubar',
          'data-vf-menubar-root': '',
          onFocusin: (event: FocusEvent) => {
            invoke(attrs.onFocusin, event);
            if (!root.value) return;
            const item = triggerFromTarget(root.value, event.target);
            if (item) syncTabStops(root.value, item);
          },
        },
        slots.default?.(),
      );
  },
});
export const MenubarMenu = MenuRoot;
export const MenubarTrigger = defineComponent({
  name: 'MenubarTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        MenuTrigger,
        {
          ...attrs,
          role: 'menuitem',
          'data-vf-menubar-trigger': '',
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            const trigger = event.currentTarget as HTMLButtonElement;
            const bar = trigger.closest<HTMLElement>(rootSelector);
            if (bar) moveFocus(bar, trigger, event);
          },
        },
        slots,
      );
  },
});
export const MenubarContent = MenuContent;
export const MenubarItem = MenuItem;
