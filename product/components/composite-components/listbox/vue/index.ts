import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { toggleSelection } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

export type ListboxSelectionMode = 'single' | 'multiple';
interface Ctx { values: Ref<string[]>; mode: Ref<ListboxSelectionMode>; select(value: string): void; }
const key: InjectionKey<Ctx> = Symbol('vf-listbox');
function useListbox() { const value = inject(key); if (!value) throw new Error('ListboxOption must be inside root.'); return value; }

const optionSelector = '[data-vf-listbox-option]';
function optionsFor(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)); }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true'; }
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const element = target instanceof HTMLElement ? target.closest<HTMLElement>(optionSelector) : null; return element && root.contains(element) ? element : null; }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null) {
  const options = optionsFor(root);
  const states = options.map((option) => ({ disabled: disabled(option) }));
  let activeIndex = preferred ? options.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) {
    const focused = typeof document === 'undefined' ? null : optionFromTarget(root, document.activeElement);
    activeIndex = focused ? options.indexOf(focused) : -1;
  }
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
  if (activeIndex < 0) activeIndex = states.findIndex((option) => !option.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  root.tabIndex = resolved === null ? 0 : -1;
  options.forEach((option, index) => { option.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}
function invoke(handler: unknown, event: Event) { if (typeof handler === 'function') handler(event); else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event); }

export const ListboxRoot = defineComponent({
  name: 'ListboxRoot',
  props: { value: [String, Array] as PropType<string | string[] | undefined>, defaultValue: [String, Array] as PropType<string | string[] | undefined>, selectionMode: { type: String as PropType<ListboxSelectionMode>, default: 'single' } },
  emits: ['update:value'],
  setup(props, { attrs, slots, emit }) {
    const internal = ref<string[]>(typeof props.defaultValue === 'string' ? [props.defaultValue] : props.defaultValue ?? []);
    const values = computed(() => typeof props.value === 'string' ? [props.value] : (props.value ?? internal.value));
    const mode = computed(() => props.selectionMode);
    const root = ref<HTMLElement | null>(null);
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;
    provide(key, { values, mode, select(candidate) { const next = props.selectionMode === 'single' ? [candidate] : toggleSelection(values.value, candidate); if (props.value === undefined) internal.value = next; emit('update:value', props.selectionMode === 'single' ? (next[0] ?? '') : next); } });
    onMounted(() => {
      const element = root.value;
      if (!element) return;
      syncTabStops(element);
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => syncTabStops(element));
        observer.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-disabled', 'aria-selected', 'data-vf-listbox-option'] });
      }
    });
    onBeforeUnmount(() => { observer?.disconnect(); if (timer) clearTimeout(timer); });
    return () => h('div', {
      ...attrs,
      ref: root,
      role: 'listbox',
      'aria-multiselectable': props.selectionMode === 'multiple' || undefined,
      'data-vf-listbox-root': '',
      tabindex: 0,
      onFocusin: (event: FocusEvent) => { invoke(attrs.onFocusin, event); const element = event.currentTarget as HTMLElement; const option = optionFromTarget(element, event.target); if (option && !disabled(option)) syncTabStops(element, option); },
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        const element = event.currentTarget as HTMLElement;
        const options = optionsFor(element);
        const currentOption = optionFromTarget(element, event.target);
        const current = currentOption ? options.indexOf(currentOption) : -1;
        let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
        if (event.key === 'ArrowDown') intent = 'next'; else if (event.key === 'ArrowUp') intent = 'previous'; else if (event.key === 'Home') intent = 'first'; else if (event.key === 'End') intent = 'last';
        let next: number | null = null;
        if (intent) next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), current, intent);
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          query += event.key;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => { query = ''; }, 500);
          next = findTypeaheadMatch(options.map((option) => ({ textValue: option.dataset.vfTextValue ?? option.textContent ?? '', disabled: disabled(option) })), query, { startIndex: current });
        }
        if (next == null) return;
        const target = options[next];
        if (!target) return;
        event.preventDefault();
        syncTabStops(element, target);
        target.focus();
      },
    }, slots.default?.());
  },
});

export const ListboxOption = defineComponent({
  name: 'ListboxOption',
  props: { value: { type: String, required: true }, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const listbox = useListbox();
    return () => h('div', {
      ...attrs,
      role: 'option',
      tabindex: -1,
      'aria-selected': listbox.values.value.includes(props.value),
      'aria-disabled': props.disabled || undefined,
      'data-vf-listbox-option': '',
      onClick: (event: MouseEvent) => { invoke(attrs.onClick, event); if (!event.defaultPrevented && !props.disabled) { (event.currentTarget as HTMLElement).focus(); listbox.select(props.value); } },
      onKeydown: (event: KeyboardEvent) => { invoke(attrs.onKeydown, event); if (!event.defaultPrevented && !props.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); listbox.select(props.value); } },
    }, slots.default?.());
  },
});
