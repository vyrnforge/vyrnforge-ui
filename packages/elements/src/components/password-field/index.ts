const HTMLElementBase: typeof HTMLElement =
  globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

export class VfPasswordFieldElement extends HTMLElementBase {
  static get observedAttributes() {
    return ['show-label', 'hide-label'];
  }

  connectedCallback() {
    this.setAttribute('data-vf-password-field-root', '');
    this.addEventListener('click', this.onClick);
    this.syncToggle();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }

  attributeChangedCallback() {
    this.syncToggle();
  }

  get showLabel() {
    return this.getAttribute('show-label') ?? '';
  }

  set showLabel(value: string) {
    this.setAttribute('show-label', value);
  }

  get hideLabel() {
    return this.getAttribute('hide-label') ?? '';
  }

  set hideLabel(value: string) {
    this.setAttribute('hide-label', value);
  }

  private syncToggle() {
    const toggle = this.querySelector<HTMLElement>('[data-vf-password-field-toggle]');
    const input = this.querySelector<HTMLInputElement>('[data-vf-password-field-input]');
    if (!toggle || !input) return;

    const visible = input.type === 'text';
    toggle.setAttribute('aria-pressed', String(visible));
    const label = visible ? this.hideLabel : this.showLabel;
    if (label) toggle.setAttribute('aria-label', label);
  }

  private onClick = (event: Event) => {
    const toggle = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-vf-password-field-toggle]',
    );
    const input = this.querySelector<HTMLInputElement>('[data-vf-password-field-input]');
    if (!toggle || !input || !this.contains(toggle) || event.defaultPrevented) return;

    input.type = input.type === 'password' ? 'text' : 'password';
    this.syncToggle();
  };
}

export function definePasswordFieldElement(
  tag = 'vf-password-field',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) {
    throw new Error('VyrnForge PasswordField registration requires a CustomElementRegistry.');
  }
  if (!registry.get(tag)) registry.define(tag, VfPasswordFieldElement);
}
