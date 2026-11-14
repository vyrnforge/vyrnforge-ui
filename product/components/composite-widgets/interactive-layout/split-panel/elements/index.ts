const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

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

export class VfSplitPanelElement extends H {
  static readonly observedAttributes = ['size', 'min', 'max'];
  private observer: MutationObserver | null = null;

  connectedCallback() {
    this.setAttribute('data-vf-split-panel-root', '');
    this.addEventListener('keydown', this.onKey);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, { childList: true, subtree: true });
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKey);
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private handle() {
    return Array.from(this.querySelectorAll<HTMLElement>('[data-vf-split-panel-handle]')).find(
      (element) => element.closest('[data-vf-split-panel-root]') === this,
    );
  }

  private range() {
    return bounds(Number(this.getAttribute('min') ?? 10), Number(this.getAttribute('max') ?? 90));
  }

  private current() {
    const [min, max] = this.range();
    return clamp(Number(this.getAttribute('size') ?? 50), min, max);
  }

  private sync() {
    const [min, max] = this.range();
    const size = this.current();
    this.style.setProperty('--vf-split-size', `${size}%`);
    const handle = this.handle();
    if (!handle) return;
    handle.setAttribute('role', 'separator');
    handle.tabIndex = 0;
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(max));
    handle.setAttribute('aria-valuenow', String(size));
  }

  private onKey = (event: KeyboardEvent) => {
    const handle = this.handle();
    if (event.defaultPrevented || !handle || event.target !== handle) return;
    const [min, max] = this.range();
    const current = this.current();
    const next = requestedSize(event, current, min, max, getComputedStyle(handle).direction === 'rtl');
    if (next === null) return;
    event.preventDefault();
    if (next === current) return;
    this.setAttribute('size', String(next));
    this.dispatchEvent(new CustomEvent('vf-size-change', { detail: { size: next }, bubbles: true, composed: true }));
  };
}

export function defineSplitPanelElement(
  tag = 'vf-split-panel',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge SplitPanel registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfSplitPanelElement);
}
