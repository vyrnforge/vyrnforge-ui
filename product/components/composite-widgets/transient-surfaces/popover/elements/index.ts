import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
let nextId = 0;
export class VfPopoverElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'placement'];
  #surface: HTMLElement | null = null;
  #observer: MutationObserver | null = null;
  #restoreFocus = false;

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.addEventListener('click', this.#onClick);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#surface?.removeEventListener('toggle', this.#onToggle);
    this.#surface?.removeEventListener('beforetoggle', this.#onBeforeToggle);
    this.#surface = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#sync();
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  get placement(): FloatingPlacement {
    return (this.getAttribute('placement') as FloatingPlacement | null) ?? 'bottom-start';
  }

  #part(selector: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find((node) => node.closest('vf-popover') === this) ??
      null
    );
  }

  #trigger(): HTMLElement | null {
    return this.#part('[data-vf-popover-trigger]');
  }

  #content(): HTMLElement | null {
    return this.#part('[data-vf-popover-content]');
  }

  #sync(): void {
    const trigger = this.#trigger();
    const content = this.#content();
    if (this.#surface !== content) {
      this.#surface?.removeEventListener('toggle', this.#onToggle);
      this.#surface?.removeEventListener('beforetoggle', this.#onBeforeToggle);
      if (this.#surface?.matches(':popover-open')) this.#surface.hidePopover();
      this.#surface = content;
      content?.addEventListener('toggle', this.#onToggle);
      content?.addEventListener('beforetoggle', this.#onBeforeToggle);
    }
    if (!trigger || !content) return;
    if (!content.id) {
      let id: string;
      do {
        id = `vf-popover-${++nextId}`;
      } while (this.ownerDocument.getElementById(id));
      content.id = id;
    }
    if (!content.hasAttribute('role')) content.setAttribute('role', 'dialog');
    if (content.getAttribute('role') === 'dialog') trigger.setAttribute('aria-haspopup', 'dialog');
    else trigger.removeAttribute('aria-haspopup');
    trigger.setAttribute('aria-controls', content.id);
    trigger.setAttribute('popovertarget', content.id);
    trigger.setAttribute('aria-expanded', String(this.open));
    content.setAttribute('popover', 'auto');
    content.removeAttribute('hidden');
    content.setAttribute('data-vf-placement', this.placement);
    content.toggleAttribute('data-vf-open', this.open);
    if (this.open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!this.open && content.matches(':popover-open')) content.hidePopover();
  }

  #notify(): void {
    this.dispatchEvent(
      new CustomEvent('vf-open-change', { detail: { open: this.open }, bubbles: true, composed: true }),
    );
  }

  #onBeforeToggle = (event: Event): void => {
    if (event.target !== this.#surface || !this.#surface) return;
    this.#restoreFocus =
      this.#surface.matches(':popover-open') && this.#surface.contains(this.ownerDocument.activeElement);
  };

  #onToggle = (event: Event): void => {
    if (event.target !== this.#surface || !this.#surface) return;
    const actual = this.#surface.matches(':popover-open');
    if (!actual && this.#restoreFocus) {
      this.#restoreFocus = false;
      const active = this.ownerDocument.activeElement;
      if (!active || active === this.ownerDocument.body || this.#surface.contains(active)) this.#trigger()?.focus();
    }
    if (actual === this.open) return;
    this.open = actual;
    this.#notify();
  };

  #onClick = (event: Event): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const trigger = event.target.closest('[data-vf-popover-trigger]');
    if (!trigger || trigger !== this.#trigger() || trigger.matches(':disabled,[aria-disabled="true"]')) return;
    event.preventDefault();
    this.open = !this.open;
    this.#notify();
  };
}

export function definePopoverElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Popover registration requires a CustomElementRegistry.');
  if (!registry.get('vf-popover')) registry.define('vf-popover', VfPopoverElement);
}
