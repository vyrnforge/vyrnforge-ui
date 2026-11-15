const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
export type DialogDismissReason = 'escape' | 'backdrop' | 'close-control';
export interface DialogDismissRequestDetail {
  reason: DialogDismissReason;
}
export interface DialogOpenChangeDetail {
  open: boolean;
}
function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]'));
}
function isBackdropHit(event: MouseEvent | PointerEvent): boolean {
  if (event.target !== event.currentTarget || event.button !== 0) return false;
  const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

const modalOwner = 'vf-dialog,vf-drawer,vf-alert-dialog';
export class VfDialogElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'backdrop-dismiss'];
  #restoreTarget: HTMLElement | null = null;
  #backdropPointerDown = false;
  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.addEventListener('click', this.#onClick);
    const dialog = this.dialog;
    dialog?.addEventListener('cancel', this.#onCancel);
    dialog?.addEventListener('close', this.#onClose);
    dialog?.addEventListener('pointerdown', this.#onPointerDown);
    dialog?.addEventListener('pointercancel', this.#onPointerCancel);
    this.#sync();
  }
  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    const dialog = this.dialog;
    dialog?.removeEventListener('cancel', this.#onCancel);
    dialog?.removeEventListener('close', this.#onClose);
    dialog?.removeEventListener('pointerdown', this.#onPointerDown);
    dialog?.removeEventListener('pointercancel', this.#onPointerCancel);
    if (dialog?.open) dialog.close();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.#sync();
  }
  get dialog(): HTMLDialogElement | null {
    return Array.from(this.querySelectorAll<HTMLDialogElement>('dialog')).find(dialog => dialog.closest(modalOwner) === this) ?? null;
  }
  get open(): boolean {
    return this.hasAttribute('open');
  }
  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }
  #sync(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    if (!this.id) this.id = `vf-dialog-${Math.random().toString(36).slice(2)}`;
    dialog.setAttribute('data-vf-dialog-root', '');
    dialog.toggleAttribute('data-vf-backdrop-dismiss', this.hasAttribute('backdrop-dismiss') && this.localName !== 'vf-alert-dialog');
    const ownedPart = (selector: string) => Array.from(dialog.querySelectorAll<HTMLElement>(selector)).find(part => part.closest('dialog') === dialog && part.closest(modalOwner) === this);
    const title = ownedPart('[data-vf-dialog-title],[data-vf-drawer-title],[data-vf-alert-dialog-title]');
    const description = ownedPart('[data-vf-dialog-description],[data-vf-drawer-description],[data-vf-alert-dialog-description]');
    if (title) {
      title.setAttribute('data-vf-dialog-title', '');
      title.id ||= `${this.id}-title`;
      if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) dialog.setAttribute('aria-labelledby', title.id);
    }
    if (description) {
      description.setAttribute('data-vf-dialog-description', '');
      description.id ||= `${this.id}-description`;
      if (!dialog.hasAttribute('aria-describedby')) dialog.setAttribute('aria-describedby', description.id);
    }
    for (const part of Array.from(dialog.querySelectorAll<HTMLElement>('[data-vf-drawer-body],[data-vf-alert-dialog-body],[data-vf-drawer-close],[data-vf-alert-dialog-cancel],[data-vf-alert-dialog-action]'))) {
      if (part.closest('dialog') !== dialog || part.closest(modalOwner) !== this) continue;
      part.setAttribute(part.matches('[data-vf-drawer-body],[data-vf-alert-dialog-body]') ? 'data-vf-dialog-body' : 'data-vf-dialog-close', '');
    }
    if (this.open && dialog.open && !dialog.matches(':modal')) dialog.close();
    if (this.open && !dialog.open) {
      this.#restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!this.open && dialog.open) dialog.close();
    dialog.toggleAttribute('data-vf-open', this.open);
  }
  #requestDismiss(reason: DialogDismissReason): void {
    const event = new CustomEvent<DialogDismissRequestDetail>('vf-dismiss-request', {
      detail: { reason },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(event)) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<DialogOpenChangeDetail>('vf-open-change', {
        detail: { open: false },
        bubbles: true,
        composed: true,
      }),
    );
  }
  #onCancel = (event: Event): void => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    this.#requestDismiss('escape');
  };
  #onPointerDown = (event: PointerEvent): void => {
    this.#backdropPointerDown = !event.defaultPrevented && isBackdropHit(event);
  };
  #onPointerCancel = (): void => { this.#backdropPointerDown = false; };
  #onClose = (): void => {
    if (this.dialog?.open) return;
    if (this.open) {
      queueMicrotask(() => { if (this.isConnected) this.#sync(); });
      return;
    }
    const target = this.#restoreTarget;
    this.#restoreTarget = null;
    const dialog = this.dialog;
    const focused = dialog?.ownerDocument.activeElement;
    if (canRestoreFocus(target) && (!focused || focused === dialog?.ownerDocument.body || dialog?.contains(focused))) target.focus();
  };
  #onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element) || event.target.closest(modalOwner) !== this || event.defaultPrevented) return;
    const close = event.target.closest('[data-vf-dialog-close],[data-vf-drawer-close],[data-vf-alert-dialog-cancel],[data-vf-alert-dialog-action]');
    if (close && close.closest('dialog') === this.dialog && !close.matches(':disabled')) {
      this.#requestDismiss('close-control');
      return;
    }
    const dialog = this.dialog;
    if (dialog && this.localName !== 'vf-alert-dialog' && this.hasAttribute('backdrop-dismiss') && this.#backdropPointerDown && event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.button === 0 && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) this.#requestDismiss('backdrop');
    }
    this.#backdropPointerDown = false;
  };
}
export function defineDialogElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Dialog registration requires a CustomElementRegistry.');
  if (!registry.get('vf-dialog')) registry.define('vf-dialog', VfDialogElement);
}
