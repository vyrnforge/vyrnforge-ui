import { createElement, forwardRef, useState, type ComponentPropsWithoutRef } from 'react';

type Pair = [number, number];
type Bounds = readonly [number, number, number];

function bounds(min: number, max: number, step: number): Bounds {
  const lower = Number.isFinite(min) ? min : 0;
  const upper = Math.max(lower, Number.isFinite(max) ? max : 100);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  return [lower, upper, increment];
}

function snap(value: number, [min, max, step]: Bounds, fallback: number): number {
  const v = Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));
  const last = Math.floor((max - min) / step + 1e-9);
  const ticks = Math.min(last, Math.max(0, Math.round((v - min) / step)));
  const result = min + ticks * step;
  return Number.isFinite(result) ? Math.min(max, Math.max(min, Number(result.toPrecision(15)))) : v;
}

function normalize(value: readonly [number, number], range: Bounds): Pair {
  const a = snap(value[0], range, range[0]);
  const b = snap(value[1], range, range[1]);
  return [Math.min(a, b), Math.max(a, b)];
}

function request(current: Pair, index: 0 | 1, value: number, range: Bounds): Pair {
  const next = snap(value, range, current[index]);
  return index === 0 ? [Math.min(next, current[1]), current[1]] : [current[0], Math.max(next, current[0])];
}

function equal(a: Pair, b: Pair): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export interface RangeSliderRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  value?: readonly [number, number];
  defaultValue?: readonly [number, number];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  startLabel: string;
  endLabel: string;
  startName?: string;
  endName?: string;
  onValueChange?(v: [number, number]): void;
}

export const RangeSliderRoot = forwardRef<HTMLDivElement, RangeSliderRootProps>(function RangeSliderRoot(
  {
    value,
    defaultValue = [25, 75],
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    startLabel,
    endLabel,
    startName,
    endName,
    onValueChange,
    ...props
  },
  ref,
) {
  const [internal, setInternal] = useState<Pair>([defaultValue[0], defaultValue[1]]);
  const range = bounds(min, max, step);
  const current = normalize(value ?? internal, range);
  function change(index: 0 | 1, input: HTMLInputElement) {
    if (disabled || input.disabled) {
      input.value = String(current[index]);
      return;
    }
    const next = request(current, index, input.valueAsNumber, range);
    if (equal(next, current)) return;
    if (value === undefined) setInternal(next);
    else input.value = String(current[index]);
    onValueChange?.(next);
  }
  return createElement(
    'div',
    { ...props, ref, 'data-vf-range-slider-root': '' },
    createElement('input', {
      type: 'range',
      min: range[0],
      max: current[1],
      step: range[2],
      value: current[0],
      disabled,
      name: startName,
      'aria-label': startLabel,
      'data-vf-range-slider-start': '',
      onChange: (e) => change(0, e.currentTarget),
    }),
    createElement('input', {
      type: 'range',
      min: current[0],
      max: range[1],
      step: range[2],
      value: current[1],
      disabled,
      name: endName,
      'aria-label': endLabel,
      'data-vf-range-slider-end': '',
      onChange: (e) => change(1, e.currentTarget),
    }),
  );
});
