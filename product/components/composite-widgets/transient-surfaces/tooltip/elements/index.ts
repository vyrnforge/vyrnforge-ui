import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
let nextId = 0;

export class VfTooltipElement extends HTMLElementBase {
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
    return (this.getAttribute('placement') as FloatingPlacement | null) ?? 'top';
  }

  #part(selector: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find((node) => node.closest('vf-tooltip') === this) ??
      null
    );
  }

  #trigger(): HTMLElement | null {
    return this.#part('[data-vf-tooltip-trigger]');
  }

  #content(): HTMLElement | null {
    return this.#part('[data-vf-tooltip-content]');
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
        this.open = value;
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
        id = `vf-tooltip-${++nextId}`;
      } while (this.ownerDocument.getElementById(id));
      content.id = id;
    }
    const descriptions = new Set((trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
    descriptions.add(content.id);
    trigger.setAttribute('aria-describedby', Array.from(descriptions).join(' '));
    content.setAttribute('role', 'tooltip');
    content.setAttribute('popover', 'manual');
    content.setAttribute('data-vf-placement', this.placement);
    content.hidden = !this.open;
    content.toggleAttribute('data-vf-open', this.open);
    if (this.open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!this.open && content.matches(':popover-open')) content.hidePopover();
  }

  #pointerOver = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || !this.#inside(event.target) || this.#inside(event.relatedTarget)) return;
    this.#hover = true;
    this.#schedule(Number(this.getAttribute('open-delay') ?? 400));
  };

  #pointerOut = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || !this.#inside(event.target) || this.#inside(event.relatedTarget)) return;
    this.#hover = false;
    this.#schedule(Number(this.getAttribute('close-delay') ?? 100));
  };

  #focusIn = (event: FocusEvent): void => {
    if (!(event.target instanceof Node) || !this.#trigger()?.contains(event.target)) return;
    this.#focus = true;
    this.#schedule(0);
  };

  #focusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && this.#trigger()?.contains(event.relatedTarget)) return;
    this.#focus = false;
    this.#schedule(Number(this.getAttribute('close-delay') ?? 100));
  };

  #keyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || event.defaultPrevented || !this.open) return;
    this.#dismissed = true;
    this.#cancel();
    this.open = false;
    event.preventDefault();
  };
}

export function defineTooltipElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Tooltip registration requires a CustomElementRegistry.');
  if (!registry.get('vf-tooltip')) registry.define('vf-tooltip', VfTooltipElement);
}
