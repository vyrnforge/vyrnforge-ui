import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useId,
  watch,
  type ComponentPublicInstance,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

type Activity = 'trigger' | 'content' | 'focus';
interface Context {
  id: Readonly<Ref<string>>;
  open: Readonly<Ref<boolean>>;
  anchor: Ref<HTMLElement | null>;
  content: Ref<HTMLElement | null>;
  placement: Readonly<Ref<FloatingPlacement>>;
  activity(source: Activity, active: boolean, delay: number): void;
  openDelay: Readonly<Ref<number>>;
  closeDelay: Readonly<Ref<number>>;
}
const Key: InjectionKey<Context> = Symbol('VyrnForgePreviewCard');
function usePreviewCard() {
  const value = inject(Key);
  if (!value) throw new Error('PreviewCard parts must be inside PreviewCardRoot.');
  return value;
}

export const PreviewCardRoot = defineComponent({
  name: 'VfPreviewCardRoot',
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 100 },
    contentId: String,
  },
  emits: ['update:modelValue', 'openChange'],
  setup(props, { slots, emit }) {
    const internal = ref(props.defaultOpen);
    const open = computed(() => props.modelValue ?? internal.value);
    const generated = useId();
    const anchor = ref<HTMLElement | null>(null);
    const content = ref<HTMLElement | null>(null);
    const sources = { trigger: false, content: false, focus: false, dismissed: false };
    let timer: ReturnType<typeof setTimeout> | null = null;

    function cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    }
    function setOpen(value: boolean) {
      if (value === open.value) return;
      if (props.modelValue === undefined) internal.value = value;
      emit('update:modelValue', value);
      emit('openChange', value);
    }
    function activity(source: Activity, active: boolean, delay: number) {
      sources[source] = active;
      cancel();
      const present = sources.trigger || sources.content || sources.focus;
      if (!present) sources.dismissed = false;
      const next = present && !sources.dismissed;
      if (next === open.value) return;
      timer = setTimeout(
        () => {
          timer = null;
          setOpen(next);
        },
        Math.max(0, delay),
      );
    }
    function dismiss(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || !open.value) return;
      sources.dismissed = true;
      cancel();
      setOpen(false);
      event.preventDefault();
    }

    let ownerDocument: Document | undefined;
    onMounted(() => {
      ownerDocument = anchor.value?.ownerDocument;
      ownerDocument?.addEventListener('keydown', dismiss);
    });
    onUnmounted(() => {
      cancel();
      ownerDocument?.removeEventListener('keydown', dismiss);
    });
    watch(open, (value) => {
      if (!value) sources.content = false;
    });

    provide(Key, {
      id: computed(() => props.contentId ?? `vf-preview-card-${generated}`),
      open,
      anchor,
      content,
      placement: computed(() => props.placement),
      activity,
      openDelay: computed(() => props.openDelay),
      closeDelay: computed(() => props.closeDelay),
    });
    return () => slots.default?.();
  },
});

export const PreviewCardTrigger = defineComponent({
  name: 'VfPreviewCardTrigger',
  inheritAttrs: false,
  setup(_p, { attrs, slots }) {
    const context = usePreviewCard();
    function assignRef(value: Element | ComponentPublicInstance | null) {
      context.anchor.value = value instanceof HTMLElement ? value : null;
    }
    return () => {
      const nodes = slots.default?.() ?? [];
      const child = nodes.find((node) => typeof node.type === 'string' || typeof node.type === 'object');
      if (!child) return nodes;
      return cloneVNode(
        child,
        mergeProps(attrs, {
          ref: assignRef,
          'aria-controls': context.id.value,
          'aria-expanded': context.open.value,
          'data-vf-preview-card-trigger': '',
          onPointerenter: (event: PointerEvent) => {
            if (!event.defaultPrevented && event.pointerType !== 'touch') {
              context.activity('trigger', true, context.openDelay.value);
            }
          },
          onPointerleave: (event: PointerEvent) => {
            if (event.pointerType !== 'touch') context.activity('trigger', false, context.closeDelay.value);
          },
          onFocus: (event: FocusEvent) => {
            if (!event.defaultPrevented) context.activity('focus', true, 0);
          },
          onBlur: (event: FocusEvent) => {
            if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null) && !context.content.value?.contains(event.relatedTarget as Node | null)) {
              context.activity('focus', false, context.closeDelay.value);
            }
          },
        }),
        true,
      );
    };
  },
});

export const PreviewCardContent = defineComponent({
  name: 'VfPreviewCardContent',
  inheritAttrs: false,
  setup(_p, { attrs, slots }) {
    const context = usePreviewCard();
    function sync() {
      const surface = context.content.value;
      const trigger = context.anchor.value;
      if (!surface || !trigger) return;
      if (context.open.value && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      if (!context.open.value && surface.matches(':popover-open')) {
        if (surface.contains(surface.ownerDocument.activeElement)) trigger.focus();
        surface.hidePopover();
      }
    }
    onMounted(sync);
    watch([context.open, context.anchor, context.content], sync, { flush: 'post' });
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          id: context.id.value,
          ref: context.content,
          popover: 'manual',
          'data-vf-preview-card-content': '',
          'data-vf-open': context.open.value ? '' : undefined,
          'data-vf-placement': context.placement.value,
          onFocusin: (event: FocusEvent) => {
            if (!event.defaultPrevented) context.activity('focus', true, 0);
          },
          onFocusout: (event: FocusEvent) => {
            const related = event.relatedTarget as Node | null;
            if (!(event.currentTarget as HTMLElement).contains(related) && !context.anchor.value?.contains(related)) {
              context.activity('focus', false, context.closeDelay.value);
            }
          },
          onPointerenter: (event: PointerEvent) => {
            if (!event.defaultPrevented && event.pointerType !== 'touch') context.activity('content', true, 0);
          },
          onPointerleave: (event: PointerEvent) => {
            if (event.pointerType !== 'touch') context.activity('content', false, context.closeDelay.value);
          },
        }),
        slots.default?.(),
      );
  },
});
