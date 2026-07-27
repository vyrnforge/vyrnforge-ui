import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export type VyrnForgeTextTone =
  "default" | "muted" | "strong" | "danger" | "success" | "warning";
export type VyrnForgeDisplaySize = "sm" | "md" | "lg";
export type VyrnForgeLayoutGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type VyrnForgeLayoutAlign = "stretch" | "start" | "center" | "end";
export type VyrnForgeLayoutJustify = "start" | "center" | "end" | "between";

export interface VyrnForgeDisplayElementConfig {
  readonly baseClass: string;
  readonly defaults?: Readonly<Record<string, boolean | number | string>>;
  readonly modifiers?: readonly {
    readonly property: string;
    readonly prefix: string;
    readonly omitValue?: boolean | number | string;
    readonly truthyClass?: string;
  }[];
  readonly role?: string;
  readonly heading?: boolean;
  readonly labelProxy?: boolean;
}

export abstract class VyrnForgeDisplayElement extends VyrnForgeDomElement {
  static readonly elementConfig: VyrnForgeDisplayElementConfig = {
    baseClass: "vf-element",
  };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      align: { reflect: true, type: "string" },
      density: { reflect: true, type: "string" },
      for: { reflect: true, type: "string" },
      gap: { reflect: true, type: "string" },
      justify: { reflect: true, type: "string" },
      level: { reflect: true, type: "number" },
      maxWidth: { attribute: "max-width", reflect: true, type: "string" },
      padding: { reflect: true, type: "string" },
      size: { reflect: true, type: "string" },
      tone: { reflect: true, type: "string" },
      variant: { reflect: true, type: "string" },
      wrap: { reflect: true, type: "boolean" },
    });

  get align(): string {
    return this.getConfiguredValue("align", "stretch");
  }
  set align(value: string) {
    this.setPropertyValue("align", value);
  }

  get density(): string {
    return this.getConfiguredValue("density", "standard");
  }
  set density(value: string) {
    this.setPropertyValue("density", value);
  }

  get for(): string {
    return this.getPropertyValue("for", "");
  }
  set for(value: string) {
    this.setPropertyValue("for", value);
  }

  get gap(): string {
    return this.getConfiguredValue("gap", "md");
  }
  set gap(value: string) {
    this.setPropertyValue("gap", value);
  }

  get justify(): string {
    return this.getConfiguredValue("justify", "start");
  }
  set justify(value: string) {
    this.setPropertyValue("justify", value);
  }

  get level(): number {
    return this.getConfiguredValue("level", 2);
  }
  set level(value: number) {
    this.setPropertyValue("level", Math.min(6, Math.max(1, Math.round(value))));
  }

  get maxWidth(): string {
    return this.getConfiguredValue("maxWidth", "lg");
  }
  set maxWidth(value: string) {
    this.setPropertyValue("maxWidth", value);
  }

  get padding(): string {
    return this.getConfiguredValue("padding", "md");
  }
  set padding(value: string) {
    this.setPropertyValue("padding", value);
  }

  get size(): string {
    return this.getConfiguredValue("size", "md");
  }
  set size(value: string) {
    this.setPropertyValue("size", value);
  }

  get tone(): string {
    return this.getConfiguredValue("tone", "default");
  }
  set tone(value: string) {
    this.setPropertyValue("tone", value);
  }

  get variant(): string {
    return this.getConfiguredValue("variant", "default");
  }
  set variant(value: string) {
    this.setPropertyValue("variant", value);
  }

  get wrap(): boolean {
    return this.getConfiguredValue("wrap", true);
  }
  set wrap(value: boolean) {
    this.setPropertyValue("wrap", Boolean(value));
  }

  protected override connected(): void {
    if (this.elementConfig.labelProxy)
      this.addEventListener("click", this.handleLabelClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleLabelClick);
  }

  protected override update(): void {
    const config = this.elementConfig;
    const classes: Array<false | string> = [config.baseClass];
    for (const modifier of config.modifiers ?? []) {
      const value = this.readModifierValue(modifier.property);
      if (modifier.truthyClass) {
        classes.push(Boolean(value) && modifier.truthyClass);
      } else if (
        value !== modifier.omitValue &&
        value !== "" &&
        value !== null
      ) {
        classes.push(`${modifier.prefix}${String(value)}`);
      }
    }
    this.applyManagedClasses(classes);
    this.setAttribute("data-vf-element", "");
    if (config.role) this.setAttribute("role", config.role);
    if (config.heading) {
      this.setAttribute("role", "heading");
      this.setAttribute("aria-level", String(this.level));
    }
  }

  private get elementConfig(): VyrnForgeDisplayElementConfig {
    return (this.constructor as typeof VyrnForgeDisplayElement).elementConfig;
  }

  private getConfiguredValue<TValue extends boolean | number | string>(
    property: string,
    fallback: TValue,
  ): TValue {
    const configured = this.elementConfig.defaults?.[property] as
      TValue | undefined;
    return this.getPropertyValue(property, configured ?? fallback);
  }

  private readModifierValue(property: string): unknown {
    return (this as unknown as Record<string, unknown>)[property];
  }

  private readonly handleLabelClick = () => {
    if (!this.for) return;
    const target = this.resolveDocument()?.getElementById(this.for) as
      HTMLElement | null | undefined;
    target?.focus();
  };
}

export interface VyrnForgeDisplayElementConstructor {
  new (): VyrnForgeDisplayElement;
  readonly elementConfig: VyrnForgeDisplayElementConfig;
}

export function createVyrnForgeDisplayElement(
  config: VyrnForgeDisplayElementConfig,
): VyrnForgeDisplayElementConstructor {
  return class extends VyrnForgeDisplayElement {
    static override readonly elementConfig = Object.freeze(config);
  };
}

export const VyrnForgeTextElement = createVyrnForgeDisplayElement({
  baseClass: "vf-text",
  defaults: { size: "md", tone: "default" },
  modifiers: [
    { property: "size", prefix: "vf-text--" },
    { property: "tone", prefix: "vf-text--", omitValue: "default" },
  ],
});
export const VyrnForgeHeadingElement = createVyrnForgeDisplayElement({
  baseClass: "vf-heading",
  defaults: { level: 2, size: "md", tone: "strong" },
  heading: true,
  modifiers: [
    { property: "size", prefix: "vf-heading--" },
    { property: "tone", prefix: "vf-text--", omitValue: "default" },
  ],
});
export const VyrnForgeCaptionElement = createVyrnForgeDisplayElement({
  baseClass: "vf-caption",
  defaults: { tone: "muted" },
  modifiers: [{ property: "tone", prefix: "vf-text--", omitValue: "default" }],
});
export const VyrnForgeLabelElement = createVyrnForgeDisplayElement({
  baseClass: "vf-label",
  defaults: { size: "md", tone: "default" },
  labelProxy: true,
  modifiers: [
    { property: "size", prefix: "vf-label--" },
    { property: "tone", prefix: "vf-text--", omitValue: "default" },
  ],
});
export const VyrnForgeCodeTextElement = createVyrnForgeDisplayElement({
  baseClass: "vf-code-text",
  defaults: { tone: "default" },
  modifiers: [{ property: "tone", prefix: "vf-text--", omitValue: "default" }],
});
export const VyrnForgeBadgeElement = createVyrnForgeDisplayElement({
  baseClass: "vf-badge",
  defaults: { size: "md", tone: "subtle", variant: "neutral" },
  modifiers: [
    { property: "variant", prefix: "vf-badge--" },
    { property: "size", prefix: "vf-badge--" },
    { property: "tone", prefix: "vf-badge--" },
  ],
});
export const VyrnForgeCardElement = createVyrnForgeDisplayElement({
  baseClass: "vf-card",
  defaults: { padding: "md", variant: "bordered" },
  modifiers: [
    { property: "variant", prefix: "vf-card--" },
    { property: "padding", prefix: "vf-card--padding-" },
  ],
});
export const VyrnForgePanelElement = createVyrnForgeDisplayElement({
  baseClass: "vf-panel",
  role: "region",
});
export const VyrnForgeStackElement = createVyrnForgeDisplayElement({
  baseClass: "vf-stack",
  defaults: { align: "stretch", gap: "md", justify: "start" },
  modifiers: [
    { property: "gap", prefix: "vf-stack--gap-" },
    { property: "align", prefix: "vf-stack--align-" },
    { property: "justify", prefix: "vf-stack--justify-" },
  ],
});
export const VyrnForgeInlineElement = createVyrnForgeDisplayElement({
  baseClass: "vf-inline",
  defaults: { align: "center", gap: "sm", justify: "start", wrap: true },
  modifiers: [
    { property: "gap", prefix: "vf-inline--gap-" },
    { property: "align", prefix: "vf-inline--align-" },
    { property: "justify", prefix: "vf-inline--justify-" },
    { property: "wrap", prefix: "", truthyClass: "vf-inline--wrap" },
  ],
});
export const VyrnForgePageElement = createVyrnForgeDisplayElement({
  baseClass: "vf-page",
  defaults: { density: "standard", maxWidth: "lg" },
  role: "main",
  modifiers: [
    { property: "maxWidth", prefix: "vf-page--max-" },
    { property: "density", prefix: "vf-page--" },
  ],
});
export const VyrnForgeSectionElement = createVyrnForgeDisplayElement({
  baseClass: "vf-section",
  role: "region",
});
export const VyrnForgeEmptyStateElement = createVyrnForgeDisplayElement({
  baseClass: "vf-empty-state",
  role: "status",
});
export const VyrnForgeLoadingStateElement = createVyrnForgeDisplayElement({
  baseClass: "vf-loading-state",
  role: "status",
});
export const VyrnForgeErrorStateElement = createVyrnForgeDisplayElement({
  baseClass: "vf-alert",
  defaults: { tone: "danger" },
  role: "alert",
  modifiers: [{ property: "tone", prefix: "vf-alert--" }],
});
