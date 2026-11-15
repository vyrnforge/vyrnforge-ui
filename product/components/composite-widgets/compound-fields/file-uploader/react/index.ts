import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

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
interface Ctx {
  files: File[];
  add(files: FileList | File[]): void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  inputDisabled: boolean;
  setInputDisabled(value: boolean): void;
}
const C = createContext<Ctx | null>(null);
function useF() {
  const v = useContext(C);
  if (!v) throw new Error('FileUploader parts must be inside root.');
  return v;
}
export interface FileUploaderRootProps extends ComponentPropsWithoutRef<'div'> {
  onFilesChange?(files: File[]): void;
  children?: ReactNode;
}
export const FileUploaderRoot = forwardRef<HTMLDivElement, FileUploaderRootProps>(function FileUploaderRoot(
  { onFilesChange, children, ...props },
  ref,
) {
  const [files, setFiles] = useState<File[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const add = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    setFiles(next);
    onFilesChange?.(next);
  };
  return createElement(
    C.Provider,
    { value: { files, add, inputRef, inputDisabled, setInputDisabled } },
    createElement('div', { ...props, ref, 'data-vf-file-uploader-root': '' }, children),
  );
});
export type FileUploaderInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue'>;
export const FileUploaderInput = forwardRef<HTMLInputElement, FileUploaderInputProps>(
  function FileUploaderInput(props, ref) {
    const f = useF();
    const add = useRef(f.add);
    const { inputRef, setInputDisabled: setDisabled } = f;
    useLayoutEffect(() => { add.current = f.add; });
    useEffect(() => {
      const element = inputRef.current;
      if (!element) return;
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
          if (active && !event.defaultPrevented && element.form === event.target && !element.files?.length) add.current([]);
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      return () => {
        active = false;
        observer.disconnect();
        document.removeEventListener('reset', onReset, true);
        setDisabled(false);
      };
    }, [inputRef, setDisabled]);
    return createElement('input', {
      ...props,
      ref(n) {
        f.inputRef.current = n;
        if (typeof ref === 'function') ref(n);
        else if (ref) ref.current = n;
      },
      type: 'file',
      'data-vf-file-uploader-input': '',
      onChange: (e) => {
        props.onChange?.(e);
        if (!e.currentTarget.matches(':disabled') && e.currentTarget.files) f.add(e.currentTarget.files);
      },
    });
  },
);
export type FileUploaderDropzoneProps = Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'role'>;
export const FileUploaderDropzone = forwardRef<HTMLButtonElement, FileUploaderDropzoneProps>(
  function FileUploaderDropzone(props, ref) {
    const f = useF();
    const blocked = (button: HTMLButtonElement) => button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true' || !f.inputRef.current || f.inputRef.current.matches(':disabled');
    return createElement('button', {
      ...props,
      ref,
      type: 'button',
      'aria-disabled': f.inputDisabled || props['aria-disabled'],
      'data-vf-file-uploader-dropzone': '',
      onClick: (e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented && !blocked(e.currentTarget)) f.inputRef.current?.click();
      },
      onDragOver: (e) => {
        props.onDragOver?.(e);
        if (!e.defaultPrevented && e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = blocked(e.currentTarget) ? 'none' : 'copy';
        }
      },
      onDrop: (e) => {
        props.onDrop?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        const input = f.inputRef.current;
        if (input && !blocked(e.currentTarget)) acceptDrop(input, e.dataTransfer.files);
      },
    });
  },
);
export function FileUploaderList(props: ComponentPropsWithoutRef<'ul'>) {
  const f = useF();
  return createElement(
    'ul',
    { ...props, 'data-vf-file-uploader-list': '' },
    f.files.map((file, i) => createElement('li', { key: `${file.name}-${i}` }, file.name)),
  );
}
