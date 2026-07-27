import {
  createNumericValueController,
  createToggleGroupController,
} from "@vyrnforge/ui-behaviors";
import {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormStateRestoreMode,
} from "../base/VyrnForgeFormAssociatedElement";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { createVyrnForgeActionElement } from "./actions";
import { VyrnForgeDomElement } from "./dom";

export const VyrnForgeToggleButtonElement = createVyrnForgeActionElement({
  baseClass: "vf-toggle-button",
  defaultSize: "md",
  toggle: true,
});

export class VyrnForgeSliderElement extends VyrnForgeFormAssociatedElement<string> {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      label: { reflect: true, type: "string" },
      max: { reflect: true, type: "number" },
      min: { reflect: true, type: "number" },
      showValue: { attribute: "show-value", reflect: true, type: "boolean" },
      step: { reflect: true, type: "number" },
      value: { reflect: true, type: "number" },
    });

  #input: HTMLInputElement | null = null;
  #output: HTMLOutputElement | null = null;
  readonly #controller = createNumericValueController();

  get label(): string {
    return this.getPropertyValue("label", "");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get max(): number {
    return this.getPropertyValue("max", 100);
  }
  set max(value: number) {
    this.setPropertyValue("max", Number(value));
  }

  get min(): number {
    return this.getPropertyValue("min", 0);
  }
  set min(value: number) {
    this.setPropertyValue("min", Number(value));
  }

  get showValue(): boolean {
    return this.getPropertyValue("showValue", false);
  }
  set showValue(value: boolean) {
    this.setPropertyValue("showValue", Boolean(value));
  }

  get step(): number {
    return this.getPropertyValue("step", 1);
  }
  set step(value: number) {
    this.setPropertyValue("step", Number(value));
  }

  get value(): number {
    return this.getPropertyValue("value", this.min);
  }
  set value(value: number) {
    this.#controller.setRange({
      min: this.min,
      max: this.max,
      step: this.step,
    });
    this.setPropertyValue("value", this.#controller.normalize(Number(value)));
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }

  protected override connected(): void {
    this.captureInitialFormState(String(this.value));
    this.ensureControl();
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.handleInput);
    this.#input?.removeEventListener("change", this.handleChange);
  }

  protected override resetFormState(state: string | undefined): void {
    this.value = Number(state ?? this.min);
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.value = Number(state);
  }

  protected override update(): void {
    const input = this.ensureControl();
    if (!input) return;
    this.#controller.setRange({
      min: this.min,
      max: this.max,
      step: this.step,
    });
    this.#controller.syncNumber(this.value);
    const value = this.#controller.getSnapshot().value;
    input.min = String(this.min);
    input.max = String(this.max);
    input.step = String(this.step);
    input.value = String(value);
    input.disabled = this.effectiveDisabled;
    input.required = this.required;
    input.setAttribute("aria-label", this.label || "Value");
    if (this.#output) {
      this.#output.hidden = !this.showValue;
      this.#output.value = String(value);
      this.#output.textContent = String(value);
    }
    this.setFormValue(String(value), String(value));
    this.setValidity();
    this.dataset.value = String(value);
    this.setAttribute("data-vf-element", "");
  }

  private ensureControl(): HTMLInputElement | null {
    if (this.#input?.isConnected) return this.#input;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return null;
    const existing = this.querySelector<HTMLInputElement>(
      "[data-vf-slider-control]",
    );
    const input = existing ?? document.createElement("input");
    input.type = "range";
    input.className = "vf-slider__control";
    input.dataset.vfSliderControl = "";
    input.addEventListener("input", this.handleInput);
    input.addEventListener("change", this.handleChange);
    if (!existing) {
      this.classList.add("vf-slider");
      this.append(input);
      const output = document.createElement("output");
      output.className = "vf-slider__value";
      output.dataset.vfSliderOutput = "";
      this.append(output);
      this.#output = output;
    } else {
      this.#output = this.querySelector<HTMLOutputElement>(
        "[data-vf-slider-output]",
      );
    }
    this.#input = input;
    return input;
  }

  private commit(value: number, reason: "change" | "input"): void {
    const previousValue = this.value;
    this.#controller.setRange({
      min: this.min,
      max: this.max,
      step: this.step,
    });
    this.#controller.syncNumber(previousValue);
    this.#controller.setNumber(value, "user");
    this.value = this.#controller.getSnapshot().value;
    if (previousValue === this.value) return;
    this.dispatchEvent(
      new CustomEvent("vf-value-change", {
        bubbles: true,
        composed: true,
        detail: { previousValue, reason, value: this.value },
      }),
    );
  }

  private readonly handleInput = (event: Event) => {
    this.commit(
      (event.currentTarget as HTMLInputElement).valueAsNumber,
      "input",
    );
  };

  private readonly handleChange = (event: Event) => {
    this.commit(
      (event.currentTarget as HTMLInputElement).valueAsNumber,
      "change",
    );
  };
}

export class VyrnForgeRatingElement extends VyrnForgeFormAssociatedElement<string> {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      allowClear: { attribute: "allow-clear", reflect: true, type: "boolean" },
      label: { reflect: true, type: "string" },
      max: { reflect: true, type: "number" },
      readOnly: { attribute: "readonly", reflect: true, type: "boolean" },
      value: { reflect: true, type: "number" },
    });

  readonly #controller = createNumericValueController({
    min: 0,
    max: 5,
    step: 1,
  });

  get allowClear(): boolean {
    return this.getPropertyValue("allowClear", false);
  }
  set allowClear(value: boolean) {
    this.setPropertyValue("allowClear", Boolean(value));
  }

  get label(): string {
    return this.getPropertyValue("label", "Rating");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get max(): number {
    return this.getPropertyValue("max", 5);
  }
  set max(value: number) {
    this.setPropertyValue("max", Math.max(1, Math.round(value)));
  }

  get readOnly(): boolean {
    return this.getPropertyValue("readOnly", false);
  }
  set readOnly(value: boolean) {
    this.setPropertyValue("readOnly", Boolean(value));
  }

  get value(): number {
    return this.getPropertyValue("value", 0);
  }
  set value(value: number) {
    this.#controller.setRange({ min: 0, max: this.max, step: 1, precision: 0 });
    this.setPropertyValue("value", this.#controller.normalize(Number(value)));
  }

  protected override connected(): void {
    this.captureInitialFormState(String(this.value));
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  protected override resetFormState(state: string | undefined): void {
    this.value = Number(state ?? 0);
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.value = Number(state);
  }

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    this.className = "vf-rating";
    this.setAttribute("role", "radiogroup");
    this.setAttribute("aria-label", this.label);
    this.replaceChildren();
    for (let candidate = 1; candidate <= this.max; candidate += 1) {
      const button = document.createElement("button");
      button.className = [
        "vf-rating__item",
        candidate <= this.value && "vf-rating__item--selected",
      ]
        .filter(Boolean)
        .join(" ");
      button.type = "button";
      button.dataset.value = String(candidate);
      button.disabled = this.effectiveDisabled || this.readOnly;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(candidate === this.value));
      button.setAttribute("aria-label", `${candidate} of ${this.max}`);
      button.textContent = candidate <= this.value ? "★" : "☆";
      this.append(button);
    }
    this.setFormValue(
      this.value > 0 ? String(this.value) : null,
      String(this.value),
    );
    this.setValidity(
      this.required && this.value === 0 ? { valueMissing: true } : {},
      this.required && this.value === 0 ? "Choose a rating." : "",
    );
    this.dataset.value = String(this.value);
    this.setAttribute("data-vf-element", "");
  }

  private commit(value: number, reason: "keyboard" | "pointer"): void {
    if (this.effectiveDisabled || this.readOnly) return;
    const previousValue = this.value;
    const nextValue = this.allowClear && value === previousValue ? 0 : value;
    this.value = nextValue;
    if (previousValue === this.value) return;
    this.dispatchEvent(
      new CustomEvent("vf-value-change", {
        bubbles: true,
        composed: true,
        detail: { previousValue, reason, value: this.value },
      }),
    );
  }

  private readonly handleClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-value]",
    );
    if (button) this.commit(Number(button.dataset.value), "pointer");
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    this.commit(this.value + (event.key === "ArrowRight" ? 1 : -1), "keyboard");
  };
}

export type VyrnForgeToggleGroupType = "multiple" | "single";
export type VyrnForgeToggleGroupValue = readonly string[] | string;

export class VyrnForgeToggleButtonGroupElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      disabled: { reflect: true, type: "boolean" },
      orientation: { reflect: true, type: "string" },
      type: { reflect: true, type: "string" },
      value: { attribute: false },
    });

  #controller = createToggleGroupController();

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.setPropertyValue("disabled", Boolean(value));
  }

  get orientation(): "horizontal" | "vertical" {
    return this.getPropertyValue("orientation", "horizontal");
  }
  set orientation(value: "horizontal" | "vertical") {
    this.setPropertyValue("orientation", value);
  }

  get type(): VyrnForgeToggleGroupType {
    return this.getPropertyValue("type", "single");
  }
  set type(value: VyrnForgeToggleGroupType) {
    this.#controller = createToggleGroupController({
      type: value,
      value: this.value,
    });
    this.setPropertyValue("type", value);
  }

  get value(): VyrnForgeToggleGroupValue {
    return this.getPropertyValue<VyrnForgeToggleGroupValue>(
      "value",
      this.type === "multiple" ? [] : "",
    );
  }
  set value(value: VyrnForgeToggleGroupValue) {
    this.#controller.syncValue(value);
    this.setPropertyValue(
      "value",
      Array.isArray(value) ? Object.freeze([...value]) : value,
    );
  }

  protected override connected(): void {
    this.addEventListener("vf-pressed-change", this.handlePressedChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("vf-pressed-change", this.handlePressedChange);
  }

  protected override update(): void {
    this.applyManagedClasses([
      "vf-toggle-button-group",
      `vf-toggle-button-group--${this.orientation}`,
    ]);
    this.setAttribute("role", "group");
    this.setAttribute("aria-orientation", this.orientation);
    const selected = new Set(
      Array.isArray(this.value) ? this.value : [this.value],
    );
    for (const button of this.buttons) {
      button.groupDisabled = this.disabled;
      button.pressed = selected.has(button.value);
    }
    this.setAttribute("data-vf-element", "");
  }

  private get buttons(): Array<
    InstanceType<typeof VyrnForgeToggleButtonElement>
  > {
    return [
      ...this.querySelectorAll<
        InstanceType<typeof VyrnForgeToggleButtonElement>
      >("vf-toggle-button"),
    ];
  }

  private readonly handlePressedChange = (event: Event) => {
    const button = event.target as InstanceType<
      typeof VyrnForgeToggleButtonElement
    >;
    if (
      this.disabled ||
      button.localName !== "vf-toggle-button" ||
      !button.value
    )
      return;
    this.#controller = createToggleGroupController({
      type: this.type,
      value: this.value,
    });
    if (button.pressed) this.#controller.select(button.value, "selection");
    else this.#controller.deselect(button.value, "selection");
    const previousValue = this.value;
    this.value = this.#controller.getValue();
    this.dispatchTypedEvent("vf-value-change", {
      previousValue,
      reason: "selection",
      value: this.value,
    });
  };
}

export interface VyrnForgeSegmentedControlOption {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
}

export class VyrnForgeSegmentedControlElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      label: { reflect: true, type: "string" },
      options: { attribute: false },
      size: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
    });

  get label(): string {
    return this.getPropertyValue("label", "Options");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get options(): readonly VyrnForgeSegmentedControlOption[] {
    return this.getPropertyValue<readonly VyrnForgeSegmentedControlOption[]>(
      "options",
      [],
    );
  }
  set options(value: readonly VyrnForgeSegmentedControlOption[]) {
    this.setPropertyValue("options", Object.freeze([...value]));
  }

  get size(): "sm" | "md" {
    return this.getPropertyValue("size", "md");
  }
  set size(value: "sm" | "md") {
    this.setPropertyValue("size", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  protected override connected(): void {
    this.addEventListener("click", this.handleClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleClick);
  }

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    this.className = `vf-segmented-control vf-segmented-control--${this.size}`;
    this.setAttribute("role", "radiogroup");
    this.setAttribute("aria-label", this.label);
    this.replaceChildren();
    for (const option of this.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "vf-segmented-control__item",
        option.value === this.value && "vf-segmented-control__item--active",
      ]
        .filter(Boolean)
        .join(" ");
      button.dataset.value = option.value;
      button.disabled = option.disabled === true;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(option.value === this.value));
      button.textContent = option.label;
      this.append(button);
    }
    this.setAttribute("data-vf-element", "");
  }

  private readonly handleClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-value]",
    );
    if (!button || button.disabled) return;
    const previousValue = this.value;
    this.value = button.dataset.value ?? "";
    if (previousValue === this.value) return;
    this.dispatchTypedEvent("vf-value-change", {
      previousValue,
      reason: "selection",
      value: this.value,
    });
  };
}
