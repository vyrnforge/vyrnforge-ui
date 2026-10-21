const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export class VfSurfaceElement extends HTMLElementBase {
  connectedCallback(): void {
    this.setAttribute('data-vf-surface', '');
  }
}

export function defineSurfaceElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Surface registration requires a CustomElementRegistry.');
  if (!registry.get('vf-surface')) registry.define('vf-surface', VfSurfaceElement);
}
