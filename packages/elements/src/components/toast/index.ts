const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
const DEFAULT_DURATION = 5000;
type PauseReason = 'pointer' | 'focus';
export interface ToastOpenChangeDetail { open: boolean; }
function normalizedDuration(duration: number): number | null { return Number.isFinite(duration) && duration > 0 ? duration : null; }

export class VfToastElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'default-open', 'duration'];

  #controlledOpen: boolean | undefined;
  #internalOpen = true;
  #initialized = false;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #deadline = 0;
  #remaining = 0;
  #timeoutRequested = false;
  #wasOpen = false;
  #pauseReasons = new Set<PauseReason>();

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    if (!this.#initialized) {
      this.#initialized = true;
      this.#internalOpen = this.hasAttribute('default-open') ? this.getAttribute('default-open') !== 'false' : true;
      if (this.hasAttribute('open')) this.#controlledOpen = true;
    }
    this.setAttribute('data-vf-toast-root', '');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
    this.addEventListener('click', this.#onClick);
    this.addEventListener('pointerenter', this.#onPointerEnter);
    this.addEventListener('pointerleave', this.#onPointerLeave);
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('focusout', this.#onFocusOut);
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('pointerenter', this.#onPointerEnter);
    this.removeEventListener('pointerleave', this.#onPointerLeave);
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('focusout', this.#onFocusOut);
    this.#clearTimer();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === 'open' && this.#initialized) this.#controlledOpen = newValue === null ? false : true;
    if (this.isConnected) this.#sync();
  }

  get open(): boolean | undefined { return this.#controlledOpen; }
  set open(value: boolean | undefined) {
    this.#controlledOpen = value;
    this.#sync();
  }

  get defaultOpen(): boolean { return this.hasAttribute('default-open') ? this.getAttribute('default-open') !== 'false' : true; }
  set defaultOpen(value: boolean) { this.setAttribute('default-open', String(value)); }

  get duration(): number {
    if (!this.hasAttribute('duration')) return DEFAULT_DURATION;
    return Number(this.getAttribute('duration'));
  }
  set duration(value: number) { this.setAttribute('duration', String(value)); }

  #committedOpen(): boolean { return this.#controlledOpen ?? this.#internalOpen; }
  #clearTimer(): void { if (this.#timer !== undefined) clearTimeout(this.#timer); this.#timer = undefined; }

  #requestClose(): void {
    if (this.#controlledOpen === undefined) this.#internalOpen = false;
    this.dispatchEvent(new CustomEvent<ToastOpenChangeDetail>('vf-open-change', {
      detail: { open: false }, bubbles: true, composed: true,
    }));
    this.#sync();
  }

  #expire(): void {
    this.#clearTimer();
    this.#remaining = 0;
    if (this.#timeoutRequested) return;
    this.#timeoutRequested = true;
    this.#requestClose();
  }

  #sync(): void {
    if (!this.#initialized || !this.isConnected) return;
    this.#clearTimer();
    const open = this.#committedOpen();
    this.hidden = !open;
    this.toggleAttribute('data-vf-open', open);
    if (!open) {
      this.#wasOpen = false;
      this.#timeoutRequested = false;
      this.#remaining = 0;
      this.#pauseReasons.clear();
      return;
    }
    if (!this.#wasOpen) {
      this.#wasOpen = true;
      this.#timeoutRequested = false;
      this.#pauseReasons.clear();
    }
    if (this.#timeoutRequested) return;
    const duration = normalizedDuration(this.duration);
    this.#remaining = duration ?? 0;
    if (duration !== null && this.#pauseReasons.size === 0) this.#armRemaining();
  }

  #armRemaining(): void {
    if (!this.#committedOpen() || this.#timeoutRequested || this.#pauseReasons.size > 0) return;
    if (this.#remaining <= 0) { this.#expire(); return; }
    this.#clearTimer();
    this.#deadline = Date.now() + this.#remaining;
    this.#timer = setTimeout(() => this.#expire(), this.#remaining);
  }

  #pause(reason: PauseReason): void {
    if (this.#pauseReasons.has(reason)) return;
    const running = this.#pauseReasons.size === 0 && this.#timer !== undefined;
    this.#pauseReasons.add(reason);
    if (!running) return;
    this.#remaining = Math.max(0, this.#deadline - Date.now());
    this.#clearTimer();
  }

  #resume(reason: PauseReason): void {
    if (!this.#pauseReasons.delete(reason) || this.#pauseReasons.size > 0) return;
    this.#armRemaining();
  }

  #onClick = (event: Event): void => {
    if (!(event.target instanceof Element) || event.defaultPrevented) return;
    const close = event.target.closest('[data-vf-toast-close]');
    if (close && this.contains(close) && close.closest('[data-vf-toast-root]') === this) this.#requestClose();
  };
  #onPointerEnter = (): void => this.#pause('pointer');
  #onPointerLeave = (): void => this.#resume('pointer');
  #onFocusIn = (event: FocusEvent): void => { if (!this.contains(event.relatedTarget as Node | null)) this.#pause('focus'); };
  #onFocusOut = (event: FocusEvent): void => { if (!this.contains(event.relatedTarget as Node | null)) this.#resume('focus'); };
}

export class VfToastViewportElement extends HTMLElementBase {
  connectedCallback(): void {
    this.setAttribute('aria-live', this.getAttribute('aria-live') ?? 'polite');
    this.setAttribute('aria-relevant', this.getAttribute('aria-relevant') ?? 'additions text');
    this.setAttribute('data-vf-toast-viewport', '');
    this.addEventListener('click', this.#onClick);
  }
  disconnectedCallback(): void { this.removeEventListener('click', this.#onClick); }
  #onClick = (event: Event): void => {
    if (!(event.target instanceof Element) || event.defaultPrevented) return;
    const close = event.target.closest('[data-vf-toast-close]');
    if (!close || !this.contains(close)) return;
    const root = close.closest<HTMLElement>('[data-vf-toast-root]');
    if (!root || root instanceof VfToastElement) return;
    root.hidden = true;
    root.removeAttribute('data-vf-open');
    root.dispatchEvent(new CustomEvent<ToastOpenChangeDetail>('vf-open-change', {
      detail: { open: false }, bubbles: true, composed: true,
    }));
  };
}

export function defineToastElement(tag = 'vf-toast', registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Toast registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfToastElement);
}

export function defineToastViewportElement(tag = 'vf-toast-viewport', registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Toast registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfToastViewportElement);
}
