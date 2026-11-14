const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

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

function readPair(value: string | null): Pair | undefined {
  if (value === null) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
      return [parsed[0], parsed[1]];
    }
  } catch {
    // An invalid authored pair is ignored.
  }
  return undefined;
}

export class VfRangeSliderElement extends H {
  static readonly observedAttributes = ['min', 'max', 'step', 'value', 'default-value', 'disabled'];
  private internal: Pair | undefined;
  private observer: MutationObserver | null = null;
  private authoredDisabled = new WeakMap<HTMLInputElement, boolean>();

  connectedCallback() {
    this.setAttribute('data-vf-range-slider-root', '');
    this.addEventListener('input', this.onInput);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, { childList: true, subtree: true });
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('input', this.onInput);
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private inputs(): [HTMLInputElement | undefined, HTMLInputElement | undefined] {
    const owned = (selector: string) =>
      Array.from(this.querySelectorAll<HTMLInputElement>(selector)).find(
        (element) => element.closest('[data-vf-range-slider-root]') === this,
      );
    return [owned('input[data-vf-range-slider-start]'), owned('input[data-vf-range-slider-end]')];
  }

  private range(): Bounds {
    return bounds(
      Number(this.getAttribute('min') ?? 0),
      Number(this.getAttribute('max') ?? 100),
      Number(this.getAttribute('step') ?? 1),
    );
  }

  get value(): [number, number] {
    return normalize(readPair(this.getAttribute('value')) ?? this.internal ?? [25, 75], this.range());
  }

  set value(value: readonly [number, number]) {
    this.setAttribute('value', JSON.stringify(value));
  }

  private sync() {
    const [start, end] = this.inputs();
    if (!start || !end) return;
    if (!this.internal) {
      this.internal = readPair(this.getAttribute('default-value')) ?? [
        Number(start.getAttribute('value') ?? 25),
        Number(end.getAttribute('value') ?? 75),
      ];
    }
    const [min, max, step] = this.range();
    const [lower, upper] = this.value;
    for (const input of [start, end]) {
      if (!this.authoredDisabled.has(input)) this.authoredDisabled.set(input, input.disabled);
      input.type = 'range';
      input.step = String(step);
      input.disabled = this.hasAttribute('disabled') || (this.authoredDisabled.get(input) ?? false);
    }
    start.min = String(min);
    start.max = String(upper);
    end.min = String(lower);
    end.max = String(max);
    start.value = String(lower);
    end.value = String(upper);
  }

  private onInput = (event: Event) => {
    const [start, end] = this.inputs();
    const target = event.target;
    if (!start || !end || !(target instanceof HTMLInputElement) || (target !== start && target !== end)) return;
    const current = this.value;
    const index = target === start ? 0 : 1;
    if (target.disabled || this.hasAttribute('disabled') || event.defaultPrevented) {
      this.sync();
      return;
    }
    const next = request(current, index, target.valueAsNumber, this.range());
    if (equal(next, current)) {
      this.sync();
      return;
    }
    if (!this.hasAttribute('value')) this.internal = next;
    this.sync();
    this.dispatchEvent(new CustomEvent('vf-value-change', { detail: { value: next }, bubbles: true, composed: true }));
  };
}

export function defineRangeSliderElement(
  tag = 'vf-range-slider',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge RangeSlider registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfRangeSliderElement);
}
