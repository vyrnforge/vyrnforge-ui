import { normalizeNumericValue } from "@vyrnforge/ui-behaviors";
import {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormStateRestoreMode,
} from "../base/VyrnForgeFormAssociatedElement";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";

export type VyrnForgeInputSize = "sm" | "md" | "lg";
export type VyrnForgeTextControlKind =
  "date" | "datetime-local" | "number" | "search" | "text" | "textarea";

export interface VyrnForgeTextControlConfig {
  readonly kind: VyrnForgeTextControlKind;
  readonly baseClass?: string;
}

export abstract class VyrnForgeTextControlElement extends VyrnForgeFormAssociatedElement<string> {
  static readonly elementConfig: VyrnForgeTextControlConfig = { kind: "text" };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      autocomplete: { reflect: true, type: "string" },
      invalid: { reflect: true, type: "boolean" },
      label: { reflect: true, type: "string" },
      max: { reflect: true, type: "number" },
      min: { reflect: true, type: "number" },
      mode: { reflect: true, type: "string" },
      placeholder: { reflect: true, type: "string" },
      readOnly: { attribute: "readonly", reflect: true, type: "boolean" },
      size: { reflect: true, type: "string" },
      step: { reflect: true, type: "number" },
      value: { reflect: true, type: "string" },
    });

  #control: HTMLInputElement | HTMLTextAreaElement | null = null;

  get autocomplete(): string {
    return this.getPropertyValue("autocomplete", "");
  }
  set autocomplete(value: string) {
    this.setPropertyValue("autocomplete", value);
  }

  get invalid(): boolean {
    return this.getPropertyValue("invalid", false);
  }
  set invalid(value: boolean) {
    this.setPropertyValue("invalid", Boolean(value));
  }

  get label(): string {
    return this.getPropertyValue("label", "");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get max(): number | null {
    return this.getPropertyValue<number | null>("max", null);
  }
  set max(value: number | null) {
    this.setPropertyValue("max", value);
  }

  get min(): number | null {
    return this.getPropertyValue<number | null>("min", null);
  }
  set min(value: number | null) {
    this.setPropertyValue("min", value);
  }

  get mode(): "decimal" | "integer" {
    return this.getPropertyValue("mode", "decimal");
  }
  set mode(value: "decimal" | "integer") {
    this.setPropertyValue("mode", value);
  }

  get placeholder(): string {
    return this.getPropertyValue("placeholder", "");
  }
  set placeholder(value: string) {
    this.setPropertyValue("placeholder", value);
  }

  get readOnly(): boolean {
    return this.getPropertyValue("readOnly", false);
  }
  set readOnly(value: boolean) {
    this.setPropertyValue("readOnly", Boolean(value));
  }

  get size(): VyrnForgeInputSize {
    return this.getPropertyValue("size", "md");
  }
  set size(value: VyrnForgeInputSize) {
    this.setPropertyValue("size", value);
  }

  get step(): number | null {
    return this.getPropertyValue<number | null>("step", null);
  }
  set step(value: number | null) {
    this.setPropertyValue("step", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    const nextValue = String(value);
    if (!this.setPropertyValue("value", nextValue)) return;
    this.syncFormContract(nextValue, this.#control);
  }

  get valueAsNumber(): number | null {
    if (this.value === "") return null;
    const value = Number(this.value);
    return Number.isFinite(value) ? value : null;
  }

  override focus(options?: FocusOptions): void {
    this.#control?.focus(options);
  }

  select(): void {
    this.#control?.select();
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value);
    const control = this.ensureControl();
    if (control) this.bindControlEvents(control);
  }

  protected override disconnected(): void {
    if (this.#control) this.unbindControlEvents(this.#control);
  }

  protected override resetFormState(state: string | undefined): void {
    this.value = state ?? "";
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.value = state;
  }

  protected override update(): void {
    const control = this.ensureControl();
    if (!control) return;

    control.className = [
      this.elementConfig.baseClass ?? "vf-input",
      `vf-input--${this.size}`,
      this.invalid && "vf-input--invalid",
    ]
      .filter(Boolean)
      .join(" ");
    control.value = this.value;
    control.disabled = this.effectiveDisabled;
    control.required = this.required;
    control.readOnly = this.readOnly;
    control.placeholder = this.placeholder;
    if (this.autocomplete)
      control.setAttribute("autocomplete", this.autocomplete);
    else control.removeAttribute("autocomplete");
    control.setAttribute("aria-invalid", String(this.invalid));
    const accessibleLabel =
      this.label ||
      Array.from(this.labels ?? [])
        .map((label) => label.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
    if (accessibleLabel) control.setAttribute("aria-label", accessibleLabel);
    else control.removeAttribute("aria-label");

    if (control instanceof HTMLInputElement) {
      control.type =
        this.elementConfig.kind === "textarea"
          ? "text"
          : this.elementConfig.kind;
      control.inputMode =
        this.elementConfig.kind === "number"
          ? this.mode === "integer"
            ? "numeric"
            : "decimal"
          : "";
      this.syncNumberAttribute(control, "min", this.min);
      this.syncNumberAttribute(control, "max", this.max);
      this.syncNumberAttribute(control, "step", this.step);
    }

    this.syncFormContract(this.value, control);
    this.dataset.value = this.value;
    this.dataset.disabled = String(this.effectiveDisabled);
    this.setAttribute("data-vf-element", "");
  }

  private get elementConfig(): VyrnForgeTextControlConfig {
    return (this.constructor as typeof VyrnForgeTextControlElement)
      .elementConfig;
  }

  private ensureControl(): HTMLInputElement | HTMLTextAreaElement | null {
    if (this.#control?.isConnected) return this.#control;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return null;

    const selector = "[data-vf-input-control]";
    const existing = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      selector,
    );
    const control =
      existing ??
      (this.elementConfig.kind === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input"));
    control.dataset.vfInputControl = "";
    if (!existing) this.append(control);
    this.#control = control;
    return control;
  }

  private bindControlEvents(
    control: HTMLInputElement | HTMLTextAreaElement,
  ): void {
    this.unbindControlEvents(control);
    control.addEventListener("input", this.handleInput);
    control.addEventListener("change", this.handleChange);
  }

  private unbindControlEvents(
    control: HTMLInputElement | HTMLTextAreaElement,
  ): void {
    control.removeEventListener("input", this.handleInput);
    control.removeEventListener("change", this.handleChange);
  }

  private commitControlValue(value: string, reason: "change" | "input"): void {
    let nextValue = value;
    if (this.elementConfig.kind === "number" && value !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        nextValue = String(
          normalizeNumericValue(parsed, {
            ...(this.min === null ? {} : { min: this.min }),
            ...(this.max === null ? {} : { max: this.max }),
            ...(this.step === null ? {} : { step: this.step }),
            alignToStep: reason === "change",
            precision: this.mode === "integer" ? 0 : undefined,
          }),
        );
      }
    }
    const previousValue = this.value;
    if (previousValue === nextValue) return;
    this.value = nextValue;
    this.dispatchEvent(
      new CustomEvent("vf-value-change", {
        bubbles: true,
        composed: true,
        detail: { previousValue, reason, value: nextValue },
      }),
    );
  }

  private syncFormContract(
    value: string,
    control: HTMLInputElement | HTMLTextAreaElement | null,
  ): void {
    const missing = this.required && value.length === 0;
    const badNumber =
      this.elementConfig.kind === "number" &&
      value !== "" &&
      !Number.isFinite(Number(value));

    this.setFormValue(value, value);
    this.setValidity(
      missing ? { valueMissing: true } : badNumber ? { badInput: true } : {},
      missing
        ? "A value is required."
        : badNumber
          ? "Enter a valid number."
          : "",
      control ?? undefined,
    );
  }

  private syncNumberAttribute(
    control: HTMLInputElement,
    name: "max" | "min" | "step",
    value: number | null,
  ): void {
    if (value === null || !Number.isFinite(value))
      control.removeAttribute(name);
    else control.setAttribute(name, String(value));
  }

  private readonly handleInput = (event: Event) => {
    this.commitControlValue(
      (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value,
      "input",
    );
  };

  private readonly handleChange = (event: Event) => {
    this.commitControlValue(
      (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value,
      "change",
    );
  };
}

export interface VyrnForgeTextControlElementConstructor {
  new (): VyrnForgeTextControlElement;
  readonly elementConfig: VyrnForgeTextControlConfig;
}

export function createVyrnForgeTextControlElement(
  config: VyrnForgeTextControlConfig,
): VyrnForgeTextControlElementConstructor {
  return class extends VyrnForgeTextControlElement {
    static override readonly elementConfig = Object.freeze(config);
  };
}

export const VyrnForgeTextInputElement = createVyrnForgeTextControlElement({
  kind: "text",
});
export const VyrnForgeTextareaElement = createVyrnForgeTextControlElement({
  baseClass: "vf-textarea",
  kind: "textarea",
});
export const VyrnForgeSearchInputElement = createVyrnForgeTextControlElement({
  kind: "search",
});
export const VyrnForgeNumberInputElement = createVyrnForgeTextControlElement({
  kind: "number",
});
export const VyrnForgeDateInputElement = createVyrnForgeTextControlElement({
  kind: "date",
});
export const VyrnForgeDateTimeInputElement = createVyrnForgeTextControlElement({
  kind: "datetime-local",
});
