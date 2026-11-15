const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
const colorSelector = 'input[data-vf-color-picker-input]';
const textSelector = 'input[data-vf-color-picker-text]';
export class VfColorPickerElement extends H {
  private resetDocument: Document | null = null;
  private connectionRevision = 0;
  connectedCallback() {
    this.setAttribute('data-vf-color-picker-root', '');
    this.addEventListener('input', this.onInput);
    this.connectionRevision++;
    this.resetDocument = this.ownerDocument;
    this.resetDocument.addEventListener('reset', this.onReset, true);
    this.syncFromNative();
  }
  disconnectedCallback() {
    this.removeEventListener('input', this.onInput);
    this.connectionRevision++;
    this.resetDocument?.removeEventListener('reset', this.onReset, true);
    this.resetDocument = null;
  }
  private owns(node: Element) {
    return node.closest(`[data-vf-color-picker-root],${this.localName}`) === this;
  }
  private owned<T extends HTMLElement>(selector: string): T[] {
    return Array.from(this.querySelectorAll<T>(selector)).filter((node) => this.owns(node));
  }
  private syncFromNative() {
    const input = this.owned<HTMLInputElement>(colorSelector)[0];
    if (input?.type === 'color') this.sync(input.value);
  }
  private sync(value: string) {
    this.owned<HTMLInputElement>(colorSelector + ',' + textSelector).forEach((input) => {
      if (input.value !== value) input.value = value;
    });
    this.owned<HTMLElement>('[data-vf-color-picker-swatch]').forEach((swatch) => {
      swatch.style.backgroundColor = value;
    });
  }
  private onReset = (event: Event) => {
    const group = this.owned<HTMLInputElement>(colorSelector + ',' + textSelector);
    if (!group.length || !group.every((input) => input.form && input.form === event.target)) return;
    const revision = this.connectionRevision;
    setTimeout(() => {
      if (!this.isConnected || revision !== this.connectionRevision || event.defaultPrevented) return;
      const group = this.owned<HTMLInputElement>(colorSelector + ',' + textSelector);
      if (!group.length || !group.every((input) => input.form === event.target)) return;
      this.syncFromNative();
    }, 0);
  };
  private onInput = (event: Event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !this.owns(input) || event.defaultPrevented) return;
    if (!input.matches(colorSelector + ',' + textSelector) || input.matches(':disabled') || input.readOnly) return;
    const native = this.owned<HTMLInputElement>(colorSelector)[0];
    if (!native || native.type !== 'color' || native.matches(':disabled')) return;
    if (!/^#[0-9a-f]{6}$/i.test(input.value)) return;
    this.sync(input.value.toLowerCase());
  };
}
export function defineColorPickerElement(
  tag = 'vf-color-picker',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge ColorPicker registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfColorPickerElement);
}
