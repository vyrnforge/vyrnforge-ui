import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, type InjectionKey, type Ref } from 'vue';

function acceptDrop(input: HTMLInputElement, files: FileList): void {
  if (files.length === 0 || input.matches(':disabled')) return;
  if (input.multiple || files.length === 1) input.files = files;
  else {
    const transfer = new DataTransfer();
    const first = files.item(0);
    if (!first) return;
    transfer.items.add(first);
    input.files = transfer.files;
  }
  // A drop is a native file acquisition request, not an independent file store.
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const listener of handler) if (typeof listener === 'function') listener(event);
}
interface Ctx {
  files: Ref<File[]>;
  input: Ref<HTMLInputElement | null>;
  inputDisabled: Ref<boolean>;
  add(v: FileList | File[]): void;
}
const k: InjectionKey<Ctx> = Symbol('fu');
function useF() {
  const v = inject(k);
  if (!v) throw new Error('FileUploader parts must be inside root.');
  return v;
}
export const FileUploaderRoot = defineComponent({
  name: 'FileUploaderRoot',
  inheritAttrs: false,
  emits: ['files-change'],
  setup(_, { attrs, slots, emit }) {
    const files = ref<File[]>([]),
      input = ref<HTMLInputElement | null>(null),
      inputDisabled = ref(false);
    provide(k, {
      files,
      input,
      inputDisabled,
      add(v) {
        files.value = Array.from(v);
        emit('files-change', files.value);
      },
    });
    return () => h('div', { ...attrs, 'data-vf-file-uploader-root': '' }, slots.default?.());
  },
});
export const FileUploaderInput = defineComponent({
  name: 'FileUploaderInput',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const f = useF();
    let cleanup: (() => void) | undefined;
    onMounted(() => {
      const element = f.input.value;
      if (!element) return;
      const setDisabled = (disabled: boolean) => { f.inputDisabled.value = disabled; };
      const sync = () => setDisabled(element.matches(':disabled'));
      const observer = new MutationObserver(sync);
      observer.observe(element, { attributes: true, attributeFilter: ['disabled'] });
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.tagName === 'FIELDSET') observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
      }
      sync();
      const document = element.ownerDocument;
      let active = true;
      const onReset = (event: Event) => {
        if (!element.form || element.form !== event.target || !element.files?.length) return;
        setTimeout(() => {
          if (active && !event.defaultPrevented && element.form === event.target && !element.files?.length) f.add([]);
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      cleanup = () => {
        active = false;
        observer.disconnect();
        document.removeEventListener('reset', onReset, true);
        setDisabled(false);
      };
    });
    onBeforeUnmount(() => cleanup?.());
    return () =>
      h('input', {
        ...attrs,
        ref: (n: unknown) => {
          f.input.value = n as HTMLInputElement | null;
        },
        type: 'file',
        value: undefined,
        defaultValue: undefined,
        'data-vf-file-uploader-input': '',
        onChange: (e: Event) => {
          invoke(attrs.onChange, e);
          const element = e.currentTarget as HTMLInputElement;
          if (!element.matches(':disabled') && element.files) f.add(element.files);
        },
      });
  },
});
export const FileUploaderDropzone = defineComponent({
  name: 'FileUploaderDropzone',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const f = useF();
    const blocked = (button: HTMLButtonElement) => button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true' || !f.input.value || f.input.value.matches(':disabled');
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          'aria-disabled': f.inputDisabled.value || attrs['aria-disabled'],
          'data-vf-file-uploader-dropzone': '',
          onClick: (e: MouseEvent) => {
            invoke(attrs.onClick, e);
            if (!e.defaultPrevented && !blocked(e.currentTarget as HTMLButtonElement)) f.input.value?.click();
          },
          onDragover: (e: DragEvent) => {
            invoke(attrs.onDragover, e);
            if (!e.defaultPrevented && e.dataTransfer?.types.includes('Files')) {
              e.preventDefault();
              e.dataTransfer.dropEffect = blocked(e.currentTarget as HTMLButtonElement) ? 'none' : 'copy';
            }
          },
          onDrop: (e: DragEvent) => {
            invoke(attrs.onDrop, e);
            if (e.defaultPrevented) return;
            e.preventDefault();
            const input = f.input.value;
            if (input && e.dataTransfer && !blocked(e.currentTarget as HTMLButtonElement)) acceptDrop(input, e.dataTransfer.files);
          },
        },
        slots.default?.(),
      );
  },
});
export const FileUploaderList = defineComponent({
  name: 'FileUploaderList',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const f = useF();
    return () =>
      h(
        'ul',
        { ...attrs, 'data-vf-file-uploader-list': '' },
        f.files.value.map((x, i) => h('li', { key: `${x.name}-${i}` }, x.name)),
      );
  },
});
