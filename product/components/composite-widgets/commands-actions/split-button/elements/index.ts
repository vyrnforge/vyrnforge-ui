import { VfMenuElement } from '../menu/index.js';

const ownerSelector = '[data-vf-menu-root],vf-menu,vf-split-button,[data-vf-split-button-root]';

export class VfSplitButtonElement extends VfMenuElement {
  #partsObserver: MutationObserver | null = null;

  connectedCallback(): void {
    this.setAttribute('data-vf-split-button-root', '');
    this.#syncParts();
    super.connectedCallback();
    if (typeof MutationObserver !== 'undefined') {
      this.#partsObserver = new MutationObserver(() => this.#syncParts());
      this.#partsObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-vf-split-button-trigger', 'data-vf-split-button-content', 'role'],
      });
    }
  }

  disconnectedCallback(): void {
    this.#partsObserver?.disconnect();
    this.#partsObserver = null;
    super.disconnectedCallback();
  }

  #syncParts(): void {
    const owned = (selector: string) =>
      Array.from(this.querySelectorAll<HTMLElement>(selector)).filter((part) => part.closest(ownerSelector) === this);
    const mark = (part: HTMLElement, attribute: string) => {
      if (!part.hasAttribute(attribute)) part.setAttribute(attribute, '');
    };
    for (const trigger of owned('[data-vf-split-button-trigger]')) mark(trigger, 'data-vf-menu-trigger');
    for (const content of owned('[data-vf-split-button-content]')) {
      mark(content, 'data-vf-menu-content');
      for (const item of content.querySelectorAll<HTMLElement>('[role="menuitem"]')) {
        if (item.closest(ownerSelector) === this) mark(item, 'data-vf-menu-item');
      }
    }
  }
}

export function defineSplitButtonElement(
  tagName = 'vf-split-button',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge SplitButton registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfSplitButtonElement);
}
