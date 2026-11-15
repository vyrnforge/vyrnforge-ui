const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
export class VfSearchFieldElement extends H {
  connectedCallback() {
    this.setAttribute('role', 'search');
    this.setAttribute('data-vf-search-field-root', '');
    this.addEventListener('click', this.onClick);
  }
  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }
  private onClick = (e: Event) => {
    if (e.defaultPrevented || !(e.target instanceof Element)) return;
    const button = e.target.closest<HTMLButtonElement>('button[data-vf-search-field-clear]');
    if (!button || button.closest('[data-vf-search-field-root]') !== this || button.matches(':disabled')) return;
    const input = Array.from(this.querySelectorAll<HTMLInputElement>('input[data-vf-search-field-input]')).find(
      (element) => element.closest('[data-vf-search-field-root]') === this,
    );
    if (!input || input.readOnly || input.matches(':disabled') || !input.value) return;
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
}
export function defineSearchFieldElement(
  tag = 'vf-search-field',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge SearchField registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfSearchFieldElement);
}
