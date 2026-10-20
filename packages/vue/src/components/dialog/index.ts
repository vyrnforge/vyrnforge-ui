import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue';

export type DialogDismissReason = 'escape' | 'backdrop' | 'close-control';

export interface DialogDismissRequest {
  readonly reason: DialogDismissReason;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

function createDismissRequest(reason: DialogDismissReason): DialogDismissRequest {
  let prevented = false;
  return {
    reason,
    get defaultPrevented() { return prevented; },
    preventDefault() { prevented = true; },
  };
}

interface DialogContextValue {
  rootId: string;
  titleId: string;
  descriptionId: string | undefined;
  requestDismiss(reason: DialogDismissReason): void;
}

const DialogContextKey: InjectionKey<DialogContextValue> = Symbol('VyrnForgeDialog');

function useDialogContext(): DialogContextValue {
  const context = inject(DialogContextKey);
  if (!context) throw new Error('VyrnForge Dialog compound components must be rendered inside DialogRoot.');
  return context;
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]'));
}

function callHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const candidate of handler) if (typeof candidate === 'function') candidate(event);
}

export interface DialogRootProps {
  id?: string;
  modelValue?: boolean;
  defaultOpen?: boolean;
  backdropDismiss?: boolean;
  titleId?: string;
  descriptionId?: string;
  initialFocus?: () => HTMLElement | null;
}

export const DialogRoot = defineComponent({
  name: 'VfDialogRoot',
  inheritAttrs: false,
  props: {
    id: String,
    modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    backdropDismiss: { type: Boolean, default: false },
    titleId: String,
    descriptionId: String,
    initialFocus: Function as PropType<() => HTMLElement | null>,
  },
  emits: ['update:modelValue', 'openChange', 'dismissRequest'],
  setup(props, { attrs, slots, emit, expose }) {
    const generatedId = useId().replaceAll(':', '');
    const rootId = props.id ?? `vf-dialog-${generatedId}`;
    const titleId = props.titleId ?? `${rootId}-title`;
    const internalOpen = ref(props.defaultOpen);
    const desiredOpen = computed(() => props.modelValue ?? internalOpen.value);
    const dialogRef = ref<HTMLDialogElement | null>(null);
    const restoreTarget = ref<HTMLElement | null>(null);
    let backdropPointerDown = false;
    let mounted = false;

    function restoreFocus() {
      const target = restoreTarget.value;
      restoreTarget.value = null;
      if (canRestoreFocus(target)) target.focus();
    }

    function requestDismiss(reason: DialogDismissReason) {
      const request = createDismissRequest(reason);
      emit('dismissRequest', request);
      if (request.defaultPrevented) return;
      if (props.modelValue === undefined) internalOpen.value = false;
      emit('update:modelValue', false);
      emit('openChange', false);
    }

    provide(DialogContextKey, { rootId, titleId, descriptionId: props.descriptionId, requestDismiss });
    expose({ element: dialogRef });

    async function syncDialog(captureRestoreTarget = true) {
      if (!mounted) return;
      await nextTick();
      const dialog = dialogRef.value;
      if (!dialog) return;
      if (desiredOpen.value && !dialog.open) {
        if (captureRestoreTarget) restoreTarget.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
        props.initialFocus?.()?.focus();
      } else if (!desiredOpen.value && dialog.open) {
        dialog.close();
      }
    }

    onMounted(() => {
      mounted = true;
      void syncDialog();
    });
    watch(desiredOpen, () => { void syncDialog(); });

    return () => h('dialog', {
      ...attrs,
      id: rootId,
      ref: dialogRef,
      'aria-labelledby': titleId,
      'aria-describedby': props.descriptionId,
      'data-vf-dialog-root': '',
      'data-vf-open': desiredOpen.value ? '' : undefined,
      'data-vf-backdrop-dismiss': props.backdropDismiss ? '' : undefined,
      onCancel(event: Event) {
        callHandler(attrs.onCancel, event);
        event.preventDefault();
        requestDismiss('escape');
      },
      onClose(event: Event) {
        callHandler(attrs.onClose, event);
        if (desiredOpen.value) {
          if (props.modelValue === undefined) {
            internalOpen.value = false;
            emit('update:modelValue', false);
            emit('openChange', false);
          } else {
            emit('update:modelValue', false);
            emit('openChange', false);
            void nextTick(() => { void syncDialog(false); });
            return;
          }
        }
        restoreFocus();
      },
      onPointerdown(event: PointerEvent) {
        callHandler(attrs.onPointerdown, event);
        backdropPointerDown = !event.defaultPrevented && event.target === event.currentTarget;
      },
      onClick(event: MouseEvent) {
        callHandler(attrs.onClick, event);
        const isBackdrop = backdropPointerDown && event.target === event.currentTarget;
        backdropPointerDown = false;
        if (!event.defaultPrevented && props.backdropDismiss && isBackdrop) requestDismiss('backdrop');
      },
    }, slots.default?.());
  },
});

export const DialogTitle = defineComponent({
  name: 'VfDialogTitle',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const context = useDialogContext();
    return () => h('h2', { ...attrs, id: attrs.id ?? context.titleId, 'data-vf-dialog-title': '' }, slots.default?.());
  },
});

export const DialogDescription = defineComponent({
  name: 'VfDialogDescription',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const context = useDialogContext();
    return () => h('p', {
      ...attrs,
      id: attrs.id ?? context.descriptionId ?? `${context.rootId}-description`,
      'data-vf-dialog-description': '',
    }, slots.default?.());
  },
});

export const DialogBody = defineComponent({
  name: 'VfDialogBody',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    useDialogContext();
    return () => h('div', { ...attrs, 'data-vf-dialog-body': '' }, slots.default?.());
  },
});

export const DialogClose = defineComponent({
  name: 'VfDialogClose',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const context = useDialogContext();
    return () => h('button', {
      ...attrs,
      type: attrs.type ?? 'button',
      'data-vf-dialog-close': '',
      onClick(event: MouseEvent) {
        callHandler(attrs.onClick, event);
        if (!event.defaultPrevented) context.requestDismiss('close-control');
      },
    }, slots.default?.());
  },
});
