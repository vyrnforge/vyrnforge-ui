import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  useId,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
export type AccordionType = 'single' | 'multiple';
export type AccordionValue = string | readonly string[];
interface RootContext {
  id: Readonly<Ref<string>>;
  collapsible: Readonly<Ref<boolean>>;
  type: Readonly<Ref<AccordionType>>;
  values: Readonly<Ref<readonly string[]>>;
  toggle(value: string): void;
}
interface ItemContext {
  value: Readonly<Ref<string>>;
  disabled: Readonly<Ref<boolean>>;
  triggerId: Readonly<Ref<string>>;
  panelId: Readonly<Ref<string>>;
}
const RootKey: InjectionKey<RootContext> = Symbol('VyrnForgeAccordion');
const ItemKey: InjectionKey<ItemContext> = Symbol('VyrnForgeAccordionItem');
function useRoot() {
  const value = inject(RootKey);
  if (!value) throw new Error('Accordion parts must be inside AccordionRoot.');
  return value;
}
function useItem() {
  const value = inject(ItemKey);
  if (!value) throw new Error('Accordion item parts must be inside AccordionItem.');
  return value;
}
function normalize(value: AccordionValue | undefined, type: AccordionType): string[] {
  const values = typeof value === 'string' ? [value] : (value ?? []);
  const unique = [...new Set(values.filter(Boolean))];
  return type === 'single' ? unique.slice(0, 1) : unique;
}
function token(value: string) {
  return encodeURIComponent(value).replaceAll('_', '_5F').replaceAll('%', '_');
}
export const AccordionRoot = defineComponent({
  name: 'VfAccordionRoot',
  inheritAttrs: false,
  props: {
    id: String,
    type: { type: String as PropType<AccordionType>, default: 'single' },
    modelValue: [String, Array] as PropType<AccordionValue>,
    defaultValue: [String, Array] as PropType<AccordionValue>,
    collapsible: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'valueChange'],
  setup(props, { attrs, slots, emit }) {
    const generated = useId().replaceAll(':', '');
    const id = computed(() => props.id ?? `vf-accordion-${generated}`);
    const internal = ref<string[]>(normalize(props.defaultValue, props.type));
    const values = computed(() =>
      normalize(props.modelValue ?? internal.value, props.type),
    );
    const type = computed(() => props.type);
    provide(RootKey, {
      id,
      type,
      collapsible: computed(() => props.collapsible),
      values,
      toggle(value) {
        const current = values.value;
        const isOpen = current.includes(value);
        let next: string[];
        if (props.type === 'single') next = isOpen ? (props.collapsible ? [] : [...current]) : [value];
        else next = isOpen ? current.filter((candidate) => candidate !== value) : [...current, value];
        if (next.length === current.length && next.every((candidate, index) => candidate === current[index])) return;
        if (props.modelValue === undefined) internal.value = next;
        const output: AccordionValue = props.type === 'single' ? (next[0] ?? '') : next;
        emit('update:modelValue', output);
        emit('valueChange', output);
      },
    });
    return () =>
      h('div', { ...attrs, id: id.value, 'data-vf-accordion-root': '', 'data-vf-type': props.type }, slots.default?.());
  },
});
export const AccordionItem = defineComponent({
  name: 'VfAccordionItem',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, disabled: { type: Boolean, default: false } },
  setup(props, { attrs, slots }) {
    const root = useRoot();
    const disabled = computed(() => props.disabled);
    const item = {
      value: computed(() => props.value),
      disabled,
      triggerId: computed(() => `${root.id.value}-trigger-${token(props.value)}`),
      panelId: computed(() => `${root.id.value}-panel-${token(props.value)}`),
    };
    provide(ItemKey, item);
    const open = computed(() => root.values.value.includes(props.value));
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-vf-accordion-item': '',
          'data-vf-open': open.value ? '' : undefined,
          'data-vf-disabled': props.disabled ? '' : undefined,
        },
        slots.default?.(),
      );
  },
});
export const AccordionHeader = defineComponent({
  name: 'VfAccordionHeader',
  inheritAttrs: false,
  props: { level: { type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>, default: 3 } },
  setup(props, { attrs, slots }) {
    useItem();
    return () => h(`h${props.level}`, { ...attrs, 'data-vf-accordion-header': '' }, slots.default?.());
  },
});
export const AccordionTrigger = defineComponent({
  name: 'VfAccordionTrigger',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(props, { attrs, slots }) {
    const root = useRoot();
    const item = useItem();
    const open = computed(() => root.values.value.includes(item.value.value));
    const unavailable = computed(() => open.value && root.type.value === 'single' && !root.collapsible.value);
    return () =>
      h(
        'button',
        {
          ...attrs,
          id: item.triggerId.value,
          type: attrs.type ?? 'button',
          disabled: item.disabled.value || props.disabled,
          'aria-expanded': open.value,
          'aria-disabled': unavailable.value ? 'true' : undefined,
          'aria-controls': item.panelId.value,
          'data-vf-accordion-trigger': '',
          onClick(event: MouseEvent) {
            if (typeof attrs.onClick === 'function') attrs.onClick(event);
            else if (Array.isArray(attrs.onClick))
              for (const handler of attrs.onClick) if (typeof handler === 'function') handler(event);
            if (!event.defaultPrevented && !item.disabled.value && !props.disabled && !unavailable.value)
              root.toggle(item.value.value);
          },
          onKeydown(event: KeyboardEvent) {
            if (typeof attrs.onKeydown === 'function') attrs.onKeydown(event);
            else if (Array.isArray(attrs.onKeydown))
              for (const handler of attrs.onKeydown) if (typeof handler === 'function') handler(event);
            if (event.defaultPrevented) return;
            let intent: CollectionNavigationIntent | null = null;
            if (event.key === 'ArrowDown') intent = 'next';
            else if (event.key === 'ArrowUp') intent = 'previous';
            else if (event.key === 'Home') intent = 'first';
            else if (event.key === 'End') intent = 'last';
            if (!intent) return;
            const container = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-vf-accordion-root]');
            if (!container) return;
            const triggers = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-vf-accordion-trigger]')).filter(
              (trigger) => trigger.closest('[data-vf-accordion-root]') === container,
            );
            const index = triggers.indexOf(event.currentTarget as HTMLButtonElement);
            const next = resolveNavigationIndex(
              triggers.map((candidate) => ({ eligible: !candidate.disabled })),
              index,
              intent,
            );
            if (next === null) return;
            event.preventDefault();
            triggers[next]?.focus();
          },
        },
        slots.default?.(),
      );
  },
});
export const AccordionPanel = defineComponent({
  name: 'VfAccordionPanel',
  inheritAttrs: false,
  props: { region: Boolean },
  setup(props, { attrs, slots }) {
    const root = useRoot();
    const item = useItem();
    const open = computed(() => root.values.value.includes(item.value.value));
    return () =>
      h(
        'div',
        {
          ...attrs,
          id: item.panelId.value,
          role: props.region ? 'region' : undefined,
          hidden: !open.value,
          'aria-labelledby': props.region ? item.triggerId.value : undefined,
          'data-vf-accordion-panel': '',
          'data-vf-open': open.value ? '' : undefined,
        },
        slots.default?.(),
      );
  },
});
