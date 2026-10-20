import {
  resolveIconGlyph,
  type IconDefinition,
  type IconShape,
  type IconSize,
  type IconVariant,
} from '@vyrnforge/web/icon';

export type { IconDefinition, IconShape, IconSize, IconVariant } from '@vyrnforge/web/icon';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
const svgNamespace = 'http://www.w3.org/2000/svg';

export class VfIconElement extends HTMLElementBase {
  static readonly observedAttributes = ['variant', 'shape', 'size', 'label'];
  #icon: IconDefinition | undefined;

  connectedCallback(): void { this.#render(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#render(); }

  get icon(): IconDefinition | undefined { return this.#icon; }
  set icon(value: IconDefinition | undefined) { this.#icon = value; this.#render(); }

  get variant(): IconVariant { return this.getAttribute('variant') === 'filled' ? 'filled' : 'outlined'; }
  set variant(value: IconVariant) { this.setAttribute('variant', value); }

  get shape(): IconShape { return this.getAttribute('shape') === 'sharp' ? 'sharp' : 'rounded'; }
  set shape(value: IconShape) { this.setAttribute('shape', value); }

  get size(): IconSize {
    const value = this.getAttribute('size');
    return value === 'sm' || value === 'lg' ? value : 'md';
  }
  set size(value: IconSize) { this.setAttribute('size', value); }

  get label(): string | undefined { return this.getAttribute('label') ?? undefined; }
  set label(value: string | undefined) {
    if (value === undefined) this.removeAttribute('label');
    else this.setAttribute('label', value);
  }

  #render(): void {
    if (typeof document === 'undefined') return;
    this.setAttribute('data-vf-icon-host', '');
    const icon = this.#icon;
    if (!icon) { this.replaceChildren(); return; }
    const glyph = resolveIconGlyph(icon, this.variant, this.shape);
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('data-vf-icon', '');
    svg.setAttribute('data-vf-icon-name', icon.name);
    svg.setAttribute('data-vf-variant', this.variant);
    svg.setAttribute('data-vf-shape', this.shape);
    svg.setAttribute('data-vf-size', this.size);
    svg.setAttribute('viewBox', icon.viewBox);
    svg.setAttribute('focusable', 'false');
    if (this.label) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', this.label);
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }
    for (const path of glyph.paths) {
      const node = document.createElementNS(svgNamespace, 'path');
      node.setAttribute('d', path.d);
      if (path.fill) node.setAttribute('fill', path.fill);
      if (path.stroke) node.setAttribute('stroke', path.stroke);
      if (path.strokeWidth !== undefined) node.setAttribute('stroke-width', String(path.strokeWidth));
      if (path.strokeLinecap) node.setAttribute('stroke-linecap', path.strokeLinecap);
      if (path.strokeLinejoin) node.setAttribute('stroke-linejoin', path.strokeLinejoin);
      svg.append(node);
    }
    this.replaceChildren(svg);
  }
}

export function defineIconElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Icon registration requires a CustomElementRegistry.');
  if (!registry.get('vf-icon')) registry.define('vf-icon', VfIconElement);
}
