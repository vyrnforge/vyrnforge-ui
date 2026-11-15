import { computed, defineComponent, h, inject, nextTick, onMounted, watch, provide, ref, useId, type InjectionKey, type Ref } from 'vue';
import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

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
function useC() {
  const value = inject(key);
  if (!value) throw new Error('Combobox parts must be inside root.');
  return value;
}

const optionSelector = '[data-vf-combobox-option]';
function visibleOptions(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => !option.hidden && option.closest('[data-vf-combobox-content]') === root) : [];
}
function disabled(option: HTMLElement): boolean {
  return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled');
}
function normalizeFilterText(value: string, locale?: string): string {
  return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase();
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}
function activeOption(context: Ctx): HTMLElement | null {
  const id = context.activeId.value;
  if (!id) return null;
  return visibleOptions(context.contentRef.value).find((option) => option.id === id && !disabled(option)) ?? null;
}
function moveActive(context: Ctx, intent: Extract<CollectionNavigationIntent, 'next' | 'previous'>) {
  const options = visibleOptions(context.contentRef.value);
  const current = options.findIndex((option) => option.id === context.activeId.value);
  const start = current >= 0 ? current : intent === 'previous' ? options.length : -1;
  const next = resolveNavigationIndex(
    options.map((option) => ({ eligible: !disabled(option) })),
    start,
    intent,
    { loop: false },
  );
  if (next == null) return;
  const target = options[next];
  if (!target?.id) return;
  context.activeId.value = target.id;
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
      setOpen(next) {
        open.value = next;
        if (!next) activeId.value = null;
      },
      setQuery(next) {
        query.value = next;
        activeId.value = null;
        open.value = true;
      },
      setValue(next) {
        if (props.value === undefined) internalValue.value = next;
        query.value = next;
        activeId.value = null;
        emit('update:value', next);
        inputRef.value?.focus();
        open.value = false;
      },
    };
    provide(key, context);
    return () => slots.default?.();
  },
});

export const ComboboxInput = defineComponent({
  name: 'ComboboxInput',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const context = useC();
    const composing = ref(false);
    return () =>
      h('input', {
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
        onBlur: (event: FocusEvent) => {
          invoke(attrs.onBlur, event);
          if (!event.defaultPrevented && !context.contentRef.value?.contains(event.relatedTarget as Node | null)) context.setOpen(false);
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
            if (target) {
              event.preventDefault();
              target.click();
            }
            return;
          }
          if (event.key === 'Tab' && context.open.value) context.setOpen(false);
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
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = useC();
    function sync() {
      const surface = context.contentRef.value;
      const input = context.inputRef.value;
      if (!surface || !input) return;
      if (context.open.value && !surface.matches(':popover-open')) surface.showPopover({ source: input });
      if (!context.open.value && surface.matches(':popover-open')) surface.hidePopover();
      if (context.open.value) activeOption(context)?.scrollIntoView({ block: 'nearest' });
    }
    onMounted(sync);
    watch([context.open, context.activeId, context.contentRef, context.inputRef], sync, { flush: 'post' });
    return () => h(
            'div',
            {
              ...attrs,
              ref: context.contentRef,
              id: attrs.id ?? context.listboxId,
              role: 'listbox',
              popover: 'auto',
              'data-vf-open': context.open.value ? '' : undefined,
              onToggle(event: Event) {
                invoke(attrs.onToggle, event);
                if (event.target !== event.currentTarget) return;
                const actual = (event.currentTarget as HTMLElement).matches(':popover-open');
                if (actual !== context.open.value) context.setOpen(actual);
              },
              'aria-labelledby': attrs['aria-labelledby'] ?? context.inputId,
              'data-vf-combobox-content': '',
            },
            slots.default?.(),
          );
  },
});

export const ComboboxOption = defineComponent({
  name: 'ComboboxOption',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, textValue: String, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const context = useC();
    const uid = useId();
    return () => {
      const id = (attrs.id as string | undefined) ?? `vf-combobox-option-${uid}`;
      const label = props.textValue ?? props.value;
      return h(
        'button',
        {
          ...attrs,
          id,
          type: 'button',
          role: 'option',
          tabindex: -1,
          disabled: props.disabled,
          hidden:
            !!context.query.value &&
            !normalizeFilterText(label, context.locale()).includes(
              normalizeFilterText(context.query.value, context.locale()),
            ),
          'aria-disabled': props.disabled || undefined,
          'aria-selected': context.activeId.value ? context.activeId.value === id : context.value.value === props.value,
          'data-vf-combobox-option': '',
          'data-vf-text-value': label,
          onMousedown: (event: MouseEvent) => {
            invoke(attrs.onMousedown, event);
            if (!event.defaultPrevented && event.button === 0) event.preventDefault();
          },
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            const option = event.currentTarget as HTMLElement;
            if (!event.defaultPrevented && !disabled(option) && !option.hidden) context.setValue(props.value);
          },
        },
        slots.default?.(),
      );
    };
  },
});
