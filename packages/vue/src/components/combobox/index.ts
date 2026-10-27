import { computed, defineComponent, h, inject, nextTick, provide, ref, useId, type InjectionKey, type Ref } from 'vue';
import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

interface Ctx {
  query: Ref<string>;
  value: Ref<string>;
  open: Ref<boolean>;
  activeId: Ref<string | null>;
  locale(): string | undefined;
  inputId: string;
  listboxId: string;
  inputRef: Ref<HTMLInputElement | null>;
  contentRef: Ref<HTMLElement | null>;
  setOpen(value: boolean): void;
  setQuery(value: string): void;
  setValue(value: string): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-combo');
function useC() { const value = inject(key); if (!value) throw new Error('Combobox parts must be inside root.'); return value; }

const optionSelector = '[data-vf-combobox-option]';
function visibleOptions(root: HTMLElement | null): HTMLElement[] { return root ? Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => !option.hidden) : []; }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled'); }
function normalizeFilterText(value: string, locale?: string): string { return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase(); }
function invoke(handler: unknown, event: Event) { if (typeof handler === 'function') handler(event); else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event); }
function activeOption(context: Ctx): HTMLElement | null {
  const id = context.activeId.value;
  if (!id) return null;
  return visibleOptions(context.contentRef.value).find((option) => option.id === id && !disabled(option)) ?? null;
}
function moveActive(context: Ctx, intent: Extract<CollectionNavigationIntent, 'next' | 'previous'>) {
  const options = visibleOptions(context.contentRef.value);
  const current = options.findIndex((option) => option.id === context.activeId.value);
  const start = current >= 0 ? current : intent === 'previous' ? options.length : -1;
  const next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), start, intent, { loop: false });
  if (next == null) return;
  const target = options[next];
  if (!target?.id) return;
  context.activeId.value = target.id;
  target.scrollIntoView?.({ block: 'nearest' });
}

export const ComboboxRoot = defineComponent({
  name: 'ComboboxRoot',
  props: { value: String, defaultValue: { type: String, default: '' }, locale: String },
  emits: ['update:value'],
  setup(props, { slots, emit }) {
    const internalValue = ref(props.defaultValue);
    const query = ref('');
    const open = ref(false);
    const activeId = ref<string | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const uid = useId();
    const inputId = `vf-combobox-${uid}-input`;
    const listboxId = `vf-combobox-${uid}-listbox`;
    const value = computed(() => props.value ?? internalValue.value);
    const context: Ctx = {
      query,
      value,
      open,
      activeId,
      locale: () => props.locale,
      inputId,
      listboxId,
      inputRef,
      contentRef,
      setOpen(next) { open.value = next; if (!next) activeId.value = null; },
      setQuery(next) { query.value = next; activeId.value = null; open.value = true; },
      setValue(next) {
        if (props.value === undefined) internalValue.value = next;
        query.value = next;
        activeId.value = null;
        open.value = false;
        emit('update:value', next);
        nextTick(() => inputRef.value?.focus());
      },
    };
    provide(key, context);
    return () => slots.default?.();
  },
});

export const ComboboxInput = defineComponent({
  name: 'ComboboxInput',
  setup(_, { attrs }) {
    const context = useC();
    const composing = ref(false);
    return () => h('input', {
      ...attrs,
      ref: context.inputRef,
      id: attrs.id ?? context.inputId,
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-expanded': context.open.value,
      'aria-controls': attrs['aria-controls'] ?? context.listboxId,
      'aria-activedescendant': context.activeId.value ?? undefined,
      'data-vf-combobox-input': '',
      value: context.query.value,
      onInput: (event: Event) => {
        invoke(attrs.onInput, event);
        if (!event.defaultPrevented) context.setQuery((event.target as HTMLInputElement).value);
      },
      onFocus: (event: FocusEvent) => {
        invoke(attrs.onFocus, event);
        if (!event.defaultPrevented) context.setOpen(true);
      },
      onCompositionstart: (event: CompositionEvent) => {
        invoke(attrs.onCompositionstart, event);
        composing.value = true;
      },
      onCompositionend: (event: CompositionEvent) => {
        invoke(attrs.onCompositionend, event);
        composing.value = false;
      },
      onKeydown: (event: KeyboardEvent) => {
        invoke(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        if (composing.value || event.isComposing) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          context.setOpen(true);
          const intent = event.key === 'ArrowDown' ? 'next' : 'previous';
          nextTick(() => moveActive(context, intent));
          return;
        }
        if (event.key === 'Enter' && context.open.value) {
          const target = activeOption(context);
          if (target) { event.preventDefault(); target.click(); }
          return;
        }
        if (event.key === 'Escape' && context.open.value) {
          event.preventDefault();
          context.setOpen(false);
        }
      },
    });
  },
});

export const ComboboxContent = defineComponent({
  name: 'ComboboxContent',
  setup(_, { attrs, slots }) {
    const context = useC();
    return () => context.open.value ? h('div', {
      ...attrs,
      ref: context.contentRef,
      id: attrs.id ?? context.listboxId,
      role: 'listbox',
      'aria-labelledby': attrs['aria-labelledby'] ?? context.inputId,
      'data-vf-combobox-content': '',
    }, slots.default?.()) : null;
  },
});

export const ComboboxOption = defineComponent({
  name: 'ComboboxOption',
  props: { value: { type: String, required: true }, textValue: String, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const context = useC();
    const uid = useId();
    return () => {
      const id = (attrs.id as string | undefined) ?? `vf-combobox-option-${uid}`;
      const label = props.textValue ?? props.value;
      return h('button', {
        ...attrs,
        id,
        type: 'button',
        role: 'option',
        tabindex: -1,
        disabled: props.disabled,
        hidden: !!context.query.value && !normalizeFilterText(label, context.locale()).includes(normalizeFilterText(context.query.value, context.locale())),
        'aria-disabled': props.disabled || undefined,
        'aria-selected': context.activeId.value ? context.activeId.value === id : context.value.value === props.value,
        'data-vf-combobox-option': '',
        'data-vf-text-value': label,
        onClick: (event: MouseEvent) => {
          invoke(attrs.onClick, event);
          if (!event.defaultPrevented && !props.disabled) context.setValue(props.value);
        },
      }, slots.default?.());
    };
  },
});
