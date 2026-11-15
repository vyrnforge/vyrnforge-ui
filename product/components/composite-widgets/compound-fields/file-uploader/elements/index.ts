const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

function acceptDrop(input: HTMLInputElement, files: FileList): void {
  if (files.length === 0 || input.matches(':disabled')) return;
  if (input.multiple || files.length === 1) input.files = files;
  else {
    const transfer = new DataTransfer();
    const first = files.item(0);
    if (!first) return;
    transfer.items.add(first);
    input.files = transfer.files;
  }
  // A drop is a native file acquisition request, not an independent file store.
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
export class VfFileUploaderElement extends H {
  private observer: MutationObserver | null = null;
  private document: Document | null = null;
  private derivedDisabled = new Set<HTMLButtonElement>();
  private active = false;
  connectedCallback() {
    this.setAttribute('data-vf-file-uploader-root', '');
    this.active = true;
    this.document = this.ownerDocument;
    this.addEventListener('click', this.onClick);
    this.addEventListener('change', this.onChange);
    this.addEventListener('drop', this.onDrop);
    this.addEventListener('dragover', this.onDragOver);
    this.document.addEventListener('reset', this.onReset, true);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
    for (let ancestor = this.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'FIELDSET') this.observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
    }
    this.sync();
  }
  disconnectedCallback() {
    this.active = false;
    this.observer?.disconnect();
    this.observer = null;
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('drop', this.onDrop);
    this.removeEventListener('dragover', this.onDragOver);
    this.document?.removeEventListener('reset', this.onReset, true);
    this.document = null;
    for (const button of this.derivedDisabled) button.removeAttribute('aria-disabled');
    this.derivedDisabled.clear();
  }
  private owns(element: Element): boolean {
    return element.closest(`[data-vf-file-uploader-root],${this.localName}`) === this;
  }
  private input(): HTMLInputElement | undefined {
    return Array.from(this.querySelectorAll<HTMLInputElement>('input[type="file"][data-vf-file-uploader-input]')).find(
      (element) => this.owns(element),
    );
  }
  private action(event: Event): HTMLButtonElement | null {
    const target = event.target;
    if (!(target instanceof Element)) return null;
    const button = target.closest<HTMLButtonElement>('button[data-vf-file-uploader-dropzone]');
    return button && this.owns(button) ? button : null;
  }
  private sync(): void {
    const disabled = this.input()?.matches(':disabled') ?? true;
    for (const button of this.querySelectorAll<HTMLButtonElement>('button[data-vf-file-uploader-dropzone]')) {
      if (!this.owns(button)) continue;
      button.type = 'button';
      if (disabled && button.getAttribute('aria-disabled') !== 'true') {
        button.setAttribute('aria-disabled', 'true');
        this.derivedDisabled.add(button);
      } else if (!disabled && this.derivedDisabled.delete(button)) button.removeAttribute('aria-disabled');
    }
  }
  private blocked(button: HTMLButtonElement): boolean {
    const input = this.input();
    return button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true' || !input || input.matches(':disabled');
  }
  private onClick = (e: Event) => {
    const button = this.action(e);
    if (!e.defaultPrevented && button && !this.blocked(button)) this.input()?.click();
  };
  private emitFiles = (files: FileList | File[]) => {
    this.dispatchEvent(new CustomEvent('vf-files-change', { detail: { files: Array.from(files) }, bubbles: true }));
  };
  private onChange = (e: Event) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input !== this.input() || input.matches(':disabled') || !input.files) return;
    this.emitFiles(input.files);
  };
  private onDragOver = (e: DragEvent) => {
    const button = this.action(e);
    if (!button || e.defaultPrevented || !e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = this.blocked(button) ? 'none' : 'copy';
  };
  private onDrop = (e: DragEvent) => {
    const button = this.action(e);
    if (!button || e.defaultPrevented) return;
    e.preventDefault();
    const input = this.input();
    if (input && e.dataTransfer && !this.blocked(button)) acceptDrop(input, e.dataTransfer.files);
  };
  private onReset = (event: Event) => {
    const input = this.input();
    if (!input?.form || input.form !== event.target || !input.files?.length) return;
    setTimeout(() => {
      if (this.active && !event.defaultPrevented && input.form === event.target && this.input() === input && !input.files?.length) this.emitFiles([]);
    }, 0);
  };
}
export function defineFileUploaderElement(
  tag = 'vf-file-uploader',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge FileUploader registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfFileUploaderElement);
}
