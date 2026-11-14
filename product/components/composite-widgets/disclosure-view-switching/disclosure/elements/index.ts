const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export interface DisclosureOpenChangeDetail {
  open: boolean;
}

export class VfDisclosureElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'disabled'];
  #observer: MutationObserver | null = null;
  #forcedDisabled = new WeakSet<HTMLButtonElement>();

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.addEventListener('click', this.#onClick);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { subtree: true, childList: true, attributes: true, attributeFilter: ['id'] });
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#sync();
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #owns(element: Element): boolean {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent === this) return true;
      if (parent instanceof VfDisclosureElement) return false;
    }
    return false;
  }

  #trigger(): HTMLButtonElement | undefined {
    return Array.from(this.querySelectorAll<HTMLButtonElement>('button[data-vf-disclosure-trigger]')).find((trigger) =>
      this.#owns(trigger),
    );
  }

  #panel(): HTMLElement | undefined {
    return Array.from(this.querySelectorAll<HTMLElement>('[data-vf-disclosure-panel]')).find((panel) => this.#owns(panel));
  }

  #sync(): void {
    if (!this.id) this.id = `vf-disclosure-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    this.setAttribute('data-vf-disclosure-root', '');
    this.toggleAttribute('data-vf-open', this.open);
    this.toggleAttribute('data-vf-disabled', this.disabled);
    const trigger = this.#trigger();
    const panel = this.#panel();
    if (panel) {
      panel.id ||= `${this.id}-panel`;
      panel.hidden = !this.open;
      panel.toggleAttribute('data-vf-open', this.open);
    }
    if (trigger) {
      if (!trigger.hasAttribute('type')) trigger.type = 'button';
      if (this.disabled && !trigger.disabled) {
        this.#forcedDisabled.add(trigger);
        trigger.disabled = true;
      } else if (!this.disabled && this.#forcedDisabled.has(trigger)) {
        this.#forcedDisabled.delete(trigger);
        trigger.disabled = false;
      }
      trigger.setAttribute('aria-expanded', String(this.open));
      if (panel) trigger.setAttribute('aria-controls', panel.id);
      else trigger.removeAttribute('aria-controls');
    }
  }

  #onClick = (event: Event): void => {
    if (event.defaultPrevented || this.disabled || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>('button[data-vf-disclosure-trigger]');
    if (!trigger || !this.#owns(trigger) || trigger.disabled || trigger !== this.#trigger()) return;
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent<DisclosureOpenChangeDetail>('vf-open-change', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

export function defineDisclosureElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Disclosure registration requires a CustomElementRegistry.');
  if (!registry.get('vf-disclosure')) registry.define('vf-disclosure', VfDisclosureElement);
}
