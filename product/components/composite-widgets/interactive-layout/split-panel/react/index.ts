import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
function bounds(min: number, max: number): [number, number] {
  const lower = Math.max(0, Math.min(100, Number.isFinite(min) ? min : 10));
  return [lower, Math.max(lower, Math.min(100, Number.isFinite(max) ? max : 90))];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 50));
}

function requestedSize(event: KeyboardEvent, current: number, min: number, max: number, rtl: boolean): number | null {
  if (event.key === 'Home') return min;
  if (event.key === 'End') return max;
  const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!delta) return null;
  return clamp(current + delta * (rtl ? -1 : 1) * (event.shiftKey ? 10 : 1), min, max);
}

interface Ctx {
  size: number;
  set(v: number): void;
  min: number;
  max: number;
}
const C = createContext<Ctx | null>(null);
function useS() {
  const v = useContext(C);
  if (!v) throw new Error('SplitPanel parts must be inside root.');
  return v;
}
export interface SplitPanelRootProps extends ComponentPropsWithoutRef<'div'> {
  size?: number;
  defaultSize?: number;
  min?: number;
  max?: number;
  onSizeChange?(v: number): void;
  children?: ReactNode;
}
export const SplitPanelRoot = forwardRef<HTMLDivElement, SplitPanelRootProps>(function SplitPanelRoot(
  { size, defaultSize = 50, min = 10, max = 90, onSizeChange, children, ...props },
  ref,
) {
  const [iv, setIv] = useState(defaultSize);
  const [lower, upper] = bounds(min, max);
  const current = clamp(size ?? iv, lower, upper);
  const set = (v: number) => {
    const next = clamp(v, lower, upper);
    if (next === current) return;
    if (size === undefined) setIv(next);
    onSizeChange?.(next);
  };
  return createElement(
    C.Provider,
    { value: { size: current, set, min: lower, max: upper } },
    createElement(
      'div',
      {
        ...props,
        ref,
        'data-vf-split-panel-root': '',
        style: { ...props.style, '--vf-split-size': `${current}%` } as React.CSSProperties,
      },
      children,
    ),
  );
});
export const SplitPanelPane = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function SplitPanelPane(props, ref) {
    return createElement('div', { ...props, ref, 'data-vf-split-panel-pane': '' });
  },
);
export const SplitPanelResizeHandle = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function SplitPanelResizeHandle(props, ref) {
    const s = useS();
    return createElement('div', {
      ...props,
      ref,
      role: 'separator',
      tabIndex: props.tabIndex ?? 0,
      'aria-orientation': 'vertical',
      'aria-valuemin': s.min,
      'aria-valuemax': s.max,
      'aria-valuenow': s.size,
      'data-vf-split-panel-handle': '',
      onKeyDown: (e) => {
        props.onKeyDown?.(e);
        if (e.defaultPrevented) return;
        const next = requestedSize(
          e.nativeEvent,
          s.size,
          s.min,
          s.max,
          getComputedStyle(e.currentTarget).direction === 'rtl',
        );
        if (next === null) return;
        e.preventDefault();
        s.set(next);
      },
    });
  },
);
