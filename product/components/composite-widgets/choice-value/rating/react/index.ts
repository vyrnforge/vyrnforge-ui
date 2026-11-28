import { Icon } from '../icon/index.js';
import type { IconDefinition, IconSize } from '@vyrnforge/web/icon';
import { ratingStar, ratingMaximum, ratingValue, clearRatingOnRepeat, connectRatingReset } from '@vyrnforge/web/rating';
import type { CSSProperties, HTMLAttributes, MouseEvent } from 'react';
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
function useRatingState(
  {
    value,
    defaultValue = 0,
    name,
    onValueChange,
  }: {
    value: number | undefined;
    defaultValue: number | undefined;
    name: string | undefined;
    onValueChange: ((v: number) => void) | undefined;
  },
  normalize = (value: number) => value,
) {
  const id = useId();
  const initial = useRef(defaultValue);
  const [iv, setIv] = useState(initial.current);
  const selected = normalize(value ?? iv);
  const groupName = name ?? `vf-rating-${id}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const committed = useRef(value);
  const normalizer = useRef(normalize);
  useLayoutEffect(() => {
    committed.current = value;
    normalizer.current = normalize;
  }, [value, normalize]);
  useEffect(
    () =>
      connectRatingReset(
        () => rootRef.current,
        () => {
          const next = normalizer.current(committed.current ?? initial.current);
          if (committed.current === undefined) setIv(next);
          return next;
        },
      ),
    [],
  );
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

export function RatingRoot({
  value,
  defaultValue,
  name,
  max = 5,
  getItemLabel,
  onValueChange,
  children,
  'aria-label': label,
  'aria-labelledby': labelledBy,
}: RatingRootProps) {
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
export interface RatingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'role' | 'defaultValue'
> {
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
  /** Activating the selected choice again clears optional ratings. */
  clearable?: boolean;
  getItemLabel?(value: number): string;
}

function RatingArtwork({ icon, size, fill }: { icon: IconDefinition; size: IconSize; fill?: number | undefined }) {
  return createElement(
    'span',
    {
      'data-vf-rating-artwork': '',
      'aria-hidden': true,
      style:
        fill === undefined
          ? undefined
          : ({
              '--_vf-rating-fill': Math.round(Math.max(0, Math.min(1, fill)) * 1000000) / 10000 + '%',
            } as CSSProperties),
    },
    createElement(Icon, { icon, size, variant: 'outlined' }),
    createElement('span', { 'data-vf-rating-fill': '' }, createElement(Icon, { icon, size, variant: 'filled' })),
  );
}

/** Whole and half-star input; arbitrary fractional non-interactive display. */
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  name,
  max = 5,
  precision = 1,
  size = 'md',
  icon = ratingStar,
  readOnly = false,
  disabled = false,
  required = false,
  clearable = false,
  getItemLabel,
  ...attrs
}: RatingProps) {
  const count = ratingMaximum(max);
  const step = precision === 0.5 ? 0.5 : 1;
  const normalize = (v: number) => ratingValue(v, count, step, readOnly);
  const { ctx, rootRef } = useRatingState({ value, defaultValue, name, onValueChange }, normalize);
  const selected = ctx.value;
  const canClear = clearable && !required && !readOnly;
  return createElement(
    'div',
    {
      ...attrs,
      ref: rootRef,
      role: readOnly ? 'img' : 'radiogroup',
      'data-vf-rating-root': '',
      'data-vf-rating-enhanced': '',
      'data-vf-size': size,
      'data-vf-precision': step,
      'data-vf-readonly': readOnly ? '' : undefined,
      'data-vf-disabled': disabled ? '' : undefined,
      'aria-required': (!readOnly && required) || undefined,
      'aria-disabled': (!readOnly && disabled) || undefined,
    },
    ...Array.from({ length: count }, (_, i) =>
      createElement(
        'span',
        {
          key: i,
          'data-vf-rating-star': '',
        },
        createElement(RatingArtwork, { icon, size, fill: readOnly ? selected - i : undefined }),
        !readOnly
          ? createElement(
              'span',
              { 'data-vf-rating-choices': '' },
              ...Array.from({ length: 1 / step }, (_, part) => {
                const score = i + (part + 1) * step;
                return createElement(
                  'label',
                  {
                    key: score,
                    'data-vf-rating-option': '',
                  },
                  createElement('input', {
                    type: 'radio',
                    'data-vf-rating-choice': '',
                    name: ctx.name,
                    value: score,
                    checked: selected === score,
                    disabled,
                    required,
                    'aria-label': getItemLabel?.(score) ?? String(score),
                    'aria-invalid': attrs['aria-invalid'],
                    'aria-describedby': attrs['aria-describedby'],
                    onClick: (event: MouseEvent<HTMLInputElement>) => {
                      if (canClear) clearRatingOnRepeat(event.currentTarget, selected, () => ctx.set(0));
                    },
                    onChange: () => ctx.set(score),
                  }),
                );
              }),
            )
          : null,
      ),
    ),
  );

}
