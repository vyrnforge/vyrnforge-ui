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

const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector)).filter(
    (option) => option.closest('[data-vf-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && option.closest('[data-vf-select-content]') === root ? option : null;
}
function firstInvalid(control: HTMLSelectElement): boolean {
  const first = Array.from(control.form?.elements ?? []).find(
    (candidate) => candidate.matches(':invalid') && !candidate.matches('fieldset'),
  );
  return !first || first === control;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.matches(':disabled,[aria-disabled="true"]');
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

interface SelectContext {
  disabled: Readonly<Ref<boolean>>;
  error: Ref<string>;
  resetValue(): string;
  reset(): string;
  triggerId: Readonly<Ref<string>>;
  listboxId: Readonly<Ref<string>>;
  open: Ref<boolean>;
  value: Ref<string>;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  setOpen(value: boolean): void;
  setValue(value: string): void;
  focusOptions(edge: 'first' | 'last'): void;
  focusRequest: Ref<'first' | 'last' | null>;
  focusRevision: Ref<number>;
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
    id: String,
    disabled: Boolean,
    value: String,
    defaultValue: { type: String, default: '' },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
  },
  emits: ['update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const initialValue = props.defaultValue;
    const internalValue = ref(initialValue);
    const disabled = computed(() => props.disabled);
    const error = ref('');
    const internalOpen = ref(props.defaultOpen);
    const value = computed(() => props.value ?? internalValue.value);
    const expanded = computed(() => !disabled.value && (props.open ?? internalOpen.value));
    watch(disabled, (next) => { if (next && props.open === undefined) internalOpen.value = false; }, { flush: 'sync' });
    const uid = useId();
    const rootId = computed(() => props.id ?? `vf-select-${uid}`);
    const triggerId = computed(() => `${rootId.value}-trigger`);
    const listboxId = computed(() => `${rootId.value}-listbox`);
    const anchor = ref<HTMLElement | null>(null);
    const surface = ref<HTMLElement | null>(null);
    const focusRequest = ref<'first' | 'last' | null>(null);
    const focusRevision = ref(0);
    const openRef = computed({
      get: () => expanded.value,
      set(next) {
        if (next === expanded.value) return;
        if (props.open === undefined) internalOpen.value = next;
        emit('update:open', next);
      },
    });
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
      open: openRef,
      value,
      anchor,
      surface,
      setOpen(next) {
        if (!next || !disabled.value) openRef.value = next;
      },
      setValue(next) {
        if (disabled.value) return;
        if (props.value === undefined) internalValue.value = next;
        emit('update:value', next);
        openRef.value = false;
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

export const SelectTrigger = defineComponent({
  name: 'SelectTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const select = useSelect();
    const openAndFocus = (edge: 'first' | 'last') => {
      select.setOpen(true);
      select.focusOptions(edge);
    };
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          ref: (node: unknown) => {
            select.anchor.value = node as HTMLElement | null;
          },
          disabled: Boolean(attrs.disabled === '' || attrs.disabled) || select.disabled.value,
          'aria-invalid': select.error.value ? true : attrs['aria-invalid'],
          'aria-describedby':
            [attrs['aria-describedby'], select.error.value ? `${select.listboxId.value}-error` : undefined]
              .filter(Boolean)
              .join(' ') || undefined,
          id: select.triggerId.value,
          'aria-controls': select.listboxId.value,
          'aria-haspopup': 'listbox',
          'aria-expanded': select.open.value,
          'data-vf-select-trigger': '',
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (event.defaultPrevented || optionDisabled(event.currentTarget as HTMLButtonElement)) return;
            if (select.open.value) select.setOpen(false);
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
        slots.default?.() ?? select.value.value,
      );
  },
});

export const SelectContent = defineComponent({
  name: 'SelectContent',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const select = useSelect();
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let restoreFocus = false;
    function sync() {
      const surface = select.surface.value;
      const trigger = select.anchor.value;
      if (!surface || !trigger) return;
      if (!select.open.value) {
        select.focusRequest.value = null;
        if (timer !== null) clearTimeout(timer);
        timer = null;
        query = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = select.focusRequest.value;
      select.focusRequest.value = null;
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
    watch([select.open, select.focusRevision, select.anchor, select.surface], sync, { flush: 'post' });
    onBeforeUnmount(() => {
      if (timer !== null) clearTimeout(timer);
    });
    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: (node: unknown) => {
            select.surface.value = node as HTMLElement | null;
          },
          id: select.listboxId.value,
          role: 'listbox',
          tabindex: -1,
          popover: 'auto',
          'data-vf-select-content': '',
          'data-vf-open': select.open.value ? '' : undefined,
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
                select.anchor.value?.focus();
            }
            if (actual === select.open.value) return;
            select.setOpen(actual);
            void nextTick(sync);
          },
          onKeydown: (event: KeyboardEvent) => {
            invoke(attrs.onKeydown, event);
            if (
              event.defaultPrevented ||
              !(event.target instanceof Element) ||
              event.target.closest('[data-vf-select-content]') !== event.currentTarget
            )
              return;
            if (event.key === 'Escape') {
              event.preventDefault();
              select.setOpen(false);
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

export const SelectOption = defineComponent({
  name: 'SelectOption',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const select = useSelect();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          role: 'option',
          tabindex: -1,
          disabled: props.disabled || select.disabled.value,
          'aria-selected': select.value.value === props.value,
          'aria-disabled': props.disabled || select.disabled.value || undefined,
          'data-vf-select-option': '',
          'data-vf-value': props.value,
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (!event.defaultPrevented && !optionDisabled(event.currentTarget as HTMLButtonElement))
              select.setValue(props.value);
          },
        },
        slots.default?.(),
      );
  },
});

export const SelectFormControl = defineComponent({
  name: 'SelectFormControl',
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
    const root = useSelect();
    const control = ref<HTMLSelectElement | null>(null);
    let document: Document | undefined;
    let active = false;
    function sync(element: HTMLSelectElement, values: string, defaults: string) {
      for (const option of element.options) option.defaultSelected = defaults === option.value;
      element.value = values;
    }
    function reconcile() {
      const element = control.value;
      if (!element) return;
      sync(element, root.value.value, root.resetValue());
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
    watch([root.value, root.disabled, () => props.options, () => props.required], reconcile, {
      flush: 'post',
      deep: true,
    });
    onBeforeUnmount(() => {
      active = false;
      document?.removeEventListener('reset', onReset, true);
    });
    return () =>
      h('div', { 'data-vf-select-form-control': '' }, [
        h(
          'select',
          {
            ref: control,
            name: props.name,
            form: props.form,
            required: props.required,
            disabled: root.disabled.value,
            multiple: false,
            hidden: true,
            'aria-hidden': 'true',
            tabindex: -1,
            onChange: reconcile,
            onInvalid: (event: Event) => {
              event.preventDefault();
              root.error.value = (event.currentTarget as HTMLSelectElement).validationMessage;
              if (firstInvalid(event.currentTarget as HTMLSelectElement)) root.anchor.value?.focus();
            },
          },
          props.options.map((option) =>
            h(
              'option',
              {
                key: option.value,
                value: option.value,
                disabled: option.disabled,
                selected: root.value.value === option.value,
              },
              option.label,
            ),
          ),
        ),
        h('span', { id: `${root.listboxId.value}-error`, role: 'status' }, root.error.value),
      ]);
  },
});
