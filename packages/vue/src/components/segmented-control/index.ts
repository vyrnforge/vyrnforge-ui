import { computed, defineComponent, h, inject, provide, ref, type InjectionKey, type Ref } from 'vue';
import { navigationIntentForArrow, resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';

const itemSelector = '[data-vf-segmented-control-item]';

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

function intentForKey(keyValue: string, direction: 'ltr' | 'rtl') {
  const arrow = keyValue === 'ArrowLeft' ? 'left'
    : keyValue === 'ArrowRight' ? 'right'
      : keyValue === 'ArrowUp' ? 'up'
        : keyValue === 'ArrowDown' ? 'down'
          : null;
  if (!arrow) return null;
  return navigationIntentForArrow(
    arrow,
    arrow === 'left' || arrow === 'right' ? 'horizontal' : 'vertical',
    direction,
  );
}

function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface Ctx {
  value: Ref<string>;
  set(value: string): void;
}

const key: InjectionKey<Ctx> = Symbol('vf-segmented');

function useS(): Ctx {
  const value = inject(key);
  if (!value) throw new Error('SegmentedControlItem must be inside root.');
  return value;
}

export const SegmentedControlRoot = defineComponent({
  name: 'SegmentedControlRoot',
  inheritAttrs: false,
  props: {
    value: String,
    defaultValue: { type: String, default: '' },
  },
  emits: ['update:value'],
  setup(props, { attrs, slots, emit }) {
    const internalValue = ref(props.defaultValue);
    const value = computed(() => props.value ?? internalValue.value);
    const context: Ctx = {
      value,
      set(candidate) {
        if (props.value === undefined) internalValue.value = candidate;
        emit('update:value', candidate);
      },
    };
    provide(key, context);

    return () => h('div', {
      ...attrs,
      role: 'radiogroup',
      'data-vf-segmented-control-root': '',
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        const root = event.currentTarget as HTMLElement;
        const currentItem = itemFromTarget(root, event.target);
        if (!currentItem) return;
        const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
        const intent = intentForKey(event.key, direction);
        if (!intent) return;
        const items = itemsFor(root);
        const current = items.indexOf(currentItem);
        const next = resolveEnabledIndex(
          items.map((item) => ({ disabled: itemDisabled(item) })),
          current,
          intent,
        );
        if (next == null) return;
        event.preventDefault();
        const candidate = items[next];
        if (!candidate) return;
        candidate.focus();
        context.set(candidate.dataset.vfValue ?? '');
      },
    }, slots.default?.());
  },
});

export const SegmentedControlItem = defineComponent({
  name: 'SegmentedControlItem',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const segmented = useS();
    return () => {
      const checked = segmented.value.value === props.value;
      const tabIndex = props.disabled ? -1 : segmented.value.value ? (checked ? 0 : -1) : undefined;
      return h('button', {
        ...attrs,
        type: (attrs.type as string | undefined) ?? 'button',
        role: 'radio',
        tabindex: tabIndex,
        disabled: props.disabled,
        'aria-checked': checked,
        'data-vf-segmented-control-item': '',
        'data-vf-value': props.value,
        onClick: (event: MouseEvent) => {
          invoke(attrs.onClick, event);
          if (!event.defaultPrevented && !props.disabled) segmented.set(props.value);
        },
      }, slots.default?.());
    };
  },
});
