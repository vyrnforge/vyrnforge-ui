const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export interface ToastOpenChangeDetail {
  open: boolean;
}

function normalizeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function parseBooleanAttribute(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return value.toLowerCase() !== 'false';
}

export class VfToastViewportElement extends HTMLElementBase {
  connectedCallback(): void {
    this.setAttribute('aria-live', this.getAttribute('aria-live') ?? 'polite');
    this.setAttribute('aria-relevant', this.getAttribute('aria-relevant') ?? 'additions text');
    this.setAttribute('data-vf-toast-viewport', '');
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
  }

  #onClick = (event: Event): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const close = event.target.closest('[data-vf-toast-close]');
    if (!close || !this.contains(close)) return;
    const root = close.closest<HTMLElement>('[data-vf-toast-root]');
    if (!root || !this.contains(root) || root instanceof VfToastRootElement) return;
    root.remove();
  };
}

export class VfToastRootElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'default-open', 'duration'];

  #controlled = false;
  #controlledOpen = true;
  #internalOpen = true;
  #initialized = false;
  #reflectingOpen = false;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #deadline = 0;
  #remaining = 5000;
  #pauseReasons = new Set<'pointer' | 'focus'>();
  #timeoutRequested = false;
  #previousOpen = false;
  #previousDuration = -1;

  connectedCallback(): void {
    this.setAttribute('data-vf-toast-root', '');
    if (!this.#initialized) {
      if (this.hasAttribute('open')) {
        this.#controlled = true;
        this.#controlledOpen = parseBooleanAttribute(this.getAttribute('open'), true);
      }
      this.#internalOpen = parseBooleanAttribute(this.getAttribute('default-open'), true);
      this.#initialized = true;
    }
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
    this.#pauseReasons.clear();
    this.#previousOpen = false;
    this.#previousDuration = -1;
    this.#timeoutRequested = false;
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (!this.#initialized) return;
    if (name === 'open' && !this.#reflectingOpen) {
      this.#controlled = true;
      this.#controlledOpen = parseBooleanAttribute(newValue, false);
    }
    if (this.isConnected) this.#sync();
  }

  get open(): boolean | undefined {
    return this.#controlled ? this.#controlledOpen : undefined;
  }

  set open(value: boolean | undefined) {
    if (value === undefined) {
      this.#controlled = false;
      this.#reflectOpenAttribute(false);
    } else {
      this.#controlled = true;
      this.#controlledOpen = value;
      this.#reflectOpenAttribute(value);
    }
    if (this.isConnected) this.#sync();
  }

  get defaultOpen(): boolean {
    return parseBooleanAttribute(this.getAttribute('default-open'), true);
  }

  set defaultOpen(value: boolean) {
    this.setAttribute('default-open', String(value));
  }

  get duration(): number {
    const value = this.getAttribute('duration');
    return value === null ? 5000 : Number(value);
  }

  set duration(value: number) {
    this.setAttribute('duration', String(value));
  }

  get desiredOpen(): boolean {
    return this.#controlled ? this.#controlledOpen : this.#internalOpen;
  }

  requestClose(): void {
    if (!this.#controlled) this.#internalOpen = false;
    this.dispatchEvent(new CustomEvent<ToastOpenChangeDetail>('vf-open-change', {
      detail: { open: false },
      bubbles: true,
      composed: true,
    }));
    this.#sync();
  }

  #reflectOpenAttribute(value: boolean): void {
    this.#reflectingOpen = true;
    this.toggleAttribute('open', value);
    this.#reflectingOpen = false;
  }

  #clearTimer(): void {
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
    this.#deadline = 0;
  }

  #armTimer(delay: number): void {
    this.#clearTimer();
    if (delay <= 0 || this.#timeoutRequested || this.#pauseReasons.size > 0) return;
    this.#remaining = delay;
    this.#deadline = Date.now() + delay;
    this.#timer = setTimeout(() => {
      this.#timer = null;
      this.#deadline = 0;
      this.#remaining = 0;
      this.#timeoutRequested = true;
      this.requestClose();
    }, delay);
  }

  #sync(): void {
    const open = this.desiredOpen;
    const duration = normalizeDuration(this.duration);
    this.hidden = !open;
    const opening = open && !this.#previousOpen;
    const durationChanged = duration !== this.#previousDuration;
    this.#previousOpen = open;
    this.#previousDuration = duration;

    if (!open) {
      this.#clearTimer();
      this.#remaining = duration;
      this.#timeoutRequested = false;
      this.#pauseReasons.clear();
      return;
    }

    if (opening) this.#timeoutRequested = false;
    if (opening || durationChanged) {
      this.#clearTimer();
      this.#remaining = duration;
      if (!this.#timeoutRequested && this.#pauseReasons.size === 0) this.#armTimer(duration);
    }
  }

  #pauseTimer(reason: 'pointer' | 'focus'): void {
    if (!this.desiredOpen || this.#timeoutRequested || this.#pauseReasons.has(reason)) return;
    const wasActive = this.#pauseReasons.size === 0;
    this.#pauseReasons.add(reason);
    if (wasActive && this.#timer !== null) {
      this.#remaining = Math.max(0, this.#deadline - Date.now());
      this.#clearTimer();
    }
  }

  #resumeTimer(reason: 'pointer' | 'focus'): void {
    this.#pauseReasons.delete(reason);
    if (this.#pauseReasons.size > 0 || !this.desiredOpen || this.#timeoutRequested) return;
    if (this.#remaining <= 0) {
      this.#timeoutRequested = true;
      this.requestClose();
      return;
    }
    this.#armTimer(this.#remaining);
  }

  #onClick = (event: Event): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const close = event.target.closest('[data-vf-toast-close]');
    if (!close) return;
    const owner = close.closest('[data-vf-toast-root]');
    if (owner !== this) return;
    this.requestClose();
  };

  #onPointerEnter = (): void => this.#pauseTimer('pointer');
  #onPointerLeave = (): void => this.#resumeTimer('pointer');
  #onFocusIn = (event: FocusEvent): void => {
    if (!this.contains(event.relatedTarget as Node | null)) this.#pauseTimer('focus');
  };
  #onFocusOut = (event: FocusEvent): void => {
    if (!this.contains(event.relatedTarget as Node | null)) this.#resumeTimer('focus');
  };
}

export function defineToastViewportElement(
  tag = 'vf-toast-viewport',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge Toast registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfToastViewportElement);
}

export function defineToastRootElement(
  tag = 'vf-toast',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge Toast registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfToastRootElement);
}
