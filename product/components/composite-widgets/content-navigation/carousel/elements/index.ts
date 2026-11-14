const HTMLElementBase = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

export interface CarouselIndexChangeDetail {
  index: number;
}

export class VfCarouselElement extends HTMLElementBase {
  static readonly observedAttributes = ['index', 'default-index'];

  private internalIndex: number | undefined;
  private observer: MutationObserver | null = null;

  connectedCallback() {
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-roledescription')) this.setAttribute('aria-roledescription', 'carousel');
    this.setAttribute('data-vf-carousel-root', '');
    this.internalIndex ??= this.defaultIndex;
    this.addEventListener('click', this.onClick);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  get defaultIndex() {
    return Number(this.getAttribute('default-index') ?? 0);
  }

  set defaultIndex(value: number) {
    this.setAttribute('default-index', String(value));
  }

  get index() {
    return this.bounded(
      this.hasAttribute('index') ? Number(this.getAttribute('index')) : (this.internalIndex ?? this.defaultIndex),
    );
  }

  set index(value: number) {
    this.setAttribute('index', String(value));
  }

  private owns(element: Element) {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent === this) return true;
      if (parent instanceof VfCarouselElement) return false;
    }
    return false;
  }

  private slides() {
    return Array.from(this.querySelectorAll<HTMLElement>('[data-vf-carousel-slide]')).filter((slide) =>
      this.owns(slide),
    );
  }

  private bounded(value: number) {
    return Math.max(0, Math.min(Number.isFinite(value) ? Math.trunc(value) : 0, Math.max(0, this.slides().length - 1)));
  }

  private sync() {
    const slides = this.slides();
    const index = this.index;
    slides.forEach((slide, position) => {
      slide.setAttribute('role', 'group');
      if (!slide.hasAttribute('aria-roledescription')) slide.setAttribute('aria-roledescription', 'slide');
      slide.hidden = position !== index;
    });
    for (const button of this.querySelectorAll<HTMLButtonElement>(
      'button[data-vf-carousel-previous], button[data-vf-carousel-next]',
    )) {
      if (!this.owns(button)) continue;
      if (!button.hasAttribute('type')) button.type = 'button';
      const unavailable = button.hasAttribute('data-vf-carousel-previous') ? index === 0 : index >= slides.length - 1;
      if (unavailable || button.disabled) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    }
  }

  private onClick = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(
      'button[data-vf-carousel-previous], button[data-vf-carousel-next]',
    );
    if (!button || !this.owns(button) || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    const next = this.bounded(this.index + (button.hasAttribute('data-vf-carousel-previous') ? -1 : 1));
    if (next === this.index) return;
    if (!this.hasAttribute('index')) this.internalIndex = next;
    this.sync();
    this.dispatchEvent(
      new CustomEvent<CarouselIndexChangeDetail>('vf-index-change', {
        detail: { index: next },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

export function defineCarouselElement(
  tag = 'vf-carousel',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Carousel registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfCarouselElement);
}
