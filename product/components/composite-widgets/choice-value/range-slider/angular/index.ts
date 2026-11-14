import {
  Directive,
  ElementRef,
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
    return normalize(this.value() ?? this.internal() ?? this.defaultValue(), this.range());
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
    if (!target.disabled) this.set(index, target.valueAsNumber);
    target.value = String(this.current()[index]);
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
