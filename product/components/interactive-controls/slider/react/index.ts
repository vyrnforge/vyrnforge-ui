import { createElement, forwardRef, useEffect, useRef, useState } from 'react';
import type { CSSProperties, InputHTMLAttributes } from 'react';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'required' | 'readOnly'> {
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  marks?: boolean | readonly { value: number; label?: string }[];
  valueLabelDisplay?: 'off' | 'auto' | 'always';
  formatValue?: (value: number) => string;
}

type Snapshot = { value: number; min: number; max: number; step: string };

function read(input: HTMLInputElement): Snapshot {
  const min = input.min.trim() && Number.isFinite(Number(input.min)) ? Number(input.min) : 0;
  const max = input.max.trim() && Number.isFinite(Number(input.max)) ? Number(input.max) : 100;
  return { value: input.valueAsNumber, min, max: Math.max(min, max), step: input.step };
}

function fraction(value: number, min: number, max: number) {
  return max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider({
  size = 'md', orientation = 'horizontal', marks = false, valueLabelDisplay = 'off',
  formatValue, onChange, onInput, style, ...props
}, ref) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const sync = () => {
    if (!inputRef.current) return;
    const next = read(inputRef.current);
    if (!Number.isFinite(next.value)) return;
    setSnapshot(previous => previous && previous.value === next.value && previous.min === next.min &&
      previous.max === next.max && previous.step === next.step ? previous : next);
  };
  // Read the browser-sanitized value after each React commit. Do not replace native state.
  useEffect(sync);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = (event: Event) => {
      if (event.target !== input.form) return;
      clearTimeout(timer);
      timer = setTimeout(() => { if (!event.defaultPrevented) sync(); }, 0);
    };
    input.ownerDocument.addEventListener('reset', reset, true);
    return () => { clearTimeout(timer); input.ownerDocument.removeEventListener('reset', reset, true); };
  }, []);
  const position = snapshot ? fraction(snapshot.value, snapshot.min, snapshot.max) : 0;
  const progressStyle = { ...style, ...(snapshot ? { '--_vf-slider-progress': position } : {}) } as CSSProperties;
  const label = snapshot ? (formatValue?.(snapshot.value) ?? String(snapshot.value)) : undefined;
  const input = createElement('input', {
    ...props, type: 'range', 'data-vf-slider': '', 'data-vf-size': size,
    'data-vf-orientation': orientation,
    'data-vf-slider-enhanced': snapshot ? '' : undefined,
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
    'aria-valuetext': props['aria-valuetext'] ?? (formatValue ? label : undefined),
    style: progressStyle,
    ref: (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    onInput: (event) => { onInput?.(event); sync(); },
    onChange: (event) => { onChange?.(event); sync(); },
  });
  if (!marks && valueLabelDisplay === 'off') return input;
  let ticks: readonly { value: number; label?: string }[] = [];
  if (snapshot && marks === true && snapshot.step !== 'any') {
    const step = Number(snapshot.step || 1);
    const count = Math.floor((snapshot.max - snapshot.min) / step + 1e-9) + 1;
    // Avoid generating thousands of overlapping tick elements.
    if (step > 0 && count <= 50) ticks = Array.from({ length: count }, (_, i) => ({
      value: Number((snapshot.min + i * step).toPrecision(15)),
    }));
  } else if (snapshot && Array.isArray(marks)) {
    ticks = marks.filter(mark => Number.isFinite(mark.value) && mark.value >= snapshot.min && mark.value <= snapshot.max);
  }
  return createElement('span', {
    'data-vf-slider-presentation': '', 'data-vf-size': size, 'data-vf-orientation': orientation,
    'data-vf-value-label': valueLabelDisplay, 'data-vf-slider-marks': marks ? '' : undefined,
    style: { '--_vf-slider-progress': position } as CSSProperties,
  }, input, snapshot && ticks.length ? createElement('span', { 'data-vf-slider-ticks': '', 'aria-hidden': true },
    ...ticks.map((mark, index) => createElement('span', {
      key: index, 'data-vf-slider-mark': '',
      style: { '--_vf-slider-position': fraction(mark.value, snapshot.min, snapshot.max) } as CSSProperties,
    }, createElement('span', { 'data-vf-slider-mark-dot': '' }),
    mark.label === undefined ? null : createElement('span', { 'data-vf-slider-mark-label': '' }, mark.label)))) : null,
    snapshot && valueLabelDisplay !== 'off' ? createElement('span', {
      'data-vf-slider-value': '', 'aria-hidden': true,
    }, label) : null);
});
