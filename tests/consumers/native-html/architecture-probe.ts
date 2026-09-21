import {
  VyrnForgeElement,
  createVyrnForgeElementRegistration,
  vyrnForgeElementDefinitions,
  type VyrnForgePropertyDeclarations,
} from "@vyrnforge/ui-elements";

export const registeredNativeTagCount = vyrnForgeElementDefinitions.length;

if (registeredNativeTagCount !== 60) {
  throw new Error(
    `Expected the 60-tag native catalog (58 GMF3 + DescriptionList + Progress), received ${registeredNativeTagCount}.`,
  );
}

class ArchitectureProbeElement extends VyrnForgeElement {
  static override readonly properties = Object.freeze({
    label: { type: "string", reflect: true },
  }) satisfies VyrnForgePropertyDeclarations;

  get label(): string {
    return this.getPropertyValue("label", "VyrnForge native foundation");
  }

  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  protected override connected(): void {
    this.setAttribute("data-vf-element", "");
  }

  protected override update(): void {
    this.textContent = this.label;
  }
}

export const registerArchitectureProbe = createVyrnForgeElementRegistration({
  tagName: "vf-architecture-probe",
  constructor: ArchitectureProbeElement,
});

registerArchitectureProbe();
