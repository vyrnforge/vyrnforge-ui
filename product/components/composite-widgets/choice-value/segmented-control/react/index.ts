import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
interface Ctx {
  value: string;
  name: string;
  set(value: string): void;
}
const C = createContext<Ctx | null>(null);
function useS(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('SegmentedControlItem must be inside root.');
  return value;
}
export interface SegmentedControlRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  name?: string;
  onValueChange?(v: string): void;
  children?: ReactNode;
}
export const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlRootProps>(function SegmentedControlRoot(
  { value, defaultValue = '', name, onValueChange, children, ...props },
  ref,
) {
  const generated = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const groupName = name ?? `vf-segmented-${generated}`;
  const ctx = useMemo<Ctx>(
    () => ({
      value: selected,
      name: groupName,
      set(candidate) {
        if (candidate === selected) return;
        if (value === undefined) setInternalValue(candidate);
        onValueChange?.(candidate);
      },
    }),
    [groupName, onValueChange, selected, value],
  );
  return createElement(
    C.Provider,
    { value: ctx },
    createElement('div', { ...props, ref, role: 'radiogroup', 'data-vf-segmented-control-root': '' }, children),
  );
});
export interface SegmentedControlItemProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'name' | 'value' | 'checked' | 'defaultChecked' | 'children'
> {
  value: string;
  children?: ReactNode;
}
export const SegmentedControlItem = forwardRef<HTMLInputElement, SegmentedControlItemProps>(
  function SegmentedControlItem({ value, children, onChange, ...props }, ref) {
    const segmented = useS();
    return createElement(
      'label',
      { 'data-vf-segmented-control-item': '' },
      createElement('input', {
        ...props,
        ref,
        type: 'radio',
        name: segmented.name,
        value,
        checked: segmented.value === value,
        onChange(event) {
          onChange?.(event);
          if (!event.defaultPrevented) segmented.set(value);
        },
      }),
      children,
    );
  },
);
