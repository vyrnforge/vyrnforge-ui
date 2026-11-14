import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  nextTick,
  onMounted,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

interface Context {
  id: Readonly<Ref<string>>;
  open: Readonly<Ref<boolean>>;
  anchor: Ref<HTMLElement | null>;
  content: Ref<HTMLElement | null>;
  placement: Readonly<Ref<FloatingPlacement>>;
  role: Readonly<Ref<'dialog' | 'region'>>;
  setOpen(value: boolean): void;
}
const Key: InjectionKey<Context> = Symbol('VyrnForgePopover');
function usePopover() {
  const value = inject(Key);
  if (!value) throw new Error('Popover parts must be inside PopoverRoot.');
  return value;
}
export const PopoverRoot = defineComponent({
  name: 'VfPopoverRoot',
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    contentId: String,
    contentRole: { type: String as PropType<'dialog' | 'region'>, default: 'dialog' },
  },
  emits: ['update:modelValue', 'openChange'],
  setup(props, { slots, emit }) {
    const internal = ref(props.defaultOpen);
    const open = computed(() => props.modelValue ?? internal.value);
    const generated = useId();
    const context: Context = {
      id: computed(() => props.contentId ?? `vf-popover-${generated}`),
      open,
      anchor: ref(null),
      content: ref(null),
      placement: computed(() => props.placement),
      role: computed(() => props.contentRole),
      setOpen(value) {
        if (value === open.value) return;
        if (props.modelValue === undefined) internal.value = value;
        emit('update:modelValue', value);
        emit('openChange', value);
      },
    };
    provide(Key, context);
    return () => slots.default?.();
  },
});
export const PopoverTrigger = defineComponent({
  name: 'VfPopoverTrigger',
  inheritAttrs: false,
  setup(_p, { attrs, slots }) {
    const context = usePopover();
    return () =>
      h(
        'button',
        mergeProps(attrs, {
          ref: context.anchor,
          type: attrs.type ?? 'button',
          popovertarget: context.id.value,
          'aria-haspopup': context.role.value === 'dialog' ? 'dialog' : undefined,
          'aria-expanded': context.open.value,
          'aria-controls': context.id.value,
          'data-vf-popover-trigger': '',
          onClick(event: MouseEvent) {
            if (event.defaultPrevented) return;
            event.preventDefault();
            context.setOpen(!context.open.value);
          },
        }),
        slots.default?.(),
      );
  },
});
export const PopoverContent = defineComponent({
  name: 'VfPopoverContent',
  inheritAttrs: false,
  setup(_p, { attrs, slots }) {
    const context = usePopover();
    let restoreFocus = false;
    function sync() {
      const surface = context.content.value;
      const trigger = context.anchor.value;
      if (!surface || !trigger) return;
      if (context.open.value && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      if (!context.open.value && surface.matches(':popover-open')) surface.hidePopover();
    }
    onMounted(sync);
    watch([context.open, context.anchor, context.content], sync, { flush: 'post' });
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          id: context.id.value,
          ref: context.content,
          role: context.role.value,
          popover: 'auto',
          'data-vf-popover-content': '',
          'data-vf-open': context.open.value ? '' : undefined,
          'data-vf-placement': context.placement.value,
          onBeforetoggle(event: Event) {
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            restoreFocus = surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
          },
          onToggle(event: Event) {
            if (event.target !== event.currentTarget) return;
            const surface = event.currentTarget as HTMLElement;
            const actual = surface.matches(':popover-open');
            if (!actual && restoreFocus) {
              restoreFocus = false;
              const active = surface.ownerDocument.activeElement;
              if (!active || active === surface.ownerDocument.body || surface.contains(active)) context.anchor.value?.focus();
            }
            if (actual === context.open.value) return;
            context.setOpen(actual);
            void nextTick(sync);
          },
        }),
        slots.default?.(),
      );
  },
});
