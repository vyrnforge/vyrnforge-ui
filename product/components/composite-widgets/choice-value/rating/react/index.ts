import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  const initial = useRef(defaultValue);
  const [iv, setIv] = useState(initial.current);
  const selected = value ?? iv;
  const groupName = name ?? `vf-rating-${id}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const committed = useRef(value);
  useLayoutEffect(() => {
    committed.current = value;
  }, [value]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const document = root.ownerDocument;
    let active = true;
    const radios = () =>
      Array.from(root.querySelectorAll<HTMLInputElement>('[data-vf-rating-item] > input[type="radio"]')).filter(
        (radio) => radio.closest('[data-vf-rating-root]') === root,
      );
    const onReset = (event: Event) => {
      const group = radios();
      if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented) return;
        const group = radios();
        if (!group.length || !group.every((radio) => radio.form === event.target)) return;
        const next = committed.current ?? initial.current;
        if (committed.current === undefined) setIv(next);
        for (const radio of group) radio.checked = Number(radio.value) === next;
      }, 0);
    };
    document.addEventListener('reset', onReset, true);
    return () => {
      active = false;
      document.removeEventListener('reset', onReset, true);
    };
  }, []);
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
        ref: rootRef,
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
