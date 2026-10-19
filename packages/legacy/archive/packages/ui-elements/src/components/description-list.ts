import { VyrnForgeDomElement } from "./dom";

export class VyrnForgeDescriptionListElement extends VyrnForgeDomElement {
  #list: HTMLDListElement | null = null;

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;

    if (!this.#list) {
      const list = document.createElement("dl");
      list.className = "vf-description-list__list";
      while (this.firstChild) list.append(this.firstChild);
      this.append(list);
      this.#list = list;
    }

    this.className = "vf-description-list";
    this.setAttribute("data-vf-element", "");
  }
}
