import { computed, defineComponent, h, inject, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';

export type ToggleGroupType = 'single' | 'multiple';

function normalize(value: string | string[] | undefined, type: ToggleGroupType): string[] {
  const values = Array.from(new Set((typeof value === 'string' ? [value] : (value ?? [])).filter(Boolean)));
  return type === 'single' ? values.slice(0, 1) : values;
}

function toggled(values: string[], value: string, type: ToggleGroupType): string[] {
  if (type === 'single') return values[0] === value ? [] : [value];
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}

interface Ctx {
  values: Ref<string[]>;
  toggle(value: string): void;
}

const key: InjectionKey<Ctx> = Symbol('vf-toggle-group');
function useG() {
  const value = inject(key);
  if (!value) throw new Error('ToggleGroupItem must be inside root.');
  return value;
}

function invoke(handler: unknown, event: MouseEvent): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}

export const ToggleGroupRoot = defineComponent({
  name: 'ToggleGroupRoot',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<ToggleGroupType>, default: 'single' },
    value: [String, Array] as PropType<string | string[] | undefined>,
    defaultValue: [String, Array] as PropType<string | string[] | undefined>,
  },
  emits: ['update:value'],
  setup(p, { attrs, slots, emit }) {
    const internal = ref<string[]>(normalize(p.defaultValue, p.type));
    const values = computed(() => normalize(p.value ?? internal.value, p.type));
    provide(key, {
      values,
      toggle(value) {
        if (!value) return;
        const next = toggled(values.value, value, p.type);
        if (p.value === undefined) internal.value = next;
        emit('update:value', p.type === 'single' ? (next[0] ?? '') : next);
      },
    });
    return () => h('div', { ...attrs, role: 'group', 'data-vf-toggle-group-root': '' }, slots.default?.());
  },
});

export const ToggleGroupItem = defineComponent({
  name: 'ToggleGroupItem',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, disabled: Boolean },
  setup(p, { attrs, slots }) {
    const g = useG();
    return () => {
      const pressed = g.values.value.includes(p.value);
      return h(
        'button',
        {
          ...attrs,
          type: 'button',
          disabled: p.disabled,
          'aria-pressed': pressed,
          'data-vf-state': pressed ? 'on' : 'off',
          'data-vf-value': p.value,
          'data-vf-toggle-group-item': '',
          onClick(event: MouseEvent) {
            invoke(attrs.onClick, event);
            if (
              !event.defaultPrevented &&
              !p.disabled &&
              attrs['aria-disabled'] !== true &&
              attrs['aria-disabled'] !== 'true'
            )
              g.toggle(p.value);
          },
        },
        slots.default?.(),
      );
    };
  },
});
