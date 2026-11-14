import { Directive, input, output, signal } from '@angular/core';

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

@Directive({
  selector: '[vfSplitPanelRoot]',
  standalone: true,
  host: { 'data-vf-split-panel-root': '', '[style.--vf-split-size]': 'current()+"%"' },
})
export class VfSplitPanelRootDirective {
  readonly size = input<number | undefined>(undefined);
  readonly defaultSize = input(50);
  readonly min = input(10);
  readonly max = input(90);
  readonly sizeChange = output<number>();
  private iv = signal<number | undefined>(undefined);
  current() {
    const [min, max] = bounds(this.min(), this.max());
    return clamp(this.size() ?? this.iv() ?? this.defaultSize(), min, max);
  }
  set(v: number) {
    const [min, max] = bounds(this.min(), this.max());
    const n = clamp(v, min, max);
    if (n === this.current()) return;
    if (this.size() === undefined) this.iv.set(n);
    this.sizeChange.emit(n);
  }
}
@Directive({ selector: '[vfSplitPanelPane]', standalone: true, host: { 'data-vf-split-panel-pane': '' } })
export class VfSplitPanelPaneDirective {}
@Directive({
  selector: '[vfSplitPanelResizeHandle]',
  standalone: true,
  host: {
    role: 'separator',
    tabindex: '0',
    'aria-orientation': 'vertical',
    'data-vf-split-panel-handle': '',
    '[attr.aria-valuemin]': 'minimum()',
    '[attr.aria-valuemax]': 'maximum()',
    '[attr.aria-valuenow]': 'root.current()',
    '(keydown)': 'key($event)',
  },
})
export class VfSplitPanelResizeHandleDirective {
  constructor(readonly root: VfSplitPanelRootDirective) {}
  minimum() {
    return bounds(this.root.min(), this.root.max())[0];
  }
  maximum() {
    return bounds(this.root.min(), this.root.max())[1];
  }
  key(e: KeyboardEvent) {
    if (e.defaultPrevented || !(e.currentTarget instanceof HTMLElement)) return;
    const next = requestedSize(
      e,
      this.root.current(),
      this.minimum(),
      this.maximum(),
      getComputedStyle(e.currentTarget).direction === 'rtl',
    );
    if (next === null) return;
    e.preventDefault();
    this.root.set(next);
  }
}
