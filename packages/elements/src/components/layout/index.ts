import {
  clusterAlignments,
  clusterJustifications,
  containerSizes,
  layoutSpaces,
  stackAlignments,
  stackJustifications,
  type ClusterAlign,
  type ClusterJustify,
  type ContainerSize,
  type LayoutSpace,
  type StackAlign,
  type StackJustify,
} from '@vyrnforge/web/layout';

export type { ClusterAlign, ClusterJustify, ContainerSize, LayoutSpace, StackAlign, StackJustify } from '@vyrnforge/web/layout';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

function normalizedValue<Value extends string>(values: readonly Value[], value: string | null, fallback: Value): Value {
  return value !== null && values.includes(value as Value) ? value as Value : fallback;
}

function reflectValue(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value);
}

export class VfStackElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap', 'align', 'justify'];

  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }

  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'md'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }

  get align(): StackAlign { return normalizedValue(stackAlignments, this.getAttribute('align'), 'stretch'); }
  set align(value: StackAlign) { this.setAttribute('align', value); }

  get justify(): StackJustify { return normalizedValue(stackJustifications, this.getAttribute('justify'), 'start'); }
  set justify(value: StackJustify) { this.setAttribute('justify', value); }

  #syncContractAttributes(): void {
    this.setAttribute('data-vf-stack', '');
    reflectValue(this, 'data-vf-stack-gap', this.gap);
    reflectValue(this, 'data-vf-stack-align', this.align);
    reflectValue(this, 'data-vf-stack-justify', this.justify);
  }
}

export class VfClusterElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap', 'align', 'justify'];

  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }

  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'md'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }

  get align(): ClusterAlign { return normalizedValue(clusterAlignments, this.getAttribute('align'), 'center'); }
  set align(value: ClusterAlign) { this.setAttribute('align', value); }

  get justify(): ClusterJustify { return normalizedValue(clusterJustifications, this.getAttribute('justify'), 'start'); }
  set justify(value: ClusterJustify) { this.setAttribute('justify', value); }

  #syncContractAttributes(): void {
    this.setAttribute('data-vf-cluster', '');
    reflectValue(this, 'data-vf-cluster-gap', this.gap);
    reflectValue(this, 'data-vf-cluster-align', this.align);
    reflectValue(this, 'data-vf-cluster-justify', this.justify);
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

export function defineClusterElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Cluster registration requires a CustomElementRegistry.');
  if (!registry.get('vf-cluster')) registry.define('vf-cluster', VfClusterElement);
}

export function defineContainerElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Container registration requires a CustomElementRegistry.');
  if (!registry.get('vf-container')) registry.define('vf-container', VfContainerElement);
}

export function defineLayoutElements(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  defineStackElement(registry);
  defineClusterElement(registry);
  defineContainerElement(registry);
}
