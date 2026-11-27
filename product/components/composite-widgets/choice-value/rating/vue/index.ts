import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useId,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { Icon } from '../icon/index.js';
import type { IconDefinition, IconSize } from '@vyrnforge/web/icon';
import { ratingStar, ratingMaximum, ratingValue, reconcileRating, connectRatingReset } from '@vyrnforge/web/rating';

interface Ctx {
  value: Ref<number>;
  name: Ref<string>;
  set(v: number): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-rating');
function useR() {
  const v = inject(key);
  if (!v) throw new Error('RatingItem must be inside root.');
  return v;
}

function useRatingState(p: { value?: number; defaultValue: number; name?: string },
  emit: (value: number) => void, normalize = (value: number) => value) {
  const id = useId();
  const initial = p.defaultValue;
  const iv = ref(initial);
  const value = computed(() => normalize(p.value ?? iv.value));
  const name = computed(() => p.name ?? `vf-rating-${id}`);
  const root = ref<HTMLDivElement | null>(null);
  let disconnect: (() => void) | undefined;
  onMounted(() => {
    disconnect = connectRatingReset(() => root.value, () => {
      const next = normalize(p.value ?? initial);
      if (p.value === undefined) iv.value = next;
      return next;
    });
  });
  onBeforeUnmount(() => disconnect?.());
  const ctx: Ctx = {
    value, name,
    set(v) {
      if (v === value.value) return;
      if (p.value === undefined) iv.value = v;
      emit(v);
      reconcileRating(root.value, value.value);
    },
  };
  return { ctx, root };
}

export const RatingRoot = defineComponent({
  name: 'RatingRoot',
  inheritAttrs: false,
  props: {
    value: Number,
    defaultValue: { type: Number, default: 0 },
    name: String,
    max: { type: Number, default: 5 },
    getItemLabel: Function as PropType<(value: number) => string>,
  },
  emits: ['update:value'],
  setup(p, { attrs, slots, emit }) {
    const { ctx, root } = useRatingState(p, value => emit('update:value', value));
    provide(key, ctx);
    return () =>
      h('div', { ...attrs, ref: root, role: 'radiogroup', 'data-vf-rating-root': '' },
        slots.default?.() ??
          Array.from({ length: Number.isFinite(p.max) ? Math.max(0, Math.floor(p.max)) : 0 }, (_, i) =>
            h(RatingItem, { value: i + 1, label: p.getItemLabel?.(i + 1) ?? String(i + 1), key: i + 1 }),
          ),
      );
  },
});
export const RatingItem = defineComponent({
  name: 'RatingItem',
  props: { value: { type: Number, required: true }, label: String, disabled: Boolean },
  setup(p) {
    const r = useR();
    return () =>
      h('label', { 'data-vf-rating-item': '' }, [
        h('input', {
          type: 'radio',
          name: r.name.value,
          value: p.value,
          checked: r.value.value === p.value,
          disabled: p.disabled,
          'aria-label': p.label ?? String(p.value),
          onChange: () => r.set(p.value),
        }),
        h('span', { 'aria-hidden': 'true', 'data-vf-rating-glyph': '' }),
      ]);
  },
});

/** Generated native radio choices, or a noninteractive score. */
export const Rating = defineComponent({
  name: 'Rating',
  inheritAttrs: false,
  props: {
    value: Number,
    defaultValue: { type: Number, default: 0 },
    name: String,
    max: { type: Number, default: 5 },
    precision: { type: Number as PropType<1 | 0.5>, default: 1 },
    size: { type: String as PropType<IconSize>, default: 'md' },
    icon: { type: Object as PropType<IconDefinition>, default: () => ratingStar },
    readOnly: Boolean,
    disabled: Boolean,
    required: Boolean,
    clearable: Boolean,
    clearLabel: String,
    getItemLabel: Function as PropType<(value: number) => string>,
  },
  emits: ['update:value'],
  setup(p, { attrs, emit }) {
    const count = computed(() => ratingMaximum(p.max));
    const step = computed(() => p.precision === 0.5 ? 0.5 : 1);
    const { ctx, root } = useRatingState(p, v => emit('update:value', v),
      v => ratingValue(v, count.value, step.value, p.readOnly));
    return () => {
      const canClear = p.clearable && !p.required && !p.readOnly;
      if (canClear && !p.clearLabel?.trim()) throw new Error('Rating clearable requires a localized clearLabel.');
      const group = h('div', {
        ...attrs, ref: root, role: p.readOnly ? 'img' : 'radiogroup',
        'data-vf-rating-root': '', 'data-vf-rating-enhanced': '', 'data-vf-size': p.size,
        'data-vf-precision': step.value, 'data-vf-readonly': p.readOnly ? '' : undefined,
        'data-vf-disabled': p.disabled ? '' : undefined,
        'aria-required': !p.readOnly && p.required || undefined,
        'aria-disabled': !p.readOnly && p.disabled || undefined,
      }, Array.from({ length: count.value }, (_, i) => h('span', {
        key: i, 'data-vf-rating-star': '',
      }, [
        h('span', { 'data-vf-rating-artwork': '', 'aria-hidden': 'true',
          style: p.readOnly ? { '--_vf-rating-fill': Math.round(Math.max(0, Math.min(1, ctx.value.value - i)) * 1000000) / 10000 + '%' } : undefined,
        }, [h(Icon, { icon: p.icon, size: p.size, variant: 'outlined' }),
          h('span', { 'data-vf-rating-fill': '' }, h(Icon, { icon: p.icon, size: p.size, variant: 'filled' }))]),
        !p.readOnly ? h('span', { 'data-vf-rating-choices': '' },
          Array.from({ length: 1 / step.value }, (_, part) => {
            const score = i + (part + 1) * step.value;
            return h('label', { key: score, 'data-vf-rating-option': '' }, h('input', {
              type: 'radio', name: ctx.name.value, value: score, checked: ctx.value.value === score,
              'data-vf-rating-choice': '', disabled: p.disabled, required: p.required,
              'aria-label': p.getItemLabel?.(score) ?? String(score),
              'aria-invalid': attrs['aria-invalid'], 'aria-describedby': attrs['aria-describedby'],
              onChange: () => ctx.set(score),
            }));
          })) : null,
      ])));
      return canClear ? h('div', { 'data-vf-rating-with-clear': '' }, [
        group, h('button', { type: 'button', 'data-vf-rating-clear': '', disabled: p.disabled,
          'aria-disabled': ctx.value.value === 0 || undefined,
          onClick: () => { if (!p.disabled && ctx.value.value !== 0) ctx.set(0); },
        }, p.clearLabel),
      ]) : group;
    };
  },
});
