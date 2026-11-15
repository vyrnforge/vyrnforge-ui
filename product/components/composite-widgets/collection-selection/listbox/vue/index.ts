import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

export type ListboxSelectionMode = 'single' | 'multiple';
interface Ctx {
  values: Ref<string[]>;
  mode: Ref<ListboxSelectionMode>;
  select(value: string): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-listbox');
function useListbox() {
  const value = inject(key);
  if (!value) throw new Error('ListboxOption must be inside root.');
  return value;
}

const rootSelector = '[data-vf-listbox-root],vf-listbox';
const optionSelector = '[data-vf-listbox-option]';
function optionsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter(option => option.closest(rootSelector) === root);
}
function disabled(option: HTMLElement): boolean {
  return option.getAttribute('aria-disabled') === 'true' || option.matches(':disabled,[hidden]');
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const element = target instanceof Element ? target.closest<HTMLElement>(optionSelector) : null;
  return element && element.closest(rootSelector) === root ? element : null;
}
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null) {
  const options = optionsFor(root);
  const states = options.map((option) => ({ eligible: !disabled(option) }));
  let activeIndex = preferred ? options.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.eligible === false) {
    const focused = optionFromTarget(root, root.ownerDocument.activeElement);
    activeIndex = focused ? options.indexOf(focused) : -1;
  }
  if (activeIndex < 0 || states[activeIndex]?.eligible === false)
    activeIndex = options.findIndex(
      (option, index) => states[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
    );
  if (activeIndex < 0) activeIndex = states.findIndex((option) => option.eligible !== false);
  const resolved = activeIndex < 0 ? null : activeIndex;
  const focused = optionFromTarget(root, root.ownerDocument.activeElement);
  root.tabIndex = resolved === null ? 0 : -1;
  options.forEach((option, index) => {
    option.tabIndex = states[index]?.eligible !== false && resolved === index ? 0 : -1;
  });
  if (focused && disabled(focused)) (resolved === null ? root : options[resolved])?.focus();
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

export const ListboxRoot = defineComponent({
  name: 'ListboxRoot',
  inheritAttrs: false,
  props: {
    value: [String, Array] as PropType<string | string[] | undefined>,
    defaultValue: [String, Array] as PropType<string | string[] | undefined>,
    selectionMode: { type: String as PropType<ListboxSelectionMode>, default: 'single' },
  },
  emits: ['update:value'],
  setup(props, { attrs, slots, emit }) {
    const internal = ref<string[]>(
      typeof props.defaultValue === 'string' ? [props.defaultValue] : (props.defaultValue ?? []),
    );
    const values = computed(() => {
      const raw = props.value ?? internal.value;
      const values = typeof raw === 'string' ? (raw ? [raw] : []) : raw;
      return props.selectionMode === 'single' ? values.slice(0, 1) : values;
    });
    const mode = computed(() => props.selectionMode);
    const root = ref<HTMLElement | null>(null);
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;
    provide(key, {
      values,
      mode,
      select(candidate) {
        const next =
          props.selectionMode === 'single'
            ? [candidate]
            : values.value.includes(candidate)
              ? values.value.filter((value) => value !== candidate)
              : [...values.value, candidate];
        if (props.value === undefined) internal.value = next;
        emit('update:value', props.selectionMode === 'single' ? (next[0] ?? '') : next);
      },
    });
    onMounted(() => {
      const element = root.value;
      if (!element) return;
      syncTabStops(element);
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => syncTabStops(element));
        observer.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['aria-disabled', 'aria-selected', 'data-vf-listbox-option', 'disabled', 'hidden', 'data-vf-listbox-root'],
        });
      }
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      if (timer) clearTimeout(timer);
    });
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: root,
          role: 'listbox',
          'aria-multiselectable': props.selectionMode === 'multiple' || undefined,
          'data-vf-listbox-root': '',
          tabindex: 0,
          onFocusin: (event: FocusEvent) => {
            invoke(attrs.onFocusin, event);
            const element = event.currentTarget as HTMLElement;
            const option = optionFromTarget(element, event.target);
            if (option && !disabled(option)) syncTabStops(element, option);
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (event.defaultPrevented) return;
            const element = event.currentTarget as HTMLElement;
            if (!(event.target instanceof Element) || event.target.closest(rootSelector) !== element || (event.target !== element && !optionFromTarget(element, event.target))) return;
            const options = optionsFor(element);
            const currentOption = optionFromTarget(element, event.target);
            const current = currentOption ? options.indexOf(currentOption) : -1;
            let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
            if (event.key === 'ArrowDown') intent = 'next';
            else if (event.key === 'ArrowUp') intent = 'previous';
            else if (event.key === 'Home') intent = 'first';
            else if (event.key === 'End') intent = 'last';
            let next: number | null = null;
            if (intent)
              next = resolveNavigationIndex(
                options.map((option) => ({ eligible: !disabled(option) })),
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
                options.map((option) => ({
                  textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
                  eligible: !disabled(option),
                })),
                query,
                { startIndex: current },
              );
            }
            if (next == null) return;
            const target = options[next];
            if (!target) return;
            event.preventDefault();
            syncTabStops(element, target);
            target.focus();
          },
        },
        slots.default?.(),
      );
  },
});

export const ListboxOption = defineComponent({
  name: 'ListboxOption',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, textValue: String, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const listbox = useListbox();
    return () =>
      h(
        'div',
        {
          ...attrs,
          role: 'option',
          tabindex: -1,
          'aria-selected': listbox.values.value.includes(props.value),
          'aria-disabled': props.disabled || attrs['aria-disabled'] || undefined,
          'data-vf-listbox-option': '',
          'data-vf-text-value': props.textValue ?? props.value,
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (!event.defaultPrevented && !disabled(event.currentTarget as HTMLElement)) {
              (event.currentTarget as HTMLElement).focus();
              listbox.select(props.value);
            }
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (!event.defaultPrevented && !disabled(event.currentTarget as HTMLElement) && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              listbox.select(props.value);
            }
          },
        },
        slots.default?.(),
      );
  },
});
