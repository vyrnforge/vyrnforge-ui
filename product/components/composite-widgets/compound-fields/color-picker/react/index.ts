import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useLayoutEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from 'react';

function hex(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}
function requiredHex(value: string): string {
  const normalized = hex(value);
  if (normalized === null) throw new RangeError('ColorPicker value must be a six-digit hex color.');
  return normalized;
}
interface Ctx {
  value: string;
  controlled: boolean;
  disabled: boolean;
  set(v: string): void;
}
const C = createContext<Ctx | null>(null);
function useC() {
  const v = useContext(C);
  if (!v) throw new Error('ColorPicker parts must be inside root.');
  return v;
}
export interface ColorPickerRootProps extends ComponentPropsWithoutRef<'div'> {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?(v: string): void;
  children?: ReactNode;
}
export const ColorPickerRoot = forwardRef<HTMLDivElement, ColorPickerRootProps>(function ColorPickerRoot(
  { value, defaultValue = '#000000', disabled = false, onValueChange, children, ...props },
  ref,
) {
  const [internal, setInternal] = useState(() => requiredHex(defaultValue));
  const controlled = value !== undefined;
  const current = controlled ? requiredHex(value) : internal;
  const set = (v: string) => {
    const next = hex(v);
    if (disabled || next === null || next === current) return;
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };
  return createElement(
    C.Provider,
    { value: { value: current, controlled, disabled, set } },
    createElement('div', { ...props, ref, 'data-vf-color-picker-root': '' }, children),
  );
});
export type ColorPickerInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue'>;
export const ColorPickerInput = forwardRef<HTMLInputElement, ColorPickerInputProps>(function ColorPickerInput(
  { disabled, onChange, ...props },
  ref,
) {
  const c = useC();
  return createElement('input', {
    ...props,
    ref,
    type: 'color',
    value: c.value,
    disabled: c.disabled || disabled,
    'data-vf-color-picker-input': '',
    onChange: (event) => {
      onChange?.(event);
      if (!event.defaultPrevented && !event.currentTarget.matches(':disabled')) c.set(event.currentTarget.value);
    },
  });
});
export const ColorPickerTextInput = forwardRef<HTMLInputElement, ColorPickerInputProps>(function ColorPickerTextInput(
  { disabled, readOnly, onChange, ...props },
  ref,
) {
  const c = useC();
  const [draft, setDraft] = useState(c.value);
  useLayoutEffect(() => setDraft(c.value), [c.value]);
  return createElement('input', {
    ...props,
    ref,
    type: 'text',
    value: draft,
    pattern: '#[0-9a-fA-F]{6}',
    disabled: c.disabled || disabled,
    readOnly,
    'data-vf-color-picker-text': '',
    onChange: (event) => {
      onChange?.(event);
      if (event.defaultPrevented || event.currentTarget.matches(':disabled') || event.currentTarget.readOnly) return;
      const text = event.currentTarget.value;
      const next = hex(text);
      if (next === null) {
        setDraft(text);
        return;
      }
      c.set(next);
      setDraft(c.controlled ? c.value : next);
    },
  });
});
export function ColorPickerSwatch(props: ComponentPropsWithoutRef<'span'>): ReactElement {
  const c = useC();
  return createElement('span', {
    ...props,
    'aria-hidden': true,
    'data-vf-color-picker-swatch': '',
    style: { ...props.style, backgroundColor: c.value },
  });
}
