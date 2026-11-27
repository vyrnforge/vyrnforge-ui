import { Icon } from '../icon/index.js';
import { defineIcon, type IconDefinition, type IconSize } from '@vyrnforge/web/icon';
import type { CSSProperties, HTMLAttributes } from 'react';
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
function useRatingState({
  value,
  defaultValue = 0,
  name,
  onValueChange,
}: Pick<RatingRootProps, 'value' | 'defaultValue' | 'name' | 'onValueChange'>) {
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
      Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(
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
  return { ctx, rootRef };
}

export function RatingRoot({ value, defaultValue, name, max = 5, getItemLabel, onValueChange, children, 'aria-label': label, 'aria-labelledby': labelledBy }: RatingRootProps) {
  const { ctx, rootRef } = useRatingState({ value, defaultValue, name, onValueChange });
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

/** A rating is an ordered native choice; readOnly displays a score instead. */
export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'role' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onValueChange?(value: number): void;
  name?: string;
  max?: number;
  precision?: 1 | 0.5;
  size?: IconSize;
  icon?: IconDefinition;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  /** Required when clearable is enabled; localize in the application. */
  clearLabel?: string;
  getItemLabel?(value: number): string;
}

// The owned default uses identical outline/fill geometry for fractional paint;
// the optional catalog remains a consumer dependency, not a renderer dependency.
const starPath = 'M12 2.5 14.9 8.6 21.6 9.5 16.8 14.2 17.9 20.9 12 17.7 6.1 20.9 7.2 14.2 2.4 9.5 9.1 8.6Z';
const defaultStar = defineIcon({
  name: 'rating-star',
  outlined: { paths: [{ d: starPath, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }] },
  filled: { paths: [{ d: starPath, fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }] },
});

function RatingArtwork({ icon, size, fill }: { icon: IconDefinition; size: IconSize; fill: number }) {
  return createElement('span', {
    'data-vf-rating-artwork': '', 'aria-hidden': true,
    style: { '--_vf-rating-fill': Math.max(0, Math.min(1, fill)) * 100 + '%' } as CSSProperties,
  }, createElement(Icon, { icon, size, variant: 'outlined' }),
  createElement('span', { 'data-vf-rating-fill': '' }, createElement(Icon, { icon, size, variant: 'filled' })));
}

/** Whole and half-star input; arbitrary fractional non-interactive display. */
export function Rating({
  value, defaultValue = 0, onValueChange, name, max = 5, precision = 1,
  size = 'md', icon = defaultStar, readOnly = false, disabled = false, required = false,
  clearable = false, clearLabel, getItemLabel, ...attrs
}: RatingProps) {
  const count = Number.isFinite(max) ? Math.max(1, Math.min(20, Math.floor(max))) : 5;
  const step = precision === 0.5 ? 0.5 : 1;
  const normalize = (v: number) => {
    const n = Number.isFinite(v) ? Math.max(0, Math.min(count, v)) : 0;
    return readOnly ? n : Math.round(n / step) * step;
  };
  const { ctx, rootRef } = useRatingState({
    value: value === undefined ? undefined : normalize(value),
    defaultValue: normalize(defaultValue), name, onValueChange,
  });
  const selected = normalize(ctx.value);
  const [hover, setHover] = useState<number | null>(null);
  const shown = disabled || readOnly ? selected : hover ?? selected;
  const canClear = clearable && !required && !readOnly;
  if (canClear && !clearLabel?.trim()) throw new Error('Rating clearable requires a localized clearLabel.');
  const group = createElement('div', {
    ...attrs, ref: rootRef, role: readOnly ? 'img' : 'radiogroup',
    'data-vf-rating-root': '', 'data-vf-rating-enhanced': '', 'data-vf-size': size,
    'data-vf-precision': step, 'data-vf-readonly': readOnly ? '' : undefined,
    'data-vf-disabled': disabled ? '' : undefined, 'data-vf-preview': !disabled && !readOnly && hover !== null ? '' : undefined,
    'aria-required': !readOnly && required || undefined,
    'aria-disabled': !readOnly && disabled || undefined,
    onPointerLeave: () => setHover(null), onPointerCancel: () => setHover(null),
  }, ...Array.from({ length: count }, (_, i) => createElement('span', {
    key: i, 'data-vf-rating-star': '',
  }, createElement(RatingArtwork, { icon, size, fill: shown - i }),
  !readOnly ? createElement('span', { 'data-vf-rating-choices': '' },
    ...Array.from({ length: 1 / step }, (_, part) => {
      const score = i + (part + 1) * step;
      return createElement('label', {
        key: score, 'data-vf-rating-option': '',
        onPointerEnter: (event) => { if (event.pointerType === 'mouse' && !disabled) setHover(score); },
      }, createElement('input', {
        type: 'radio', 'data-vf-rating-choice': '', name: ctx.name, value: score,
        checked: selected === score, disabled, required,
        'aria-label': getItemLabel?.(score) ?? String(score),
        'aria-invalid': attrs['aria-invalid'], 'aria-describedby': attrs['aria-describedby'],
        onChange: () => { setHover(null); ctx.set(score); },
      }));
    })) : null)));
  return canClear ? createElement('div', { 'data-vf-rating-with-clear': '' }, group,
    createElement('button', {
      type: 'button', 'data-vf-rating-clear': '', disabled,
      'aria-disabled': selected === 0 || undefined,
      onClick: () => { if (!disabled && selected !== 0) { setHover(null); ctx.set(0); } },
    }, clearLabel)) : group;
}
