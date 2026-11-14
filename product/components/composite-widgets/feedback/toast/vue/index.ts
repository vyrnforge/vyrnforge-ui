import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue';

const DEFAULT_DURATION = 5000;
type PauseReason = 'pointer' | 'focus';
function normalizedDuration(duration: number): number | null { return Number.isFinite(duration) && duration > 0 ? duration : null; }
function callHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const candidate of handler) if (typeof candidate === 'function') candidate(event);
}

interface ToastContextValue { requestClose(): void; }
const ToastContextKey: InjectionKey<ToastContextValue> = Symbol('VyrnForgeToast');
function useToastContext(): ToastContextValue {
  const context = inject(ToastContextKey);
  if (!context) throw new Error('ToastClose must be inside ToastRoot.');
  return context;
}

export const ToastViewport = defineComponent({
  name: 'ToastViewport',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', {
      ...attrs,
      'aria-live': (attrs['aria-live'] as string | undefined) ?? 'polite',
      'aria-relevant': (attrs['aria-relevant'] as string | undefined) ?? 'additions text',
      'data-vf-toast-viewport': '',
    }, slots.default?.());
  },
});

export const ToastRoot = defineComponent({
  name: 'ToastRoot',
  inheritAttrs: false,
  props: {
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultOpen: { type: Boolean, default: true },
    duration: { type: Number, default: DEFAULT_DURATION },
  },
  emits: ['update:open', 'openChange'],
  setup(props, { attrs, slots, emit }) {
    const internalOpen = ref(props.defaultOpen);
    const committedOpen = computed(() => props.open ?? internalOpen.value);
    const pauseReasons = new Set<PauseReason>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let deadline = 0;
    let remaining: number | null = null;
    let timeoutRequested = false;
    let wasOpen = false;
    let mounted = false;

    function clearTimer() { if (timer !== undefined) clearTimeout(timer); timer = undefined; }
    function requestClose() {
      if (props.open === undefined) internalOpen.value = false;
      emit('update:open', false);
      emit('openChange', false);
    }
    function expire() {
      clearTimer();
      remaining = null;
      if (timeoutRequested) return;
      timeoutRequested = true;
      requestClose();
    }
    function armRemaining() {
      if (!mounted || !committedOpen.value || timeoutRequested || pauseReasons.size > 0 || remaining === null) return;
      if (remaining <= 0) { expire(); return; }
      clearTimer();
      deadline = Date.now() + remaining;
      timer = setTimeout(expire, remaining);
    }
    function pause(reason: PauseReason) {
      if (pauseReasons.has(reason)) return;
      const running = pauseReasons.size === 0 && timer !== undefined;
      pauseReasons.add(reason);
      if (!running) return;
      remaining = Math.max(0, deadline - Date.now());
      clearTimer();
    }
    function resume(reason: PauseReason) {
      if (!pauseReasons.delete(reason) || pauseReasons.size > 0) return;
      armRemaining();
    }
    function resetTimer() {
      clearTimer();
      if (!mounted || !committedOpen.value) {
        wasOpen = false;
        timeoutRequested = false;
        remaining = null;
        pauseReasons.clear();
        return;
      }
      if (!wasOpen) {
        wasOpen = true;
        timeoutRequested = false;
        pauseReasons.clear();
      }
      if (timeoutRequested) return;
      const duration = normalizedDuration(props.duration);
      remaining = duration;
      if (duration !== null && pauseReasons.size === 0) {
        deadline = Date.now() + duration;
        timer = setTimeout(expire, duration);
      }
    }

    provide(ToastContextKey, { requestClose });
    onMounted(() => { mounted = true; resetTimer(); });
    onBeforeUnmount(() => { mounted = false; clearTimer(); });
    watch([committedOpen, () => props.duration], resetTimer);

    return () => committedOpen.value ? h('div', {
      ...attrs,
      role: (attrs.role as string | undefined) ?? 'status',
      'data-vf-toast-root': '',
      'data-vf-open': '',
      onPointerenter(event: PointerEvent) { callHandler(attrs.onPointerenter, event); pause('pointer'); },
      onPointerleave(event: PointerEvent) { callHandler(attrs.onPointerleave, event); resume('pointer'); },
      onFocusin(event: FocusEvent) { callHandler(attrs.onFocusin, event); if (!(event.currentTarget as Node).contains(event.relatedTarget as Node | null)) pause('focus'); },
      onFocusout(event: FocusEvent) { callHandler(attrs.onFocusout, event); if (!(event.currentTarget as Node).contains(event.relatedTarget as Node | null)) resume('focus'); },
    }, slots.default?.()) : null;
  },
});

export const ToastTitle = defineComponent({
  name: 'ToastTitle', inheritAttrs: false,
  setup(_props, { attrs, slots }) { return () => h('div', { ...attrs, 'data-vf-toast-title': '' }, slots.default?.()); },
});

export const ToastDescription = defineComponent({
  name: 'ToastDescription', inheritAttrs: false,
  setup(_props, { attrs, slots }) { return () => h('div', { ...attrs, 'data-vf-toast-description': '' }, slots.default?.()); },
});

export const ToastClose = defineComponent({
  name: 'ToastClose',
  inheritAttrs: false,
  emits: ['dismiss'],
  setup(_props, { attrs, slots, emit }) {
    const context = useToastContext();
    return () => h('button', {
      ...attrs,
      type: attrs.type ?? 'button',
      'data-vf-toast-close': '',
      onClick(event: MouseEvent) {
        callHandler(attrs.onClick, event);
        if (event.defaultPrevented) return;
        context.requestClose();
        emit('dismiss');
      },
    }, slots.default?.());
  },
});
