import {
  containerSizes,
  layoutSpaces,
  stackAlignments,
  stackDirections,
  stackJustifications,
  type ContainerSize,
  type LayoutSpace,
  type StackAlign,
  type StackDirection,
  type StackJustify,
} from '@vyrnforge/web/layout';

export type { ContainerSize, LayoutSpace, StackAlign, StackDirection, StackJustify } from '@vyrnforge/web/layout';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

function normalizedValue<Value extends string>(values: readonly Value[], value: string | null, fallback: Value): Value {
  return value !== null && values.includes(value as Value) ? value as Value : fallback;
}

function reflectValue(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value);
}

export class VfStackElement extends HTMLElementBase {
  static readonly observedAttributes = ['direction', 'gap', 'align', 'justify'];

  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }

  get direction(): StackDirection { return normalizedValue(stackDirections, this.getAttribute('direction'), 'block'); }
  set direction(value: StackDirection) { this.setAttribute('direction', value); }

  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'md'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }

  get align(): StackAlign { return normalizedValue(stackAlignments, this.getAttribute('align'), 'stretch'); }
  set align(value: StackAlign) { this.setAttribute('align', value); }

  get justify(): StackJustify { return normalizedValue(stackJustifications, this.getAttribute('justify'), 'start'); }
  set justify(value: StackJustify) { this.setAttribute('justify', value); }

  #syncContractAttributes(): void {
    this.setAttribute('data-vf-stack', '');
    reflectValue(this, 'data-vf-stack-direction', this.direction);
    reflectValue(this, 'data-vf-stack-gap', this.gap);
    reflectValue(this, 'data-vf-stack-align', this.align);
    reflectValue(this, 'data-vf-stack-justify', this.justify);
  }
}

export class VfContainerElement extends HTMLElementBase {
  static readonly observedAttributes = ['size', 'gutter'];

  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }

  get size(): ContainerSize { return normalizedValue(containerSizes, this.getAttribute('size'), 'xl'); }
  set size(value: ContainerSize) { this.setAttribute('size', value); }

  get gutter(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gutter'), 'md'); }
  set gutter(value: LayoutSpace) { this.setAttribute('gutter', value); }

  #syncContractAttributes(): void {
    this.setAttribute('data-vf-container', '');
    reflectValue(this, 'data-vf-container-size', this.size);
    reflectValue(this, 'data-vf-container-gutter', this.gutter);
  }
}

export function defineStackElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Stack registration requires a CustomElementRegistry.');
  if (!registry.get('vf-stack')) registry.define('vf-stack', VfStackElement);
}

export function defineContainerElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Container registration requires a CustomElementRegistry.');
  if (!registry.get('vf-container')) registry.define('vf-container', VfContainerElement);
}

export function defineLayoutElements(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  defineStackElement(registry);
  defineContainerElement(registry);
}
