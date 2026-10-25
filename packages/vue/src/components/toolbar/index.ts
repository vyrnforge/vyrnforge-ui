import { navigationIntentForArrow, type CollectionNavigationArrow, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
import { resolveCompositeFocusIndex, rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType } from 'vue';

export type ToolbarOrientation = 'horizontal' | 'vertical';

function toolbarItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>('[data-vf-toolbar-item]')); }
function disabled(item: HTMLElement): boolean { return item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true'; }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null): void {
  const items = toolbarItems(root);
  const states = items.map((item) => ({ disabled: disabled(item) }));
  let activeIndex = preferred ? items.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = items.findIndex((item) => item.tabIndex === 0 && !disabled(item));
  if (activeIndex < 0) activeIndex = states.findIndex((item) => !item.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  items.forEach((item, index) => { item.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const element = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-vf-toolbar-item]') : null;
  return element && root.contains(element) ? element : null;
}
function intentForKey(key: string, orientation: ToolbarOrientation, direction: 'ltr' | 'rtl'): CollectionNavigationIntent | null {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const arrow: CollectionNavigationArrow | null = key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : key === 'ArrowUp' ? 'up' : key === 'ArrowDown' ? 'down' : null;
  return arrow ? navigationIntentForArrow(arrow, orientation, direction) : null;
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') (handler as (event: Event) => void)(event);
  else if (Array.isArray(handler)) handler.forEach((entry) => invoke(entry, event));
}

export const ToolbarRoot = defineComponent({
  name: 'ToolbarRoot',
  props: { orientation: { type: String as PropType<ToolbarOrientation>, default: 'horizontal' } },
  setup(props, { attrs, slots }) {
    const root = ref<HTMLElement | null>(null);
    let observer: MutationObserver | null = null;
    onMounted(() => {
      if (!root.value) return;
      syncTabStops(root.value);
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => { if (root.value) syncTabStops(root.value); });
        observer.observe(root.value, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
      }
    });
    onBeforeUnmount(() => observer?.disconnect());
    return () => h('div', {
      ...attrs,
      ref: root,
      role: 'toolbar',
      'aria-orientation': props.orientation,
      'data-vf-toolbar-root': '',
      'data-vf-orientation': props.orientation,
      onFocusin: (event: FocusEvent) => {
        invoke(attrs.onFocusin, event);
        if (!root.value) return;
        const item = itemFromTarget(root.value, event.target);
        if (item && !disabled(item)) syncTabStops(root.value, item);
      },
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented || !root.value) return;
        const direction = typeof getComputedStyle === 'function' && getComputedStyle(root.value).direction === 'rtl' ? 'rtl' : 'ltr';
        const intent = intentForKey(event.key, props.orientation, direction);
        if (!intent) return;
        const items = toolbarItems(root.value);
        const currentItem = itemFromTarget(root.value, event.target);
        const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
        const nextIndex = resolveCompositeFocusIndex(items.map((item) => ({ disabled: disabled(item) })), currentIndex, intent);
        if (nextIndex == null) return;
        const next = items[nextIndex];
        if (!next) return;
        event.preventDefault();
        syncTabStops(root.value, next);
        next.focus();
      },
    }, slots.default?.());
  },
});
export const ToolbarButton = defineComponent({ name: 'ToolbarButton', setup(_, { attrs, slots }) { return () => h('button', { ...attrs, type: (attrs.type as string | undefined) ?? 'button', 'data-vf-toolbar-item': '' }, slots.default?.()); } });
export const ToolbarLink = defineComponent({ name: 'ToolbarLink', setup(_, { attrs, slots }) { return () => h('a', { ...attrs, 'data-vf-toolbar-item': '' }, slots.default?.()); } });
export const ToolbarSeparator = defineComponent({ name: 'ToolbarSeparator', setup(_, { attrs }) { return () => h('div', { ...attrs, role: 'separator', 'data-vf-toolbar-separator': '' }); } });
