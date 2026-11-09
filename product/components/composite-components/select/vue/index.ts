import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  nextTick,
  provide,
  ref,
  type InjectionKey,
  type Ref,
} from 'vue';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector));
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && root.contains(option) ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.disabled || option.getAttribute('aria-disabled') === 'true';
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface SelectContext {
  open: Ref<boolean>;
  value: Ref<string>;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  setOpen(value: boolean): void;
  setValue(value: string): void;
  focusOptions(edge: 'first' | 'last'): void;
}
const key: InjectionKey<SelectContext> = Symbol('vf-select');
function useSelect(): SelectContext {
  const value = inject(key);
  if (!value) throw new Error('Select parts must be inside root.');
  return value;
}

export const SelectRoot = defineComponent({
  name: 'SelectRoot',
  props: {
    value: String,
    defaultValue: { type: String, default: '' },
    open: Boolean,
    defaultOpen: Boolean,
  },
  emits: ['update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const instance = getCurrentInstance();
    const internalValue = ref(props.defaultValue);
    const internalOpen = ref(props.defaultOpen);
    const hasOpenProp = () => Boolean(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'open'));
    const value = computed(() => props.value ?? internalValue.value);
    const expanded = computed(() => hasOpenProp() ? props.open : internalOpen.value);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const openRef = computed({
      get: () => expanded.value,
      set(next) {
        if (!hasOpenProp()) internalOpen.value = next;
        emit('update:open', next);
      },
    });
    provide(key, {
      open: openRef,
      value,
      anchor,
      surface,
      setOpen(next) { openRef.value = next; },
      setValue(next) {
        if (props.value === undefined) internalValue.value = next;
        emit('update:value', next);
        openRef.value = false;
      },
      focusOptions(edge) {
        void nextTick(() => {
          if (!surface.value) return;
          const options = optionsFor(surface.value);
          const states = options.map((option) => ({ disabled: optionDisabled(option) }));
          const selected = options.findIndex(
            (option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true',
          );
          const index = selected >= 0
            ? selected
            : resolveEnabledIndex(states, edge === 'first' ? -1 : options.length, edge);
          if (index != null) options[index]?.focus();
        });
      },
    });
    return () => slots.default?.();
  },
});

export const SelectTrigger = defineComponent({
  name: 'SelectTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const select = useSelect();
    const openAndFocus = (edge: 'first' | 'last') => {
      select.setOpen(true);
      select.focusOptions(edge);
    };
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      ref: (node: unknown) => { select.anchor.value = node as HTMLElement | null; },
      'aria-haspopup': 'listbox',
      'aria-expanded': select.open.value,
      'data-vf-select-trigger': '',
      onClick: (event: MouseEvent) => {
        invoke(attrs.onClick, event);
        if (event.defaultPrevented) return;
        if (select.open.value) select.setOpen(false);
        else openAndFocus('first');
      },
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          openAndFocus('last');
        } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openAndFocus('first');
        }
      },
    }, slots.default?.() ?? select.value.value);
  },
});

export const SelectContent = defineComponent({
  name: 'SelectContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const select = useSelect();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    return () => select.open.value ? h('div', {
      ...attrs,
      ref: (node: unknown) => { select.surface.value = node as HTMLElement | null; },
      role: 'listbox',
      tabindex: -1,
      'data-vf-select-content': '',
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          select.setOpen(false);
          select.anchor.value?.focus();
          return;
        }
        if (event.key === 'Tab') {
          select.setOpen(false);
          select.anchor.value?.focus();
          return;
        }
        const root = event.currentTarget as HTMLElement;
        const options = optionsFor(root);
        const currentOption = optionFromTarget(root, event.target);
        const current = currentOption ? options.indexOf(currentOption) : -1;
        const states = options.map((option) => ({ disabled: optionDisabled(option) }));
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
          next = findTypeaheadMatch(options.map((option) => ({
            textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
            disabled: optionDisabled(option),
          })), query, { startIndex: current });
        }
        if (next == null) return;
        event.preventDefault();
        options[next]?.focus();
      },
    }, slots.default?.()) : null;
  },
});

export const SelectOption = defineComponent({
  name: 'SelectOption',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const select = useSelect();
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      role: 'option',
      tabindex: -1,
      disabled: props.disabled,
      'aria-selected': select.value.value === props.value,
      'aria-disabled': props.disabled || undefined,
      'data-vf-select-option': '',
      'data-vf-value': props.value,
      onClick: (event: MouseEvent) => {
        invoke(attrs.onClick, event);
        if (!event.defaultPrevented && !props.disabled) {
          select.setValue(props.value);
          select.anchor.value?.focus();
        }
      },
    }, slots.default?.());
  },
});
