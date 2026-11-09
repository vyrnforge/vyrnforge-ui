const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export interface DisclosureOpenChangeDetail { open: boolean; }
export class VfDisclosureElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'disabled'];
  connectedCallback(): void { if (typeof HTMLElement === 'undefined') return; this.addEventListener('click', this.#onClick); this.#sync(); }
  disconnectedCallback(): void { this.removeEventListener('click', this.#onClick); }
  attributeChangedCallback(): void { if (this.isConnected) this.#sync(); }
  get open(): boolean { return this.hasAttribute('open'); }
  set open(value: boolean) { this.toggleAttribute('open', value); }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  set disabled(value: boolean) { this.toggleAttribute('disabled', value); }
  #trigger(): HTMLButtonElement | null { return this.querySelector<HTMLButtonElement>('[data-vf-disclosure-trigger]'); }
  #panel(): HTMLElement | null { return this.querySelector<HTMLElement>('[data-vf-disclosure-panel]'); }
  #sync(): void { if (!this.id) this.id = `vf-disclosure-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`; this.setAttribute('data-vf-disclosure-root', ''); this.toggleAttribute('data-vf-open', this.open); this.toggleAttribute('data-vf-disabled', this.disabled); const trigger = this.#trigger(); const panel = this.#panel(); if (trigger) { trigger.type ||= 'button'; trigger.disabled = this.disabled; trigger.setAttribute('aria-expanded', String(this.open)); trigger.setAttribute('aria-controls', `${this.id}-panel`); } if (panel) { panel.id ||= `${this.id}-panel`; panel.hidden = !this.open; panel.toggleAttribute('data-vf-open', this.open); } }
  #onClick = (event: Event): void => { if (this.disabled || !(event.target instanceof Element)) return; const trigger = event.target.closest('[data-vf-disclosure-trigger]'); if (!trigger || !this.contains(trigger)) return; this.open = !this.open; this.dispatchEvent(new CustomEvent<DisclosureOpenChangeDetail>('vf-open-change', { detail: { open: this.open }, bubbles: true, composed: true })); };
}
export function defineDisclosureElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Disclosure registration requires a CustomElementRegistry.'); if (!registry.get('vf-disclosure')) registry.define('vf-disclosure', VfDisclosureElement); }
