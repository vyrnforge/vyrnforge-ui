import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
let nextId = 0;

export class VfPreviewCardElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'placement'];
  #timer: ReturnType<typeof setTimeout> | null = null;
  #observer: MutationObserver | null = null;
  #hover = false;
  #focus = false;
  #dismissed = false;
  #surface: HTMLElement | null = null;

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.addEventListener('pointerover', this.#pointerOver);
    this.addEventListener('pointerout', this.#pointerOut);
    this.addEventListener('focusin', this.#focusIn);
    this.addEventListener('focusout', this.#focusOut);
    this.ownerDocument.addEventListener('keydown', this.#keyDown);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('pointerover', this.#pointerOver);
    this.removeEventListener('pointerout', this.#pointerOut);
    this.removeEventListener('focusin', this.#focusIn);
    this.removeEventListener('focusout', this.#focusOut);
    this.ownerDocument.removeEventListener('keydown', this.#keyDown);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#cancel();
    this.#hover = false;
    this.#focus = false;
    this.#dismissed = false;
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
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find(
        (node) => node.closest('vf-preview-card') === this,
      ) ?? null
    );
  }

  #trigger(): HTMLElement | null {
    return this.#part('[data-vf-preview-card-trigger]');
  }

  #content(): HTMLElement | null {
    return this.#part('[data-vf-preview-card-content]');
  }

  #inside(target: EventTarget | null): boolean {
    return target instanceof Node && Boolean(this.#trigger()?.contains(target) || this.#content()?.contains(target));
  }

  #cancel(): void {
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
  }

  #schedule(delay: number): void {
    this.#cancel();
    if (!this.#hover && !this.#focus) this.#dismissed = false;
    const value = !this.#dismissed && (this.#hover || this.#focus);
    if (value === this.open) return;
    this.#timer = setTimeout(
      () => {
        this.#timer = null;
        this.#request(value);
      },
      Math.max(0, delay),
    );
  }

  #sync(): void {
    const trigger = this.#trigger();
    const content = this.#content();
    if (this.#surface && this.#surface !== content && this.#surface.matches(':popover-open'))
      this.#surface.hidePopover();
    this.#surface = content;
    if (!trigger || !content) return;
    if (!content.id) {
      let id: string;
      do {
        id = `vf-preview-card-${++nextId}`;
      } while (this.ownerDocument.getElementById(id));
      content.id = id;
    }
    trigger.setAttribute('aria-controls', content.id);
    trigger.setAttribute('aria-expanded', String(this.open));
    content.setAttribute('popover', 'manual');
    content.setAttribute('data-vf-placement', this.placement);
    content.removeAttribute('hidden');
    content.toggleAttribute('data-vf-open', this.open);
    if (this.open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!this.open && content.matches(':popover-open')) {
      if (content.contains(content.ownerDocument.activeElement)) trigger.focus();
      content.hidePopover();
    }
  }

  #pointerOver = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || !this.#inside(event.target) || this.#inside(event.relatedTarget)) return;
    this.#hover = true;
    this.#schedule(Number(this.getAttribute('open-delay') ?? 0));
  };

  #pointerOut = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || !this.#inside(event.target) || this.#inside(event.relatedTarget)) return;
    this.#hover = false;
    this.#schedule(Number(this.getAttribute('close-delay') ?? 100));
  };

  #focusIn = (event: FocusEvent): void => {
    if (!this.#inside(event.target)) return;
    this.#focus = true;
    this.#schedule(0);
  };

  #focusOut = (event: FocusEvent): void => {
    if (this.#inside(event.relatedTarget)) return;
    this.#focus = false;
    this.#schedule(Number(this.getAttribute('close-delay') ?? 100));
  };

  #request(value: boolean): void {
    if (value === this.open) return;
    this.open = value;
    this.dispatchEvent(new CustomEvent('vf-open-change', { detail: { open: value }, bubbles: true, composed: true }));
  }

  #keyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || event.defaultPrevented || !this.open) return;
    this.#dismissed = true;
    this.#cancel();
    this.#request(false);
    event.preventDefault();
  };
}

export function definePreviewCardElement(
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge PreviewCard registration requires a CustomElementRegistry.');
  if (!registry.get('vf-preview-card')) registry.define('vf-preview-card', VfPreviewCardElement);
}
