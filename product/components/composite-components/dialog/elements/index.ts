const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
export type DialogDismissReason = 'escape' | 'backdrop' | 'close-control';
export interface DialogDismissRequestDetail { reason: DialogDismissReason; }
export interface DialogOpenChangeDetail { open: boolean; }
function canRestoreFocus(element: HTMLElement | null): element is HTMLElement { return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]')); }
export class VfDialogElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'backdrop-dismiss'];
  #restoreTarget: HTMLElement | null = null; #backdropPointerDown = false;
  connectedCallback(): void { if (typeof HTMLElement === 'undefined') return; this.addEventListener('click', this.#onClick); const dialog = this.dialog; dialog?.addEventListener('cancel', this.#onCancel); dialog?.addEventListener('close', this.#onClose); dialog?.addEventListener('pointerdown', this.#onPointerDown); this.#sync(); }
  disconnectedCallback(): void { this.removeEventListener('click', this.#onClick); const dialog = this.dialog; dialog?.removeEventListener('cancel', this.#onCancel); dialog?.removeEventListener('close', this.#onClose); dialog?.removeEventListener('pointerdown', this.#onPointerDown); }
  attributeChangedCallback(): void { if (this.isConnected) this.#sync(); }
  get dialog(): HTMLDialogElement | null { return this.querySelector<HTMLDialogElement>('dialog[data-vf-dialog-root], dialog'); }
  get open(): boolean { return this.hasAttribute('open'); }
  set open(value: boolean) { this.toggleAttribute('open', value); }
  #sync(): void { const dialog = this.dialog; if (!dialog) return; if (!this.id) this.id = `vf-dialog-${Math.random().toString(36).slice(2)}`; dialog.setAttribute('data-vf-dialog-root', ''); dialog.toggleAttribute('data-vf-backdrop-dismiss', this.hasAttribute('backdrop-dismiss')); const title = this.querySelector<HTMLElement>('[data-vf-dialog-title]'); const description = this.querySelector<HTMLElement>('[data-vf-dialog-description]'); if (title) { title.id ||= `${this.id}-title`; dialog.setAttribute('aria-labelledby', title.id); } if (description) { description.id ||= `${this.id}-description`; dialog.setAttribute('aria-describedby', description.id); } if (this.open && !dialog.open) { this.#restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.showModal(); } else if (!this.open && dialog.open) dialog.close(); dialog.toggleAttribute('data-vf-open', this.open); }
  #requestDismiss(reason: DialogDismissReason): void { const event = new CustomEvent<DialogDismissRequestDetail>('vf-dismiss-request', { detail: { reason }, bubbles: true, composed: true, cancelable: true }); if (!this.dispatchEvent(event)) return; this.open = false; this.dispatchEvent(new CustomEvent<DialogOpenChangeDetail>('vf-open-change', { detail: { open: false }, bubbles: true, composed: true })); }
  #onCancel = (event: Event): void => { event.preventDefault(); this.#requestDismiss('escape'); };
  #onPointerDown = (event: PointerEvent): void => { this.#backdropPointerDown = event.target === event.currentTarget; };
  #onClose = (): void => { if (this.open) { queueMicrotask(() => this.#sync()); return; } const target = this.#restoreTarget; this.#restoreTarget = null; if (canRestoreFocus(target)) target.focus(); };
  #onClick = (event: Event): void => { if (!(event.target instanceof Element)) return; const close = event.target.closest('[data-vf-dialog-close]'); if (close && this.contains(close)) { this.#requestDismiss('close-control'); return; } const dialog = this.dialog; if (dialog && this.hasAttribute('backdrop-dismiss') && this.#backdropPointerDown && event.target === dialog) this.#requestDismiss('backdrop'); this.#backdropPointerDown = false; };
}
export function defineDialogElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Dialog registration requires a CustomElementRegistry.'); if (!registry.get('vf-dialog')) registry.define('vf-dialog', VfDialogElement); }
