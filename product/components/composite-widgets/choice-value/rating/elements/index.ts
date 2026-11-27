const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
export class VfRatingElement extends H {
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', this.hasAttribute('data-vf-readonly') ? 'img' : 'radiogroup');
    this.setAttribute('data-vf-rating-root', '');
  }
}
export function defineRatingElement(
  tag = 'vf-rating',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Rating registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfRatingElement);
}
