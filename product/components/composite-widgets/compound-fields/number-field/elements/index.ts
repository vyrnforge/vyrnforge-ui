const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
export class VfNumberFieldElement extends H {
  connectedCallback() {
    this.setAttribute('data-vf-number-field-root', '');
    this.addEventListener('click', this.onClick);
  }
  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }
  private onClick = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(
      'button[data-vf-number-field-increment], button[data-vf-number-field-decrement]',
    );
    if (!button || button.closest('[data-vf-number-field-root]') !== this || button.matches(':disabled')) return;
    const input = Array.from(this.querySelectorAll<HTMLInputElement>('input[data-vf-number-field-input]')).find(
      (candidate) => candidate.closest('[data-vf-number-field-root]') === this,
    );
    if (!input || input.type !== 'number' || input.matches(':disabled') || input.readOnly || input.step === 'any') return;
    const before = input.value;
    if (button.hasAttribute('data-vf-number-field-increment')) input.stepUp();
    else input.stepDown();
    if (input.value !== before) input.dispatchEvent(new Event('input', { bubbles: true }));
  };
}
export function defineNumberFieldElement(
  tag = 'vf-number-field',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge NumberField registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfNumberFieldElement);
}
