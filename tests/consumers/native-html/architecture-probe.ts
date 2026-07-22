import {
  VyrnForgeElement,
  defineVyrnForgeElement,
} from "@vyrnforge/ui-elements";

class ArchitectureProbeElement extends VyrnForgeElement {
  connectedCallback() {
    this.setAttribute("data-vf-element", "");
    this.textContent = "VyrnForge native foundation";
  }
}

defineVyrnForgeElement("vf-architecture-probe", ArchitectureProbeElement);
