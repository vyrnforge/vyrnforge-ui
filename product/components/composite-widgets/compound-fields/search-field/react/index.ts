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
interface Ctx {
  value: string;
  set(v: string): void;
  resetValue: string;
  reset(): string;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
}
const C = createContext<Ctx | null>(null);
function useS() {
  const v = useContext(C);
  if (!v) throw new Error('SearchField parts must be inside root.');
  return v;
}
export interface SearchFieldRootProps extends ComponentPropsWithoutRef<'div'> {
  value?: string;
  defaultValue?: string;
  onValueChange?(v: string): void;
  children?: ReactNode;
}
export const SearchFieldRoot = forwardRef<HTMLDivElement, SearchFieldRootProps>(function SearchFieldRoot(
  { value, defaultValue = '', onValueChange, children, ...props },
  ref,
) {
  const initial = useRef(defaultValue);
  const [iv, setIv] = useState(initial.current);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const current = value ?? iv;
  const set = (v: string) => {
    if (v === current) return;
    if (value === undefined) setIv(v);
    onValueChange?.(v);
  };
  return createElement(
    C.Provider,
    {
      value: {
        value: current,
        set,
        inputRef,
        resetValue: value ?? initial.current,
        reset: () => {
          if (value === undefined) setIv(initial.current);
          return value ?? initial.current;
        },
      },
    },
    createElement('div', { ...props, ref, role: 'search', 'data-vf-search-field-root': '' }, children),
  );
});
export type SearchFieldInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue'>;
export const SearchFieldInput = forwardRef<HTMLInputElement, SearchFieldInputProps>(
  function SearchFieldInput(props, ref) {
    const s = useS();
    const reset = useRef(s.reset);
    useLayoutEffect(() => {
      reset.current = s.reset;
      if (s.inputRef.current) s.inputRef.current.defaultValue = s.resetValue;
    });
    useEffect(() => {
      const element = s.inputRef.current;
      if (!element) return;
      const document = element.ownerDocument;
      let active = true;
      const onReset = (event: Event) => {
        if (!element.form || element.form !== event.target) return;
        setTimeout(() => {
          if (!active || event.defaultPrevented || element.form !== event.target) return;
          element.value = reset.current();
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      return () => {
        active = false;
        document.removeEventListener('reset', onReset, true);
      };
    }, [s.inputRef]);
    return createElement('input', {
      ...props,
      ref(n) {
        s.inputRef.current = n;
        if (typeof ref === 'function') ref(n);
        else if (ref) ref.current = n;
      },
      type: 'search',
      value: s.value,
      'data-vf-search-field-input': '',
      onChange: (e) => {
        props.onChange?.(e);
        if (!e.defaultPrevented && !e.currentTarget.readOnly && !e.currentTarget.matches(':disabled'))
          s.set(e.currentTarget.value);
      },
    });
  },
);
export const SearchFieldClear = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function SearchFieldClear(props, ref) {
    const s = useS();
    return createElement(
      'button',
      {
        ...props,
        ref,
        type: props.type ?? 'button',
        'data-vf-search-field-clear': '',
        disabled: props.disabled || !s.value,
        onClick: (e) => {
          props.onClick?.(e);
          const input = s.inputRef.current;
          if (!e.defaultPrevented && input && !input.readOnly && !input.matches(':disabled') && input.value) {
            s.set('');
            input.focus();
          }
        },
      },
      props.children ?? '×',
    );
  },
);
