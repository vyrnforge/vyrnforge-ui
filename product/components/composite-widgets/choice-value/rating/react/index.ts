import { createContext, createElement, useContext, useId, useMemo, useState, type ReactNode } from 'react';
interface Ctx {
  value: number;
  name: string;
  set(v: number): void;
}
const C = createContext<Ctx | null>(null);
function useR() {
  const v = useContext(C);
  if (!v) throw new Error('RatingItem must be inside RatingRoot.');
  return v;
}
export interface RatingRootProps {
  value?: number;
  defaultValue?: number;
  name?: string;
  max?: number;
  getItemLabel?(value: number): string;
  onValueChange?(v: number): void;
  children?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
export function RatingRoot({
  value,
  defaultValue = 0,
  name,
  max = 5,
  getItemLabel,
  onValueChange,
  children,
  'aria-label': label,
  'aria-labelledby': labelledBy,
}: RatingRootProps) {
  const id = useId();
  const [iv, setIv] = useState(defaultValue);
  const selected = value ?? iv;
  const groupName = name ?? `vf-rating-${id}`;
  const ctx = useMemo(
    () => ({
      value: selected,
      name: groupName,
      set(v: number) {
        if (v === selected) return;
        if (value === undefined) setIv(v);
        onValueChange?.(v);
      },
    }),
    [selected, groupName, value, onValueChange],
  );
  const count = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 0;
  return createElement(
    C.Provider,
    { value: ctx },
    createElement(
      'div',
      {
        role: 'radiogroup',
        'aria-label': label,
        'aria-labelledby': labelledBy,
        'data-vf-rating-root': '',
        'data-vf-max': count,
      },
      children ??
        Array.from({ length: count }, (_, i) =>
          createElement(RatingItem, { key: i + 1, value: i + 1, label: getItemLabel?.(i + 1) ?? String(i + 1) }),
        ),
    ),
  );
}
export interface RatingItemProps {
  value: number;
  label?: string;
  disabled?: boolean;
}
export function RatingItem({ value, label, disabled }: RatingItemProps) {
  const r = useR();
  return createElement(
    'label',
    { 'data-vf-rating-item': '' },
    createElement('input', {
      type: 'radio',
      name: r.name,
      value,
      checked: r.value === value,
      disabled,
      'aria-label': label ?? String(value),
      onChange: () => r.set(value),
    }),
    createElement('span', { 'aria-hidden': true, 'data-vf-rating-glyph': '' }),
  );
}
