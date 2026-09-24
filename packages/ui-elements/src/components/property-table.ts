import { VyrnForgeDomElement } from "./dom";

export class VyrnForgePropertyTableElement extends VyrnForgeDomElement {
  protected override update(): void {
    this.applyManagedClasses(["vf-property-table"]);
    this.setAttribute("data-vf-element", "");
  }
}
