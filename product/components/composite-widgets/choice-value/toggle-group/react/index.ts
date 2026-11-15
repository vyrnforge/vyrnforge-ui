import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
export type ToggleGroupType = 'single' | 'multiple';
interface Ctx {
  type: ToggleGroupType;
  values: string[];
  toggle(v: string): void;
}
const C = createContext<Ctx | null>(null);
function useG() {
  const v = useContext(C);
  if (!v) throw new Error('ToggleGroupItem must be inside ToggleGroupRoot.');
  return v;
}
export interface ToggleGroupRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'> {
  type?: ToggleGroupType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?(v: string | string[]): void;
  children?: ReactNode;
}
function normalize(value: string | string[] | undefined, type: ToggleGroupType): string[] {
  const values = Array.from(new Set((typeof value === 'string' ? [value] : (value ?? [])).filter(Boolean)));
  return type === 'single' ? values.slice(0, 1) : values;
}

function toggled(values: string[], value: string, type: ToggleGroupType): string[] {
  if (type === 'single') return values[0] === value ? [] : [value];
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}
export const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRootProps>(function ToggleGroupRoot(
  { type = 'single', value, defaultValue, onValueChange, children, ...props },
  ref,
) {
  const [iv, setIv] = useState(() => normalize(defaultValue, type));
  const values = normalize(value ?? iv, type);
  const ctx = useMemo(
    () => ({
      type,
      values,
      toggle(v: string) {
        if (!v) return;
        const next = toggled(values, v, type);
        if (value === undefined) setIv(next);
        onValueChange?.(type === 'single' ? (next[0] ?? '') : next);
      },
    }),
    [type, values, value, onValueChange],
  );
  return createElement(
    C.Provider,
    { value: ctx },
    createElement('div', { ...props, ref, role: 'group', 'data-vf-toggle-group-root': '' }, children),
  );
});
export interface ToggleGroupItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}
export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, disabled, ...props },
  ref,
) {
  const g = useG();
  const pressed = g.values.includes(value);
  return createElement('button', {
    ...props,
    ref,
    type: 'button',
    disabled,
    'aria-pressed': pressed,
    'data-vf-value': value,
    'data-vf-toggle-group-item': '',
    'data-vf-state': pressed ? 'on' : 'off',
    onClick: (e) => {
      props.onClick?.(e);
      if (!e.defaultPrevented && !disabled && props['aria-disabled'] !== true && props['aria-disabled'] !== 'true')
        g.toggle(value);
    },
  });
});
