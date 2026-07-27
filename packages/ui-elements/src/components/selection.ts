import { resolveToggleInputState } from "@vyrnforge/ui-behaviors";
import {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormStateRestoreMode,
} from "../base/VyrnForgeFormAssociatedElement";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export type VyrnForgeChoiceControlKind = "checkbox" | "radio" | "switch";

export interface VyrnForgeChoiceControlConfig {
  readonly kind: VyrnForgeChoiceControlKind;
}

export abstract class VyrnForgeChoiceControlElement extends VyrnForgeFormAssociatedElement<string> {
  static readonly elementConfig: VyrnForgeChoiceControlConfig = {
    kind: "checkbox",
  };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      checked: { reflect: true, type: "boolean" },
      groupDisabled: { attribute: false },
      indeterminate: { reflect: true, type: "boolean" },
      invalid: { reflect: true, type: "boolean" },
      label: { reflect: true, type: "string" },
      readOnly: { attribute: "readonly", reflect: true, type: "boolean" },
      size: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
    });

  #input: HTMLInputElement | null = null;
  #labelText: HTMLElement | null = null;

  get checked(): boolean {
    return this.getPropertyValue("checked", false);
  }
  set checked(value: boolean) {
    this.setPropertyValue("checked", Boolean(value));
  }

  get groupDisabled(): boolean {
    return this.getPropertyValue("groupDisabled", false);
  }
  set groupDisabled(value: boolean) {
    this.setPropertyValue("groupDisabled", Boolean(value));
  }

  get indeterminate(): boolean {
    return this.getPropertyValue("indeterminate", false);
  }
  set indeterminate(value: boolean) {
    this.setPropertyValue("indeterminate", Boolean(value));
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

  get readOnly(): boolean {
    return this.getPropertyValue("readOnly", false);
  }
  set readOnly(value: boolean) {
    this.setPropertyValue("readOnly", Boolean(value));
  }

  get size(): "sm" | "md" | "lg" {
    return this.getPropertyValue("size", "md");
  }
  set size(value: "sm" | "md" | "lg") {
    this.setPropertyValue("size", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "on");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }

  protected override connected(): void {
    this.captureInitialFormState(this.checked ? "true" : "false");
    this.ensureInput();
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("change", this.handleChange);
  }

  protected override resetFormState(state: string | undefined): void {
    this.checked = state === "true";
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.checked = state === "true";
  }

  protected override update(): void {
    const input = this.ensureInput();
    if (!input) return;

    const config = this.elementConfig;
    const state = resolveToggleInputState({
      checked: this.checked,
      disabled: this.effectiveDisabled || this.groupDisabled,
      readOnly: this.readOnly,
    });
    input.checked = state.checked === true;
    input.disabled = state.disabled;
    input.required = this.required;
    input.readOnly = this.readOnly;
    input.value = this.value;
    input.indeterminate = config.kind === "checkbox" && this.indeterminate;
    input.setAttribute("aria-invalid", String(this.invalid));
    if (config.kind === "switch") input.setAttribute("role", "switch");
    else input.removeAttribute("role");

    if (config.kind === "checkbox") {
      input.className = `vf-checkbox vf-checkbox--${this.size}`;
    } else if (config.kind === "radio") {
      input.className = "vf-radio";
    } else {
      input.className = "vf-switch__input";
    }
    if (this.#labelText) this.#labelText.textContent = this.label;

    const checked = input.checked;
    this.setFormValue(checked ? this.value : null, checked ? "true" : "false");
    this.setValidity(
      this.required && !checked ? { valueMissing: true } : {},
      this.required && !checked ? "This option is required." : "",
      input,
    );
    this.dataset.checked = String(checked);
    this.dataset.disabled = String(
      this.effectiveDisabled || this.groupDisabled,
    );
    this.setAttribute("data-vf-element", "");
  }

  private get elementConfig(): VyrnForgeChoiceControlConfig {
    return (this.constructor as typeof VyrnForgeChoiceControlElement)
      .elementConfig;
  }

  private ensureInput(): HTMLInputElement | null {
    if (this.#input?.isConnected) return this.#input;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return null;

    const config = this.elementConfig;
    const existing = this.querySelector<HTMLInputElement>(
      "[data-vf-choice-control]",
    );
    const input = existing ?? document.createElement("input");
    input.dataset.vfChoiceControl = "";
    input.type = config.kind === "switch" ? "checkbox" : config.kind;
    input.addEventListener("change", this.handleChange);

    if (!existing) {
      const label = document.createElement("label");
      if (config.kind === "checkbox") label.className = "vf-checkbox-field";
      else if (config.kind === "radio") label.className = "vf-radio-field";
      else label.className = "vf-switch";
      label.append(input);

      if (config.kind === "switch") {
        const control = document.createElement("span");
        control.className = "vf-switch__control";
        const thumb = document.createElement("span");
        thumb.className = "vf-switch__thumb";
        control.append(thumb);
        label.append(control);
      }

      const labelText = document.createElement("span");
      labelText.className =
        config.kind === "switch"
          ? "vf-switch__label"
          : config.kind === "radio"
            ? "vf-radio-field__label"
            : "vf-checkbox-field__label";
      label.append(labelText);
      this.replaceChildren(label);
      this.#labelText = labelText;
    } else {
      this.#labelText = this.querySelector(
        ".vf-switch__label, .vf-radio-field__label, .vf-checkbox-field__label",
      );
    }

    this.#input = input;
    return input;
  }

  private readonly handleChange = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    if (this.readOnly) {
      input.checked = this.checked;
      return;
    }

    if (this.elementConfig.kind === "radio" && input.checked && this.name) {
      const document = this.ownerDocument ?? globalThis.document;
      for (const candidate of document?.querySelectorAll<VyrnForgeChoiceControlElement>(
        "vf-radio",
      ) ?? []) {
        if (candidate !== this && candidate.name === this.name) {
          candidate.checked = false;
        }
      }
    }

    const previousChecked = this.checked;
    this.checked = input.checked;
    if (previousChecked === this.checked) return;
    this.dispatchEvent(
      new CustomEvent("vf-checked-change", {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.indeterminate ? "mixed" : this.checked,
          reason: "user",
        },
      }),
    );
    this.dispatchEvent(
      new CustomEvent("vf-value-change", {
        bubbles: true,
        composed: true,
        detail: {
          previousValue: previousChecked,
          reason: "user",
          value: this.checked,
        },
      }),
    );
  };
}

export interface VyrnForgeChoiceControlElementConstructor {
  new (): VyrnForgeChoiceControlElement;
  readonly elementConfig: VyrnForgeChoiceControlConfig;
}

export function createVyrnForgeChoiceControlElement(
  config: VyrnForgeChoiceControlConfig,
): VyrnForgeChoiceControlElementConstructor {
  return class extends VyrnForgeChoiceControlElement {
    static override readonly elementConfig = Object.freeze(config);
  };
}

export const VyrnForgeCheckboxElement = createVyrnForgeChoiceControlElement({
  kind: "checkbox",
});
export const VyrnForgeRadioElement = createVyrnForgeChoiceControlElement({
  kind: "radio",
});
export const VyrnForgeSwitchElement = createVyrnForgeChoiceControlElement({
  kind: "switch",
});

export interface VyrnForgeSelectOption {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
}

export class VyrnForgeSelectElement extends VyrnForgeFormAssociatedElement<string> {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      invalid: { reflect: true, type: "boolean" },
      options: { attribute: false },
      placeholder: { reflect: true, type: "string" },
      size: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
    });

  #select: HTMLSelectElement | null = null;

  get invalid(): boolean {
    return this.getPropertyValue("invalid", false);
  }
  set invalid(value: boolean) {
    this.setPropertyValue("invalid", Boolean(value));
  }

  get options(): readonly VyrnForgeSelectOption[] {
    return this.getPropertyValue<readonly VyrnForgeSelectOption[]>(
      "options",
      [],
    );
  }
  set options(value: readonly VyrnForgeSelectOption[]) {
    this.setPropertyValue("options", Object.freeze([...value]));
  }

  get placeholder(): string {
    return this.getPropertyValue("placeholder", "");
  }
  set placeholder(value: string) {
    this.setPropertyValue("placeholder", value);
  }

  get size(): "sm" | "md" | "lg" {
    return this.getPropertyValue("size", "md");
  }
  set size(value: "sm" | "md" | "lg") {
    this.setPropertyValue("size", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  override focus(options?: FocusOptions): void {
    this.#select?.focus(options);
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value);
    this.ensureSelect();
  }

  protected override disconnected(): void {
    this.#select?.removeEventListener("change", this.handleChange);
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
    const select = this.ensureSelect();
    if (!select) return;
    this.renderOptions(select);
    select.className = [
      "vf-select",
      `vf-select--${this.size}`,
      this.invalid && "vf-select--invalid",
    ]
      .filter(Boolean)
      .join(" ");
    select.disabled = this.effectiveDisabled;
    select.required = this.required;
    select.value = this.value;
    select.setAttribute("aria-invalid", String(this.invalid));

    const missing = this.required && this.value.length === 0;
    this.setFormValue(this.value, this.value);
    this.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? "Select a value." : "",
      select,
    );
    this.dataset.value = this.value;
    this.setAttribute("data-vf-element", "");
  }

  private ensureSelect(): HTMLSelectElement | null {
    if (this.#select?.isConnected) return this.#select;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return null;
    const existing = this.querySelector<HTMLSelectElement>(
      "[data-vf-select-control]",
    );
    const select = existing ?? document.createElement("select");
    select.dataset.vfSelectControl = "";
    select.addEventListener("change", this.handleChange);
    if (!existing) {
      const directOptions = [...this.children].filter(
        (child): child is HTMLOptionElement =>
          child instanceof HTMLOptionElement,
      );
      for (const option of directOptions) select.append(option);
      this.append(select);
    }
    this.#select = select;
    return select;
  }

  private renderOptions(select: HTMLSelectElement): void {
    if (this.options.length === 0) return;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    select.replaceChildren();
    if (this.placeholder) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = this.placeholder;
      option.disabled = this.required;
      select.append(option);
    }
    for (const item of this.options) {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      option.disabled = item.disabled === true;
      select.append(option);
    }
  }

  private readonly handleChange = (event: Event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    const previousValue = this.value;
    if (value === previousValue) return;
    this.value = value;
    this.dispatchEvent(
      new CustomEvent("vf-value-change", {
        bubbles: true,
        composed: true,
        detail: { previousValue, reason: "selection", value },
      }),
    );
  };
}

export class VyrnForgeRadioGroupElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      disabled: { reflect: true, type: "boolean" },
      label: { reflect: true, type: "string" },
      orientation: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
    });

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.setPropertyValue("disabled", Boolean(value));
  }

  get label(): string {
    return this.getPropertyValue("label", "");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get orientation(): "horizontal" | "vertical" {
    return this.getPropertyValue("orientation", "vertical");
  }
  set orientation(value: "horizontal" | "vertical") {
    this.setPropertyValue("orientation", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  protected override connected(): void {
    this.addEventListener("vf-checked-change", this.handleCheckedChange);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  protected override disconnected(): void {
    this.removeEventListener("vf-checked-change", this.handleCheckedChange);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  protected override update(): void {
    this.applyManagedClasses([
      "vf-radio-group",
      `vf-radio-group--${this.orientation}`,
      this.disabled && "vf-radio-group--disabled",
    ]);
    this.setAttribute("role", "radiogroup");
    if (this.label) this.setAttribute("aria-label", this.label);
    this.setAttribute("aria-disabled", String(this.disabled));
    for (const radio of this.radios) {
      radio.groupDisabled = this.disabled;
      radio.checked = radio.value === this.value;
    }
    this.setAttribute("data-vf-element", "");
  }

  private get radios(): VyrnForgeChoiceControlElement[] {
    return [
      ...this.querySelectorAll<VyrnForgeChoiceControlElement>("vf-radio"),
    ];
  }

  private readonly handleCheckedChange = (event: Event) => {
    const radio = event.target as VyrnForgeChoiceControlElement;
    if (this.disabled || radio.localName !== "vf-radio" || !radio.checked)
      return;
    const previousValue = this.value;
    this.value = radio.value;
    for (const candidate of this.radios) {
      if (candidate !== radio) candidate.checked = false;
    }
    if (previousValue !== this.value) {
      this.dispatchTypedEvent("vf-value-change", {
        previousValue,
        reason: "selection",
        value: this.value,
      });
    }
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (
      this.disabled ||
      !["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.key)
    )
      return;
    const enabled = this.radios.filter((radio) => !radio.disabled);
    if (enabled.length === 0) return;
    const current = enabled.indexOf(
      event.target as VyrnForgeChoiceControlElement,
    );
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next =
      enabled[(current + direction + enabled.length) % enabled.length];
    if (!next) return;
    event.preventDefault();
    next.checked = true;
    next.focus();
    next.dispatchEvent(
      new CustomEvent("vf-checked-change", {
        bubbles: true,
        composed: true,
        detail: { checked: true, reason: "keyboard" },
      }),
    );
  };
}
