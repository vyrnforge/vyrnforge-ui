const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

export class VfOtpFieldElement extends HTMLElementBase {
  static get observedAttributes() {
    return ['length'];
  }
  connectedCallback() {
    this.setAttribute('data-vf-otp-field-root', '');
    this.configureInput();
    this.addEventListener('input', this.onInput);
  }
  disconnectedCallback() {
    this.removeEventListener('input', this.onInput);
  }
  attributeChangedCallback() {
    if (this.isConnected) this.configureInput();
  }
  get value() {
    return this.input?.value ?? '';
  }
  set value(value: string) {
    const input = this.input;
    if (input) input.value = value;
  }
  private owns(node: Element) {
    return node.closest(`[data-vf-otp-field-root],${this.localName}`) === this;
  }
  private get input() {
    return Array.from(this.querySelectorAll<HTMLInputElement>('input[data-vf-otp-field-input]')).find(
      (input) => this.owns(input),
    );
  }
  private configureInput() {
    const input = this.input;
    if (!input) return;
    input.type = 'text';
    input.setAttribute('data-vf-input', '');
    if (!input.hasAttribute('inputmode')) input.inputMode = 'numeric';
    if (!input.hasAttribute('autocomplete')) input.autocomplete = 'one-time-code';
    const length = this.getAttribute('length');
    if (length !== null && Number.isInteger(Number(length)) && Number(length) > 0) input.maxLength = Number(length);
    else if (!input.hasAttribute('maxlength')) input.maxLength = 6;
  }
  private onInput = (event: Event) => {
    const input = this.input;
    if (!input || event.target !== input || event.defaultPrevented || input.matches(':disabled') || input.readOnly) return;
    this.dispatchEvent(new CustomEvent('valuechange', { detail: { value: input.value }, bubbles: true }));
  };
}
export function defineOtpFieldElement(
  tag = 'vf-otp-field',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge OtpField registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfOtpFieldElement);
}
