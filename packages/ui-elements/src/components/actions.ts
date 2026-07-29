import {
  createToggleController,
  resolveActionState,
} from "@vyrnforge/ui-behaviors";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { interactionReasonFromEvent, VyrnForgeDomElement } from "./dom";

export type VyrnForgeButtonVariant =
  "default" | "primary" | "danger" | "ghost" | "subtle";
export type VyrnForgeButtonSize = "xs" | "sm" | "md" | "lg";
export type VyrnForgeButtonType = "button" | "reset" | "submit";

export interface VyrnForgeActionElementConfig {
  readonly baseClass:
    "vf-button" | "vf-icon-button" | "vf-toolbar-button" | "vf-toggle-button";
  readonly defaultSize: VyrnForgeButtonSize;
  readonly iconOnly?: boolean;
  readonly toggle?: boolean;
}

export abstract class VyrnForgeActionElement extends VyrnForgeDomElement {
  static readonly elementConfig: VyrnForgeActionElementConfig = {
    baseClass: "vf-button",
    defaultSize: "md",
  };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      action: { reflect: true, type: "string" },
      active: { reflect: true, type: "boolean" },
      ariaLabel: { attribute: "aria-label", reflect: true, type: "string" },
      disabled: { reflect: true, type: "boolean" },
      fullWidth: { attribute: "full-width", reflect: true, type: "boolean" },
      groupDisabled: { attribute: false },
      loading: { reflect: true, type: "boolean" },
      pressed: { reflect: true, type: "boolean" },
      size: { reflect: true, type: "string" },
      type: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
      variant: { reflect: true, type: "string" },
    });

  #button: HTMLButtonElement | null = null;
  #content: HTMLSpanElement | null = null;
  #spinner: HTMLSpanElement | null = null;
  readonly #toggle = createToggleController();

  get action(): string {
    return this.getPropertyValue("action", "");
  }
  set action(value: string) {
    this.setPropertyValue("action", value);
  }

  get active(): boolean {
    return this.getPropertyValue("active", false);
  }
  set active(value: boolean) {
    this.setPropertyValue("active", Boolean(value));
  }

  get ariaLabel(): string {
    return this.getPropertyValue("ariaLabel", "");
  }
  set ariaLabel(value: string) {
    this.setPropertyValue("ariaLabel", value);
  }

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.setPropertyValue("disabled", Boolean(value));
  }

  get fullWidth(): boolean {
    return this.getPropertyValue("fullWidth", false);
  }
  set fullWidth(value: boolean) {
    this.setPropertyValue("fullWidth", Boolean(value));
  }

  get groupDisabled(): boolean {
    return this.getPropertyValue("groupDisabled", false);
  }
  set groupDisabled(value: boolean) {
    this.setPropertyValue("groupDisabled", Boolean(value));
  }

  get loading(): boolean {
    return this.getPropertyValue("loading", false);
  }
  set loading(value: boolean) {
    this.setPropertyValue("loading", Boolean(value));
  }

  get pressed(): boolean {
    return this.getPropertyValue("pressed", false);
  }
  set pressed(value: boolean) {
    const normalized = Boolean(value);
    this.#toggle.syncPressed(normalized);
    this.setPropertyValue("pressed", normalized);
  }

  get size(): VyrnForgeButtonSize {
    return this.getPropertyValue("size", this.elementConfig.defaultSize);
  }
  set size(value: VyrnForgeButtonSize) {
    this.setPropertyValue("size", value);
  }

  get type(): VyrnForgeButtonType {
    return this.getPropertyValue("type", "button");
  }
  set type(value: VyrnForgeButtonType) {
    this.setPropertyValue("type", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  get variant(): VyrnForgeButtonVariant {
    return this.getPropertyValue("variant", "default");
  }
  set variant(value: VyrnForgeButtonVariant) {
    this.setPropertyValue("variant", value);
  }

  override focus(options?: FocusOptions): void {
    this.#button?.focus(options);
  }

  protected override connected(): void {
    this.ensureButton();
  }

  protected override disconnected(): void {
    this.#button?.removeEventListener("click", this.handleClick);
  }

  protected override update(): void {
    const button = this.ensureButton();
    if (!button) return;

    const config = this.elementConfig;
    const action = resolveActionState({
      disabled: this.disabled || this.groupDisabled,
      loading: this.loading,
    });
    button.className = [
      config.baseClass,
      `${config.baseClass}--${this.variant}`,
      `${config.baseClass}--${this.size}`,
      this.fullWidth && config.baseClass === "vf-button"
        ? "vf-button--full-width"
        : "",
      this.loading && config.baseClass === "vf-icon-button"
        ? "vf-icon-button--loading"
        : "",
      this.active && config.baseClass === "vf-toolbar-button"
        ? "vf-toolbar-button--active"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    button.disabled = action.disabled;
    button.type = this.type;
    button.value = this.value;
    if (action.ariaBusy === true) button.setAttribute("aria-busy", "true");
    else button.removeAttribute("aria-busy");
    if (this.ariaLabel) button.setAttribute("aria-label", this.ariaLabel);
    else button.removeAttribute("aria-label");
    if (config.toggle)
      button.setAttribute("aria-pressed", String(this.pressed));
    else button.removeAttribute("aria-pressed");

    if (this.#spinner) this.#spinner.hidden = !action.loading;
    if (this.#content)
      this.#content.hidden = action.loading && config.iconOnly === true;
    this.setAttribute("data-vf-element", "");
  }

  private get elementConfig(): VyrnForgeActionElementConfig {
    return (this.constructor as typeof VyrnForgeActionElement).elementConfig;
  }

  private ensureButton(): HTMLButtonElement | null {
    if (this.#button?.isConnected) {
      this.#button.removeEventListener("click", this.handleClick);
      this.#button.addEventListener("click", this.handleClick);
      return this.#button;
    }
    const document = this.resolveDocument();
    if (!document) return null;

    const existing = this.querySelector<HTMLButtonElement>(
      "[data-vf-action-control]",
    );
    const button = existing ?? document.createElement("button");
    button.dataset.vfActionControl = "";
    button.removeEventListener("click", this.handleClick);
    button.addEventListener("click", this.handleClick);

    let spinner = button.querySelector<HTMLSpanElement>(
      "[data-vf-action-spinner]",
    );
    if (!spinner) {
      spinner = document.createElement("span");
      spinner.dataset.vfActionSpinner = "";
      spinner.className = "vf-button__spinner";
      spinner.setAttribute("aria-hidden", "true");
      button.prepend(spinner);
    }

    let content = button.querySelector<HTMLSpanElement>(
      "[data-vf-action-content]",
    );
    if (!content) {
      content = document.createElement("span");
      content.dataset.vfActionContent = "";
      content.className = this.elementConfig.iconOnly
        ? "vf-icon-button__content"
        : "vf-button__label";
      const externalNodes = [...this.childNodes].filter(
        (node) => node !== button,
      );
      for (const node of externalNodes) content.append(node);
      button.append(content);
    }

    if (!existing) this.append(button);
    this.#button = button;
    this.#content = content;
    this.#spinner = spinner;
    return button;
  }

  private readonly handleClick = (event: MouseEvent) => {
    if (this.disabled || this.groupDisabled || this.loading) return;
    const reason = interactionReasonFromEvent(event);
    if (this.elementConfig.toggle) {
      this.#toggle.syncPressed(this.pressed);
      this.#toggle.toggle(reason);
      const previousPressed = this.pressed;
      this.pressed = this.#toggle.isPressed();
      if (previousPressed !== this.pressed) {
        this.dispatchTypedEvent("vf-pressed-change", {
          pressed: this.pressed,
          reason,
        });
      }
    }
    this.dispatchTypedEvent("vf-action", {
      ...(this.action ? { action: this.action } : {}),
      ...(this.value ? { value: this.value } : {}),
      reason,
    });
  };
}

export interface VyrnForgeActionElementConstructor {
  new (): VyrnForgeActionElement;
  readonly elementConfig: VyrnForgeActionElementConfig;
}

export function createVyrnForgeActionElement(
  config: VyrnForgeActionElementConfig,
): VyrnForgeActionElementConstructor {
  return class extends VyrnForgeActionElement {
    static override readonly elementConfig = Object.freeze(config);
  };
}

export const VyrnForgeButtonElement = createVyrnForgeActionElement({
  baseClass: "vf-button",
  defaultSize: "md",
});
export const VyrnForgeIconButtonElement = createVyrnForgeActionElement({
  baseClass: "vf-icon-button",
  defaultSize: "md",
  iconOnly: true,
});
export const VyrnForgeToolbarButtonElement = createVyrnForgeActionElement({
  baseClass: "vf-toolbar-button",
  defaultSize: "sm",
  toggle: true,
});

export class VyrnForgeButtonGroupElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      attached: { reflect: true, type: "boolean" },
      orientation: { reflect: true, type: "string" },
      size: { reflect: true, type: "string" },
    });

  get attached(): boolean {
    return this.getPropertyValue("attached", false);
  }
  set attached(value: boolean) {
    this.setPropertyValue("attached", Boolean(value));
  }

  get orientation(): "horizontal" | "vertical" {
    return this.getPropertyValue("orientation", "horizontal");
  }
  set orientation(value: "horizontal" | "vertical") {
    this.setPropertyValue("orientation", value);
  }

  get size(): "sm" | "md" {
    return this.getPropertyValue("size", "md");
  }
  set size(value: "sm" | "md") {
    this.setPropertyValue("size", value);
  }

  protected override update(): void {
    this.applyManagedClasses([
      "vf-button-group",
      `vf-button-group--${this.orientation}`,
      `vf-button-group--${this.size}`,
      this.attached && "vf-button-group--attached",
    ]);
    this.setAttribute("role", "group");
    this.setAttribute("aria-orientation", this.orientation);
    this.setAttribute("data-vf-element", "");
  }
}
