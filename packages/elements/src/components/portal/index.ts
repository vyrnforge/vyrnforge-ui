const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export class VfPortalElement extends HTMLElementBase {
  static readonly observedAttributes = ['target'];
  #nodes: Node[] | null = null;
  #targetElement: Element | DocumentFragment | null = null;

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    if (!this.#nodes) this.#nodes = Array.from(this.childNodes);
    this.#mount();
  }
  disconnectedCallback(): void {
    if (!this.#nodes) return;
    for (const node of this.#nodes) this.appendChild(node);
  }
  attributeChangedCallback(): void { if (this.isConnected) this.#mount(); }
  get targetElement(): Element | DocumentFragment | null { return this.#targetElement; }
  set targetElement(value: Element | DocumentFragment | null) { this.#targetElement = value; if (this.isConnected) this.#mount(); }
  #resolveTarget(): Element | DocumentFragment | null {
    if (this.#targetElement) return this.#targetElement;
    const selector = this.getAttribute('target');
    return selector ? this.ownerDocument.querySelector(selector) : null;
  }
  #mount(): void {
    if (!this.#nodes) return;
    const target = this.#resolveTarget() ?? this;
    for (const node of this.#nodes) target.appendChild(node);
  }
}

export function definePortalElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Portal registration requires a CustomElementRegistry.');
  if (!registry.get('vf-portal')) registry.define('vf-portal', VfPortalElement);
}
