import {
  Directive,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

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

@Directive({ selector: '[vfRangeSliderRoot]', standalone: true, host: { 'data-vf-range-slider-root': '' } })
export class VfRangeSliderRootDirective {
  readonly value = input<readonly [number, number] | undefined>(undefined);
  readonly defaultValue = input<readonly [number, number]>([25, 75]);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<[number, number]>();
  private internal = signal<Pair | undefined>(undefined);
  private initial: Pair | undefined;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const initial = this.defaultValue();
      this.initial = [initial[0], initial[1]];
      if (this.value() === undefined && this.internal() === undefined) this.internal.set([...this.initial]);
      const root = this.element.nativeElement;
      const document = root.ownerDocument;
      let active = true;
      const onReset = (event: Event) => {
        const start = this.owned('input[data-vf-range-slider-start]');
        const end = this.owned('input[data-vf-range-slider-end]');
        if (!start || !end || !start.form || start.form !== event.target || end.form !== event.target) return;
        setTimeout(() => {
          if (!active || event.defaultPrevented || start.form !== event.target || end.form !== event.target) return;
          const initial = this.initial;
          if (!initial) return;
          const next = normalize(this.value() ?? initial, this.range());
          if (this.value() === undefined) this.internal.set([...initial]);
          this.syncInputs(next);
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      this.destroyRef.onDestroy(() => {
        active = false;
        document.removeEventListener('reset', onReset, true);
      });
    });
  }

  private owned(selector: string): HTMLInputElement | undefined {
    const root = this.element.nativeElement;
    return Array.from(root.querySelectorAll<HTMLInputElement>(selector)).find(
      (element) => element.closest('[data-vf-range-slider-root]') === root,
    );
  }

  private syncInputs(next: Pair): void {
    const start = this.owned('input[data-vf-range-slider-start]');
    const end = this.owned('input[data-vf-range-slider-end]');
    if (start) start.max = String(next[1]);
    if (end) end.min = String(next[0]);
    if (start) start.value = String(next[0]);
    if (end) end.value = String(next[1]);
  }

  private range(): Bounds {
    return bounds(this.min(), this.max(), this.step());
  }
  minimum(): number {
    return this.range()[0];
  }
  maximum(): number {
    return this.range()[1];
  }
  increment(): number {
    return this.range()[2];
  }
  current(): [number, number] {
    return normalize(this.value() ?? this.internal() ?? this.initial ?? this.defaultValue(), this.range());
  }
  set(index: 0 | 1, v: number) {
    if (this.disabled()) return;
    const current = this.current();
    const next = request(current, index, v, this.range());
    if (equal(next, current)) return;
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }
  change(index: 0 | 1, event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    if (!event.defaultPrevented && !target.matches(':disabled')) this.set(index, target.valueAsNumber);
    // Native keyboard events can arrive before Angular's next render. Commit
    // the pair's native constraints together so neither range uses stale bounds.
    this.syncInputs(this.current());
  }
}

@Directive({
  selector: 'input[vfRangeSliderStart]',
  standalone: true,
  host: {
    type: 'range',
    'data-vf-range-slider-start': '',
    '[attr.min]': 'root.minimum()',
    '[attr.max]': 'root.current()[1]',
    '[attr.step]': 'root.increment()',
    '[attr.value]': 'root.current()[0]',
    '[disabled]': 'root.disabled()',
    '(input)': 'root.change(0, $event)',
  },
})
export class VfRangeSliderStartDirective {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  constructor(readonly root: VfRangeSliderRootDirective) {
    afterRenderEffect({
      write: () => {
        this.element.nativeElement.value = String(this.root.current()[0]);
      },
    });
  }
}

@Directive({
  selector: 'input[vfRangeSliderEnd]',
  standalone: true,
  host: {
    type: 'range',
    'data-vf-range-slider-end': '',
    '[attr.min]': 'root.current()[0]',
    '[attr.max]': 'root.maximum()',
    '[attr.step]': 'root.increment()',
    '[attr.value]': 'root.current()[1]',
    '[disabled]': 'root.disabled()',
    '(input)': 'root.change(1, $event)',
  },
})
export class VfRangeSliderEndDirective {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  constructor(readonly root: VfRangeSliderRootDirective) {
    afterRenderEffect({
      write: () => {
        this.element.nativeElement.value = String(this.root.current()[1]);
      },
    });
  }
}
