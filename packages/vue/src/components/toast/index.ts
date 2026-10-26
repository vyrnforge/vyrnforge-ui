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

interface ToastContextValue {
  requestClose(): void;
}

const ToastContextKey: InjectionKey<ToastContextValue> = Symbol('VyrnForgeToast');

function useToastContext(): ToastContextValue {
  const context = inject(ToastContextKey);
  if (!context) throw new Error('ToastClose must be inside ToastRoot.');
  return context;
}

function normalizeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function callHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const candidate of handler) if (typeof candidate === 'function') candidate(event);
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
    duration: { type: Number, default: 5000 },
  },
  emits: ['update:open'],
  setup(props, { attrs, slots, emit }) {
    const internalOpen = ref(props.defaultOpen);
    const desiredOpen = computed(() => props.open ?? internalOpen.value);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let deadline = 0;
    let remaining = normalizeDuration(props.duration);
    const pauseReasons = new Set<'pointer' | 'focus'>();
    let timeoutRequested = false;
    let previousOpen = false;
    let previousDuration = -1;
    let mounted = false;

    function clearTimer() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      deadline = 0;
    }

    function requestClose() {
      if (props.open === undefined) internalOpen.value = false;
      emit('update:open', false);
    }

    function armTimer(delay: number) {
      clearTimer();
      if (delay <= 0 || timeoutRequested || pauseReasons.size > 0) return;
      remaining = delay;
      deadline = Date.now() + delay;
      timer = setTimeout(() => {
        timer = null;
        deadline = 0;
        remaining = 0;
        timeoutRequested = true;
        requestClose();
      }, delay);
    }

    function syncTimer() {
      if (!mounted) return;
      const open = desiredOpen.value;
      const duration = normalizeDuration(props.duration);
      const opening = open && !previousOpen;
      const durationChanged = duration !== previousDuration;
      previousOpen = open;
      previousDuration = duration;

      if (!open) {
        clearTimer();
        remaining = duration;
        timeoutRequested = false;
        pauseReasons.clear();
        return;
      }

      if (opening) timeoutRequested = false;
      if (opening || durationChanged) {
        clearTimer();
        remaining = duration;
        if (!timeoutRequested && pauseReasons.size === 0) armTimer(duration);
      }
    }

    function pauseTimer(reason: 'pointer' | 'focus') {
      if (!desiredOpen.value || timeoutRequested || pauseReasons.has(reason)) return;
      const wasActive = pauseReasons.size === 0;
      pauseReasons.add(reason);
      if (wasActive && timer !== null) {
        remaining = Math.max(0, deadline - Date.now());
        clearTimer();
      }
    }

    function resumeTimer(reason: 'pointer' | 'focus') {
      pauseReasons.delete(reason);
      if (pauseReasons.size > 0 || !desiredOpen.value || timeoutRequested) return;
      if (remaining <= 0) {
        timeoutRequested = true;
        requestClose();
        return;
      }
      armTimer(remaining);
    }

    provide(ToastContextKey, { requestClose });

    onMounted(() => {
      mounted = true;
      syncTimer();
    });
    watch([desiredOpen, () => props.duration], syncTimer);
    onBeforeUnmount(clearTimer);

    return () => desiredOpen.value ? h('div', {
      ...attrs,
      'data-vf-toast-root': '',
      onPointerenter(event: PointerEvent) {
        callHandler(attrs.onPointerenter, event);
        pauseTimer('pointer');
      },
      onPointerleave(event: PointerEvent) {
        callHandler(attrs.onPointerleave, event);
        resumeTimer('pointer');
      },
      onFocusin(event: FocusEvent) {
        callHandler(attrs.onFocusin, event);
        if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) pauseTimer('focus');
      },
      onFocusout(event: FocusEvent) {
        callHandler(attrs.onFocusout, event);
        if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) resumeTimer('focus');
      },
    }, slots.default?.()) : null;
  },
});

export const ToastTitle = defineComponent({
  name: 'ToastTitle',
  setup(_props, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-vf-toast-title': '' }, slots.default?.());
  },
});

export const ToastDescription = defineComponent({
  name: 'ToastDescription',
  setup(_props, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-vf-toast-description': '' }, slots.default?.());
  },
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
        emit('dismiss');
        context.requestClose();
      },
    }, slots.default?.() ?? '×');
  },
});
