const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

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

  private owned<T extends HTMLElement>(selector: string): T | null {
    return Array.from(this.querySelectorAll<T>(selector)).find(element => element.closest('[data-vf-password-field-root]') === this) ?? null;
  }

  private syncToggle() {
    const toggle = this.owned<HTMLElement>('[data-vf-password-field-toggle]');
    const input = this.owned<HTMLInputElement>('[data-vf-password-field-input]');
    if (!toggle || !input) return;

    const visible = input.type === 'text';
    toggle.removeAttribute('aria-pressed');
    if (toggle instanceof HTMLButtonElement) toggle.type = 'button';
    const label = visible ? this.hideLabel : this.showLabel;
    if (label) toggle.setAttribute('aria-label', label);
  }

  private onClick = (event: Event) => {
    const toggle = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-vf-password-field-toggle]') : null;
    const input = this.owned<HTMLInputElement>('[data-vf-password-field-input]');
    if (!toggle || !input || toggle.closest('[data-vf-password-field-root]') !== this || event.defaultPrevented || toggle.matches(':disabled') || input.matches(':disabled')) return;

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
