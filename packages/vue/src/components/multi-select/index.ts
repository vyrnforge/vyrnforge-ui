import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  provide,
  ref,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { toggleSelection } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionSelector = '[data-vf-multi-select-option]';
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

interface Ctx {
  values: Ref<string[]>;
  open: Ref<boolean>;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  toggle(value: string): void;
  focusOptions(edge: 'first' | 'last'): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-multi');
function useMulti(): Ctx {
  const value = inject(key);
  if (!value) throw new Error('MultiSelect parts must be inside root.');
  return value;
}

export const MultiSelectRoot = defineComponent({
  name: 'MultiSelectRoot',
  props: {
    value: Array as PropType<string[] | undefined>,
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ['update:value'],
  setup(props, { slots, emit }) {
    const internalValue = ref([...props.defaultValue]);
    const open = ref(false);
    const values = computed(() => props.value ?? internalValue.value);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    provide(key, {
      values,
      open,
      anchor,
      surface,
      toggle(candidate) {
        const next = toggleSelection(values.value, candidate);
        if (props.value === undefined) internalValue.value = next;
        emit('update:value', next);
      },
      focusOptions(edge) {
        void nextTick(() => {
          if (!surface.value) return;
          const options = optionsFor(surface.value);
          const states = options.map((option) => ({ disabled: optionDisabled(option) }));
          const selected = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
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

export const MultiSelectTrigger = defineComponent({
  name: 'MultiSelectTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const multi = useMulti();
    const openAndFocus = (edge: 'first' | 'last') => {
      multi.open.value = true;
      multi.focusOptions(edge);
    };
    return () => h('button', {
      ...attrs,
      ref: (node: unknown) => { multi.anchor.value = node as HTMLElement | null; },
      type: (attrs.type as string | undefined) ?? 'button',
      'aria-haspopup': 'listbox',
      'aria-expanded': multi.open.value,
      'data-vf-multi-select-trigger': '',
      onClick: (event: MouseEvent) => {
        invoke(attrs.onClick, event);
        if (event.defaultPrevented) return;
        if (multi.open.value) multi.open.value = false;
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
    }, slots.default?.() ?? (multi.values.value.join(', ') || 'Select'));
  },
});

export const MultiSelectContent = defineComponent({
  name: 'MultiSelectContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const multi = useMulti();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    return () => multi.open.value ? h('div', {
      ...attrs,
      ref: (node: unknown) => { multi.surface.value = node as HTMLElement | null; },
      role: 'listbox',
      tabindex: -1,
      'aria-multiselectable': 'true',
      'data-vf-multi-select-content': '',
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          multi.open.value = false;
          multi.anchor.value?.focus();
          return;
        }
        if (event.key === 'Tab') {
          multi.open.value = false;
          multi.anchor.value?.focus();
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

export const MultiSelectOption = defineComponent({
  name: 'MultiSelectOption',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const multi = useMulti();
    return () => h('button', {
      ...attrs,
      type: (attrs.type as string | undefined) ?? 'button',
      role: 'option',
      tabindex: -1,
      disabled: props.disabled,
      'aria-selected': multi.values.value.includes(props.value),
      'aria-disabled': props.disabled || undefined,
      'data-vf-multi-select-option': '',
      'data-vf-value': props.value,
      onClick: (event: MouseEvent) => {
        invoke(attrs.onClick, event);
        if (!event.defaultPrevented && !props.disabled) multi.toggle(props.value);
      },
    }, slots.default?.());
  },
});
