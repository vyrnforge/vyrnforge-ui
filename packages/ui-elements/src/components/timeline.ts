import { VyrnForgeDomElement } from "./dom";

export class VyrnForgeTimelineElement extends VyrnForgeDomElement {
  #list: HTMLOListElement | null = null;

  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;

    if (!this.#list) {
      const list = document.createElement("ol");
      list.className = "vf-timeline__list";
      while (this.firstChild) {
        const child = this.firstChild;
        if (child instanceof HTMLElement && child.tagName === "LI") {
          list.append(child);
          continue;
        }

        const item = document.createElement("li");
        item.className = "vf-timeline__item";
        item.append(child);
        list.append(item);
      }
      this.append(list);
      this.#list = list;
    }

    for (const item of this.#list.children) {
      if (item instanceof HTMLElement) item.classList.add("vf-timeline__item");
    }

    this.applyManagedClasses(["vf-timeline"]);
    this.setAttribute("data-vf-element", "");
  }
}
