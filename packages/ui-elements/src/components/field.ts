import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

let fieldSequence = 0;

export type VyrnForgeValidationTone =
  "danger" | "error" | "info" | "success" | "warning";

export class VyrnForgeValidationMessageElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({ tone: { reflect: true, type: "string" } });

  get tone(): VyrnForgeValidationTone {
    return this.getPropertyValue("tone", "error");
  }
  set tone(value: VyrnForgeValidationTone) {
    this.setPropertyValue("tone", value);
  }

  protected override update(): void {
    const normalizedTone = this.tone === "danger" ? "error" : this.tone;
    this.applyManagedClasses([
      "vf-validation-message",
      `vf-validation-message--${normalizedTone}`,
    ]);
    this.setAttribute("role", normalizedTone === "error" ? "alert" : "status");
    this.setAttribute("data-vf-element", "");
  }
}

export class VyrnForgeFieldElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      description: { reflect: true, type: "string" },
      disabled: { reflect: true, type: "boolean" },
      error: { reflect: true, type: "string" },
      label: { reflect: true, type: "string" },
      message: { reflect: true, type: "string" },
      orientation: { reflect: true, type: "string" },
      required: { reflect: true, type: "boolean" },
      success: { reflect: true, type: "string" },
      warning: { reflect: true, type: "string" },
    });

  #controlContainer: HTMLDivElement | null = null;
  #descriptionElement: HTMLParagraphElement | null = null;
  #labelElement: HTMLLabelElement | null = null;
  #messageElement: InstanceType<
    typeof VyrnForgeValidationMessageElement
  > | null = null;
  readonly #fieldId = `vf-field-${++fieldSequence}`;

  get description(): string {
    return this.getPropertyValue("description", "");
  }
  set description(value: string) {
    this.setPropertyValue("description", value);
  }

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.setPropertyValue("disabled", Boolean(value));
  }

  get error(): string {
    return this.getPropertyValue("error", "");
  }
  set error(value: string) {
    this.setPropertyValue("error", value);
  }

  get label(): string {
    return this.getPropertyValue("label", "");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get message(): string {
    return this.getPropertyValue("message", "");
  }
  set message(value: string) {
    this.setPropertyValue("message", value);
  }

  get orientation(): "horizontal" | "vertical" {
    return this.getPropertyValue("orientation", "vertical");
  }
  set orientation(value: "horizontal" | "vertical") {
    this.setPropertyValue("orientation", value);
  }

  get required(): boolean {
    return this.getPropertyValue("required", false);
  }
  set required(value: boolean) {
    this.setPropertyValue("required", Boolean(value));
  }

  get success(): string {
    return this.getPropertyValue("success", "");
  }
  set success(value: string) {
    this.setPropertyValue("success", value);
  }

  get warning(): string {
    return this.getPropertyValue("warning", "");
  }
  set warning(value: string) {
    this.setPropertyValue("warning", value);
  }

  protected override connected(): void {
    this.ensureScaffold();
  }

  protected override update(): void {
    this.ensureScaffold();
    this.applyManagedClasses([
      "vf-field",
      `vf-field--${this.orientation}`,
      this.disabled && "vf-field--disabled",
      Boolean(this.error) && "vf-field--invalid",
    ]);

    const control = this.resolveControl();
    if (control) {
      if (!control.id) control.id = `${this.#fieldId}-control`;
      if ("disabled" in control) {
        (control as HTMLElement & { disabled: boolean }).disabled =
          this.disabled;
      }
      if ("required" in control) {
        (control as HTMLElement & { required: boolean }).required =
          this.required;
      }
      if ("invalid" in control) {
        (control as HTMLElement & { invalid: boolean }).invalid = Boolean(
          this.error,
        );
      }
      control.setAttribute("aria-required", String(this.required));
      control.setAttribute("aria-invalid", String(Boolean(this.error)));
      const describedBy = [
        this.description ? `${this.#fieldId}-description` : "",
        this.resolveMessage() ? `${this.#fieldId}-message` : "",
      ]
        .filter(Boolean)
        .join(" ");
      if (describedBy) control.setAttribute("aria-describedby", describedBy);
      else control.removeAttribute("aria-describedby");
      if (this.#labelElement) this.#labelElement.htmlFor = control.id;
    }

    if (this.#labelElement) {
      this.#labelElement.textContent = this.required
        ? `${this.label} *`
        : this.label;
      this.#labelElement.hidden = this.label.length === 0;
    }
    if (this.#descriptionElement) {
      this.#descriptionElement.textContent = this.description;
      this.#descriptionElement.hidden = this.description.length === 0;
    }
    if (this.#messageElement) {
      const resolved = this.resolveMessage();
      this.#messageElement.textContent = resolved.text;
      this.#messageElement.tone = resolved.tone;
      this.#messageElement.hidden = resolved.text.length === 0;
    }
    this.setAttribute("data-vf-element", "");
  }

  private ensureScaffold(): void {
    if (this.#controlContainer?.isConnected) return;
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;

    const externalNodes = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element && node.hasAttribute("data-vf-field-internal")
        ),
    );
    const label = document.createElement("label");
    label.className = "vf-field__label";
    label.dataset.vfFieldInternal = "";

    const description = document.createElement("p");
    description.className = "vf-field__description";
    description.dataset.vfFieldInternal = "";
    description.id = `${this.#fieldId}-description`;

    const controlContainer = document.createElement("div");
    controlContainer.className = "vf-field__control";
    controlContainer.dataset.vfFieldInternal = "";
    for (const node of externalNodes) controlContainer.append(node);

    const message = document.createElement(
      "vf-validation-message",
    ) as InstanceType<typeof VyrnForgeValidationMessageElement>;
    message.className = "vf-field__message";
    message.dataset.vfFieldInternal = "";
    message.id = `${this.#fieldId}-message`;

    this.replaceChildren(label, description, controlContainer, message);
    this.#labelElement = label;
    this.#descriptionElement = description;
    this.#controlContainer = controlContainer;
    this.#messageElement = message;
  }

  private resolveControl(): HTMLElement | null {
    return (
      this.#controlContainer?.querySelector<HTMLElement>(
        "vf-text-input, vf-textarea, vf-search-input, vf-number-input, vf-date-input, vf-datetime-input, vf-checkbox, vf-radio, vf-switch, vf-select, vf-slider, vf-rating, input, textarea, select",
      ) ?? null
    );
  }

  private resolveMessage(): { text: string; tone: VyrnForgeValidationTone } {
    if (this.error) return { text: this.error, tone: "error" };
    if (this.warning) return { text: this.warning, tone: "warning" };
    if (this.success) return { text: this.success, tone: "success" };
    return { text: this.message, tone: "info" };
  }
}
