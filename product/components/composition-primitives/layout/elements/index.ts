import {
  aspectRatios,
  clusterAlignments,
  clusterJustifications,
  containerSizes,
  inlineAlignments,
  inlineJustifications,
  layoutSpaces,
  radioGroupOrientations,
  stackAlignments,
  stackJustifications,
  type AspectRatio,
  type ClusterAlign,
  type ClusterJustify,
  type ContainerSize,
  type InlineAlign,
  type InlineJustify,
  type LayoutSpace,
  type RadioGroupOrientation,
  type StackAlign,
  type StackJustify,
} from '@vyrnforge/web/layout';

export type { AspectRatio, ClusterAlign, ClusterJustify, ContainerSize, InlineAlign, InlineJustify, LayoutSpace, RadioGroupOrientation, StackAlign, StackJustify } from '@vyrnforge/web/layout';

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
function normalizedValue<Value extends string>(values: readonly Value[], value: string | null, fallback: Value): Value { return value !== null && values.includes(value as Value) ? value as Value : fallback; }
function reflectValue(element: HTMLElement, name: string, value: string): void { element.setAttribute(name, value); }

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
  #syncContractAttributes(): void { this.setAttribute('data-vf-stack', ''); reflectValue(this, 'data-vf-stack-gap', this.gap); reflectValue(this, 'data-vf-stack-align', this.align); reflectValue(this, 'data-vf-stack-justify', this.justify); }
}

export class VfInlineElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap', 'align', 'justify'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'md'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }
  get align(): InlineAlign { return normalizedValue(inlineAlignments, this.getAttribute('align'), 'center'); }
  set align(value: InlineAlign) { this.setAttribute('align', value); }
  get justify(): InlineJustify { return normalizedValue(inlineJustifications, this.getAttribute('justify'), 'start'); }
  set justify(value: InlineJustify) { this.setAttribute('justify', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-inline', ''); reflectValue(this, 'data-vf-inline-gap', this.gap); reflectValue(this, 'data-vf-inline-align', this.align); reflectValue(this, 'data-vf-inline-justify', this.justify); }
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
  #syncContractAttributes(): void { this.setAttribute('data-vf-cluster', ''); reflectValue(this, 'data-vf-cluster-gap', this.gap); reflectValue(this, 'data-vf-cluster-align', this.align); reflectValue(this, 'data-vf-cluster-justify', this.justify); }
}

export class VfGridElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'md'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-grid', ''); reflectValue(this, 'data-vf-grid-gap', this.gap); }
}

export class VfContainerElement extends HTMLElementBase {
  static readonly observedAttributes = ['size', 'gutter'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get size(): ContainerSize { return normalizedValue(containerSizes, this.getAttribute('size'), 'xl'); }
  set size(value: ContainerSize) { this.setAttribute('size', value); }
  get gutter(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gutter'), 'md'); }
  set gutter(value: LayoutSpace) { this.setAttribute('gutter', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-container', ''); reflectValue(this, 'data-vf-container-size', this.size); reflectValue(this, 'data-vf-container-gutter', this.gutter); }
}

export class VfAspectRatioElement extends HTMLElementBase {
  static readonly observedAttributes = ['ratio'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get ratio(): AspectRatio { return normalizedValue(aspectRatios, this.getAttribute('ratio'), 'square'); }
  set ratio(value: AspectRatio) { this.setAttribute('ratio', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-aspect-ratio', ''); reflectValue(this, 'data-vf-aspect-ratio-value', this.ratio); }
}

export class VfFieldElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'xs'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-field', ''); reflectValue(this, 'data-vf-field-gap', this.gap); }
}

export class VfFieldsetElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'sm'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-fieldset', ''); reflectValue(this, 'data-vf-fieldset-gap', this.gap); if (!this.hasAttribute('role')) this.setAttribute('role', 'group'); }
}

export class VfInputGroupElement extends HTMLElementBase {
  connectedCallback(): void { this.setAttribute('data-vf-input-group', ''); }
}

export class VfRadioGroupElement extends HTMLElementBase {
  static readonly observedAttributes = ['gap', 'orientation'];
  connectedCallback(): void { this.#syncContractAttributes(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#syncContractAttributes(); }
  get gap(): LayoutSpace { return normalizedValue(layoutSpaces, this.getAttribute('gap'), 'sm'); }
  set gap(value: LayoutSpace) { this.setAttribute('gap', value); }
  get orientation(): RadioGroupOrientation { return normalizedValue(radioGroupOrientations, this.getAttribute('orientation'), 'vertical'); }
  set orientation(value: RadioGroupOrientation) { this.setAttribute('orientation', value); }
  #syncContractAttributes(): void { this.setAttribute('data-vf-radio-group', ''); reflectValue(this, 'data-vf-radio-group-gap', this.gap); reflectValue(this, 'data-vf-radio-group-orientation', this.orientation); if (!this.hasAttribute('role')) this.setAttribute('role', 'radiogroup'); reflectValue(this, 'aria-orientation', this.orientation); }
}

export function defineStackElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Stack registration requires a CustomElementRegistry.'); if (!registry.get('vf-stack')) registry.define('vf-stack', VfStackElement); }
export function defineInlineElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Inline registration requires a CustomElementRegistry.'); if (!registry.get('vf-inline')) registry.define('vf-inline', VfInlineElement); }
export function defineClusterElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Cluster registration requires a CustomElementRegistry.'); if (!registry.get('vf-cluster')) registry.define('vf-cluster', VfClusterElement); }
export function defineGridElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Grid registration requires a CustomElementRegistry.'); if (!registry.get('vf-grid')) registry.define('vf-grid', VfGridElement); }
export function defineContainerElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Container registration requires a CustomElementRegistry.'); if (!registry.get('vf-container')) registry.define('vf-container', VfContainerElement); }
export function defineAspectRatioElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements AspectRatio registration requires a CustomElementRegistry.'); if (!registry.get('vf-aspect-ratio')) registry.define('vf-aspect-ratio', VfAspectRatioElement); }
export function defineFieldElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Field registration requires a CustomElementRegistry.'); if (!registry.get('vf-field')) registry.define('vf-field', VfFieldElement); }
export function defineFieldsetElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements Fieldset registration requires a CustomElementRegistry.'); if (!registry.get('vf-fieldset')) registry.define('vf-fieldset', VfFieldsetElement); }
export function defineInputGroupElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements InputGroup registration requires a CustomElementRegistry.'); if (!registry.get('vf-input-group')) registry.define('vf-input-group', VfInputGroupElement); }
export function defineRadioGroupElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void { if (!registry) throw new Error('VyrnForge Elements RadioGroup registration requires a CustomElementRegistry.'); if (!registry.get('vf-radio-group')) registry.define('vf-radio-group', VfRadioGroupElement); }
export function defineLayoutElements(registry: CustomElementRegistry | undefined = globalThis.customElements): void { defineStackElement(registry); defineInlineElement(registry); defineClusterElement(registry); defineGridElement(registry); defineContainerElement(registry); defineAspectRatioElement(registry); defineFieldElement(registry); defineFieldsetElement(registry); defineInputGroupElement(registry); defineRadioGroupElement(registry); }
