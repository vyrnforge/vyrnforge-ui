import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
  provide,
  ref,
  useId,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionMultiSelector = '[data-vf-multi-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionMultiSelector)).filter(
    (option) => option.closest('[data-vf-multi-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionMultiSelector) : null;
  return option && option.closest('[data-vf-multi-select-content]') === root ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.matches(':disabled,[aria-disabled="true"]');
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface MultiSelectContext {
  disabled: Readonly<Ref<boolean>>;
  error: Ref<string>;
  resetValue(): string[];
  reset(): string[];
  triggerId: Readonly<Ref<string>>;
  listboxId: Readonly<Ref<string>>;
  open: Ref<boolean>;
  values: Ref<string[]>;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  setOpen(value: boolean): void;
  toggle(value: string): void;
  focusOptions(edge: 'first' | 'last'): void;
  focusRequest: Ref<'first' | 'last' | null>;
  focusRevision: Ref<number>;
}
const key: InjectionKey<MultiSelectContext> = Symbol('vf-multi-select');
function useMulti(): MultiSelectContext {
  const value = inject(key);
  if (!value) throw new Error('MultiSelect parts must be inside root.');
  return value;
}

export const MultiSelectRoot = defineComponent({
  name: 'MultiSelectRoot',
  props: {
    id: String,
    disabled: Boolean,
    value: Array as PropType<string[] | undefined>,
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ['update:value'],
  setup(props, { slots, emit }) {
    const initialValue = [...props.defaultValue];
    const internalValue = ref(initialValue);
    const disabled = computed(() => props.disabled);
    const error = ref('');
    const open = ref(false);
    const values = computed(() => props.value ?? internalValue.value);
    const uid = useId();
    const rootId = computed(() => props.id ?? `vf-multi-select-${uid}`);
    const triggerId = computed(() => `${rootId.value}-trigger`);
    const listboxId = computed(() => `${rootId.value}-listbox`);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const focusRequest = ref<'first' | 'last' | null>(null);
    const focusRevision = ref(0);
    provide(key, {
      disabled,
      error,
      resetValue: () => props.value ?? initialValue,
      reset() {
        const next = props.value ?? initialValue;
        if (props.value === undefined) internalValue.value = next;
        error.value = '';
        return next;
      },
      triggerId,
      listboxId,
      open,
      values,
      anchor,
      surface,
      setOpen(next) {
        if (!next || !disabled.value) open.value = next;
      },
      toggle(candidate) {
        if (disabled.value) return;
        const next = values.value.includes(candidate)
          ? values.value.filter((value) => value !== candidate)
          : [...values.value, candidate];
        if (props.value === undefined) internalValue.value = next;
        emit('update:value', next);
      },
      focusRequest,
      focusRevision,
      focusOptions(edge) {
        focusRequest.value = edge;
        focusRevision.value += 1;
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
      multi.setOpen(true);
      multi.focusOptions(edge);
    };
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          ref: (node: unknown) => {
            multi.anchor.value = node as HTMLElement | null;
          },
          disabled: Boolean(attrs.disabled === '' || attrs.disabled) || multi.disabled.value,
          'aria-invalid': multi.error.value ? true : attrs['aria-invalid'],
          'aria-describedby':
            [attrs['aria-describedby'], multi.error.value ? `${multi.listboxId.value}-error` : undefined]
              .filter(Boolean)
              .join(' ') || undefined,
          id: multi.triggerId.value,
          'aria-controls': multi.listboxId.value,
          'aria-haspopup': 'listbox',
          'aria-expanded': multi.open.value,
          'data-vf-multi-select-trigger': '',
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (event.defaultPrevented || optionDisabled(event.currentTarget as HTMLButtonElement)) return;
            if (multi.open.value) multi.setOpen(false);
            else openAndFocus('first');
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (event.defaultPrevented || optionDisabled(event.currentTarget as HTMLButtonElement)) return;
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              openAndFocus('last');
            } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openAndFocus('first');
            }
          },
        },
        slots.default?.() ?? multi.values.value.join(', '),
      );
  },
});

export const MultiSelectContent = defineComponent({
  name: 'MultiSelectContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const multi = useMulti();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let restoreFocus = false;
    function sync() {
      const surface = multi.surface.value;
      const trigger = multi.anchor.value;
      if (!surface || !trigger) return;
      if (!multi.open.value) {
        multi.focusRequest.value = null;
        if (timer !== null) clearTimeout(timer);
        timer = null;
        query = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = multi.focusRequest.value;
      multi.focusRequest.value = null;
      if (!edge || !surface.matches(':popover-open')) return;
      const options = optionsFor(surface);
      const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
      const selected = options.findIndex(
        (option, index) => states[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
      );
      const index =
        selected >= 0 ? selected : resolveNavigationIndex(states, edge === 'first' ? -1 : options.length, edge);
      if (index != null) options[index]?.focus();
    }
    onMounted(sync);
    watch([multi.open, multi.focusRevision, multi.anchor, multi.surface], sync, { flush: 'post' });
    onBeforeUnmount(() => {
      if (timer !== null) clearTimeout(timer);
    });
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: (node: unknown) => {
            multi.surface.value = node as HTMLElement | null;
          },
          id: multi.listboxId.value,
          role: 'listbox',
          'aria-multiselectable': 'true',
          tabindex: -1,
          popover: 'auto',
          'data-vf-multi-select-content': '',
          'data-vf-open': multi.open.value ? '' : undefined,
          onBeforetoggle(event: Event) {
            invoke(attrs.onBeforetoggle, event);
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            restoreFocus = surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
          },
          onToggle(event: Event) {
            invoke(attrs.onToggle, event);
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            const actual = surface.matches(':popover-open');
            if (!actual && restoreFocus) {
              restoreFocus = false;
              const active = surface.ownerDocument.activeElement;
              if (!active || active === surface.ownerDocument.body || surface.contains(active))
                multi.anchor.value?.focus();
            }
            if (actual === multi.open.value) return;
            multi.setOpen(actual);
            void nextTick(sync);
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (
              event.defaultPrevented ||
              !(event.target instanceof Element) ||
              event.target.closest('[data-vf-multi-select-content]') !== event.currentTarget
            )
              return;
            if (event.key === 'Escape') {
              event.preventDefault();
              multi.setOpen(false);
              return;
            }
            if (event.key === 'Tab') {
              multi.setOpen(false);
              multi.anchor.value?.focus();
              return;
            }
            const root = event.currentTarget as HTMLElement;
            const options = optionsFor(root);
            const currentOption = optionFromTarget(root, event.target);
            const current = currentOption ? options.indexOf(currentOption) : -1;
            const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
            let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
            if (event.key === 'ArrowDown') intent = 'next';
            else if (event.key === 'ArrowUp') intent = 'previous';
            else if (event.key === 'Home') intent = 'first';
            else if (event.key === 'End') intent = 'last';
            let next: number | null = null;
            if (intent) next = resolveNavigationIndex(states, current, intent);
            else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
              query += event.key;
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                query = '';
              }, 500);
              next = findTypeaheadMatch(
                options.map((option) => ({
                  textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
                  eligible: !optionDisabled(option),
                })),
                query,
                { startIndex: current },
              );
            }
            if (next == null) return;
            event.preventDefault();
            options[next]?.focus();
          },
        },
        slots.default?.(),
      );
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
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          role: 'option',
          tabindex: -1,
          disabled: props.disabled || multi.disabled.value,
          'aria-selected': multi.values.value.includes(props.value),
          'aria-disabled': props.disabled || multi.disabled.value || undefined,
          'data-vf-multi-select-option': '',
          'data-vf-value': props.value,
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (!event.defaultPrevented && !optionDisabled(event.currentTarget as HTMLButtonElement))
              multi.toggle(props.value);
          },
        },
        slots.default?.(),
      );
  },
});

export const MultiSelectFormControl = defineComponent({
  name: 'MultiSelectFormControl',
  props: {
    name: String,
    form: String,
    required: Boolean,
    options: {
      type: Array as PropType<readonly { value: string; label: string; disabled?: boolean }[]>,
      required: true,
    },
  },
  setup(props) {
    const root = useMulti();
    const control = ref<HTMLSelectElement | null>(null);
    let document: Document | undefined;
    let active = false;
    function sync(element: HTMLSelectElement, values: string[], defaults: string[]) {
      for (const option of element.options) option.defaultSelected = defaults.includes(option.value);
      for (const option of element.options) option.selected = values.includes(option.value);
    }
    function reconcile() {
      const element = control.value;
      if (!element) return;
      sync(element, root.values.value, root.resetValue());
      if (root.error.value && (element.validity.valid || element.matches(':disabled'))) root.error.value = '';
    }
    const onReset = (event: Event) => {
      const element = control.value;
      if (!element?.form || element.form !== event.target) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented || control.value !== element || element.form !== event.target) return;
        const next = root.reset();
        sync(element, next, next);
      }, 0);
    };
    onMounted(() => {
      active = true;
      reconcile();
      document = control.value?.ownerDocument;
      document?.addEventListener('reset', onReset, true);
    });
    watch([root.values, root.disabled, () => props.options, () => props.required], reconcile, {
      flush: 'post',
      deep: true,
    });
    onBeforeUnmount(() => {
      active = false;
      document?.removeEventListener('reset', onReset, true);
    });
    return () =>
      h('div', { 'data-vf-multi-select-form-control': '' }, [
        h(
          'select',
          {
            ref: control,
            name: props.name,
            form: props.form,
            required: props.required,
            disabled: root.disabled.value,
            multiple: true,
            hidden: true,
            'aria-hidden': 'true',
            tabindex: -1,
            onChange: reconcile,
            onInvalid: (event: Event) => {
              event.preventDefault();
              root.error.value = (event.currentTarget as HTMLSelectElement).validationMessage;
              root.anchor.value?.focus();
            },
          },
          props.options.map((option) =>
            h(
              'option',
              {
                key: option.value,
                value: option.value,
                disabled: option.disabled,
                selected: root.values.value.includes(option.value),
              },
              option.label,
            ),
          ),
        ),
        h('span', { id: `${root.listboxId.value}-error`, role: 'status' }, root.error.value),
      ]);
  },
});
