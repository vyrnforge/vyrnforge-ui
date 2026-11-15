import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
const groupSelector = '[data-vf-tag-group-root],vf-tag-group';
const removeSelector = 'button[data-vf-tag-group-remove]';

function attachRemovalFocus(root: HTMLElement): () => void {
  let focused: HTMLButtonElement | null = null;
  let ordered: HTMLButtonElement[] = [];
  const owns = (button: HTMLButtonElement) => button.closest(groupSelector) === root;
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>(removeSelector)).filter(owns);
  const eligible = (button: HTMLButtonElement) =>
    button.isConnected &&
    owns(button) &&
    !button.matches(':disabled,[aria-disabled="true"]') &&
    !button.closest('[hidden],[inert]') &&
    button.getClientRects().length > 0;
  const clear = () => {
    focused = null;
    ordered = [];
  };
  const capture = (target: EventTarget | null) => {
    const button = target instanceof Element ? target.closest<HTMLButtonElement>(removeSelector) : null;
    if (!button || !owns(button)) {
      clear();
      return;
    }
    focused = button;
    ordered = buttons();
  };
  const onFocusin = (event: FocusEvent) => capture(event.target);
  const onFocusout = (event: FocusEvent) => {
    const previous = focused;
    if (!previous) return;
    if (event.relatedTarget instanceof Element && !root.contains(event.relatedTarget)) {
      clear();
      return;
    }
    queueMicrotask(() => {
      if (focused === previous && owns(previous) && root.ownerDocument.activeElement !== previous) clear();
    });
  };
  const observer = new MutationObserver(() => {
    if (!focused || !root.isConnected) return;
    const active = root.ownerDocument.activeElement;
    if (owns(focused)) {
      if (active === focused) ordered = buttons();
      return;
    }
    const index = ordered.indexOf(focused);
    const candidates = [...ordered.slice(index + 1), ...ordered.slice(0, index).reverse()];
    clear();
    if (active && active !== root && active !== root.ownerDocument.body) return;
    (candidates.find(eligible) ?? root).focus();
  });
  root.addEventListener('focusin', onFocusin);
  root.addEventListener('focusout', onFocusout);
  observer.observe(root, { childList: true, subtree: true });
  capture(root.ownerDocument.activeElement);
  return () => {
    observer.disconnect();
    root.removeEventListener('focusin', onFocusin);
    root.removeEventListener('focusout', onFocusout);
    clear();
  };
}

export const TagGroupRoot = defineComponent({
  name: 'TagGroupRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const root = ref<HTMLElement | null>(null);
    let cleanup: (() => void) | undefined;
    onMounted(() => {
      if (root.value && typeof MutationObserver !== 'undefined') cleanup = attachRemovalFocus(root.value);
    });
    onBeforeUnmount(() => cleanup?.());
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: root,
          role: (attrs.role as string | undefined) ?? 'list',
          tabindex: attrs.tabindex ?? attrs.tabIndex ?? -1,
          'data-vf-tag-group-root': '',
        },
        slots.default?.(),
      );
  },
});
export const TagGroupItem = defineComponent({
  name: 'TagGroupItem',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'div',
        { ...attrs, role: (attrs.role as string | undefined) ?? 'listitem', 'data-vf-tag-group-item': '' },
        slots.default?.(),
      );
  },
});
export const TagGroupRemove = defineComponent({
  name: 'TagGroupRemove',
  inheritAttrs: false,
  props: { label: String },
  setup(p, { attrs, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          'aria-label': (attrs['aria-label'] as string | undefined) ?? p.label,
          'data-vf-tag-group-remove': '',
        },
        slots.default?.() ?? '×',
      );
  },
});
