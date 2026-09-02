import { dispatchVyrnForgeEvent, type VyrnForgeInvalidDetail } from "../events";
import {
  VyrnForgeElement,
  type VyrnForgePropertyDeclarations,
} from "./VyrnForgeElement";

export type VyrnForgeFormAssociationMode = "submitter" | "value";
export type VyrnForgeFormValue = File | FormData | string | null;
export type VyrnForgeFormState = File | FormData | string | null;
export type VyrnForgeFormStateRestoreMode = "autocomplete" | "restore";
export type VyrnForgeValidityFlags = ValidityStateFlags;

export interface VyrnForgeFormInternals {
  readonly form: HTMLFormElement | null;
  readonly labels: NodeList;
  readonly validationMessage: string;
  readonly validity: ValidityState;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setFormValue(value: VyrnForgeFormValue, state?: VyrnForgeFormState): void;
  setValidity(
    flags?: VyrnForgeValidityFlags,
    message?: string,
    anchor?: HTMLElement,
  ): void;
}

const validState = Object.freeze({
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false,
}) satisfies ValidityState;

function createValidityState(flags: VyrnForgeValidityFlags): ValidityState {
  const invalid = Object.values(flags).some(Boolean);
  return Object.freeze({
    ...validState,
    ...flags,
    valid: !invalid,
  });
}

function serializeValidity(validity: ValidityState) {
  return Object.freeze({
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valid: validity.valid,
    valueMissing: validity.valueMissing,
  });
}

/**
 * ElementInternals-backed base for VyrnForge form-associated Custom Elements.
 *
 * Concrete controls own their public value model, rendering, and behavior
 * controller. This base owns the browser form bridge, disabled propagation,
 * validity forwarding, reset/restoration callbacks, and SSR-safe fallback
 * state when ElementInternals is unavailable.
 */
export abstract class VyrnForgeFormAssociatedElement<
  TState extends VyrnForgeFormState = VyrnForgeFormState,
> extends VyrnForgeElement {
  static readonly formAssociated = true;
  static readonly formAssociationMode: VyrnForgeFormAssociationMode = "value";
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      disabled: { reflect: true, type: "boolean" },
      name: { reflect: true, type: "string" },
      required: { reflect: true, type: "boolean" },
    });

  #fallbackValidationMessage = "";
  #fallbackValidity: ValidityState = validState;
  #formDisabled = false;
  #initialFormState: TState | undefined;
  #initialFormStateCaptured = false;
  #internals: VyrnForgeFormInternals | null | undefined;
  #submittedState: VyrnForgeFormState | undefined;
  #submittedValue: VyrnForgeFormValue = null;

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }

  set disabled(value: boolean) {
    const previous = this.effectiveDisabled;
    if (!this.setPropertyValue("disabled", Boolean(value))) return;
    if (previous !== this.effectiveDisabled) {
      this.formDisabledChanged(this.effectiveDisabled);
    }
  }

  get effectiveDisabled(): boolean {
    return this.disabled || this.#formDisabled;
  }

  get form(): HTMLFormElement | null {
    return this.resolveInternals()?.form ?? null;
  }

  get formAssociationMode(): VyrnForgeFormAssociationMode {
    return (this.constructor as typeof VyrnForgeFormAssociatedElement)
      .formAssociationMode;
  }

  get labels(): NodeList | null {
    return this.resolveInternals()?.labels ?? null;
  }

  get name(): string {
    return this.getPropertyValue("name", "");
  }

  set name(value: string) {
    this.setPropertyValue("name", value);
  }

  get required(): boolean {
    return this.getPropertyValue("required", false);
  }

  set required(value: boolean) {
    this.setPropertyValue("required", Boolean(value));
  }

  get validationMessage(): string {
    return (
      this.resolveInternals()?.validationMessage ??
      this.#fallbackValidationMessage
    );
  }

  get validity(): ValidityState {
    return this.resolveInternals()?.validity ?? this.#fallbackValidity;
  }

  get willValidate(): boolean {
    return this.resolveInternals()?.willValidate ?? !this.effectiveDisabled;
  }

  checkValidity(): boolean {
    const valid =
      this.resolveInternals()?.checkValidity() ?? this.#fallbackValidity.valid;
    if (!valid) this.dispatchInvalid("check-validity");
    return valid;
  }

  reportValidity(): boolean {
    const valid =
      this.resolveInternals()?.reportValidity() ?? this.#fallbackValidity.valid;
    if (!valid) this.dispatchInvalid("report-validity");
    return valid;
  }

  setCustomValidity(message: string): void {
    this.setValidity(message.length > 0 ? { customError: true } : {}, message);
  }

  formAssociatedCallback(form: HTMLFormElement | null): void {
    this.formAssociated(form);
  }

  formDisabledCallback(disabled: boolean): void {
    const previous = this.effectiveDisabled;
    if (this.#formDisabled === disabled) return;
    this.#formDisabled = disabled;
    this.requestUpdate("formDisabled", previous);
    if (previous !== this.effectiveDisabled) {
      this.formDisabledChanged(this.effectiveDisabled);
    }
  }

  formResetCallback(): void {
    const state = this.#initialFormStateCaptured
      ? this.#initialFormState
      : undefined;
    this.resetFormState(state);
    this.setValidity();
    this.dispatchFormEvent("vf-reset", { reason: "form-reset" });
  }

  formStateRestoreCallback(
    state: VyrnForgeFormState,
    mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.restoreFormState(state as TState, mode);
  }

  protected attachFormInternals(): VyrnForgeFormInternals | null {
    const attachInternals = (
      this as HTMLElement & {
        attachInternals?: () => ElementInternals;
      }
    ).attachInternals;
    if (typeof attachInternals !== "function") return null;

    const internals = attachInternals.call(this);
    return typeof internals.setFormValue === "function"
      ? (internals as VyrnForgeFormInternals)
      : null;
  }

  protected captureInitialFormState(state: TState, force = false): void {
    if (this.#initialFormStateCaptured && !force) return;
    this.#initialFormState = state;
    this.#initialFormStateCaptured = true;
  }

  protected formAssociated(_form: HTMLFormElement | null): void {}

  protected formDisabledChanged(_disabled: boolean): void {}

  protected get formInternals(): VyrnForgeFormInternals | null {
    return this.resolveInternals();
  }

  protected get submittedFormState(): VyrnForgeFormState | undefined {
    return this.#submittedState;
  }

  protected get submittedFormValue(): VyrnForgeFormValue {
    return this.#submittedValue;
  }

  protected requestAssociatedFormReset(): boolean {
    const form = this.form;
    if (!form) return false;
    form.reset();
    return true;
  }

  protected requestAssociatedFormSubmit(): boolean {
    const form = this.form;
    if (!form) return false;
    form.requestSubmit();
    return true;
  }

  protected resetFormState(_state: TState | undefined): void {}

  protected restoreFormState(
    _state: TState,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {}

  protected setFormValue(
    value: VyrnForgeFormValue,
    state: VyrnForgeFormState = value,
  ): void {
    this.#submittedValue = value;
    this.#submittedState = state;
    this.resolveInternals()?.setFormValue(value, state);
  }

  protected setValidity(
    flags: VyrnForgeValidityFlags = {},
    message = "",
    anchor?: HTMLElement,
  ): void {
    this.#fallbackValidity = createValidityState(flags);
    this.#fallbackValidationMessage = this.#fallbackValidity.valid
      ? ""
      : message;
    this.resolveInternals()?.setValidity(flags, message, anchor);
  }

  private dispatchInvalid(reason: string): void {
    const detail: VyrnForgeInvalidDetail = Object.freeze({
      message: this.validationMessage,
      reason,
      validity: serializeValidity(this.validity),
    });
    this.dispatchFormEvent("vf-invalid", detail, { cancelable: true });
  }

  private dispatchFormEvent<TDetail>(
    name: `vf-${string}`,
    detail: TDetail,
    options?: { cancelable?: boolean },
  ): boolean {
    const target = this as EventTarget & { dispatchEvent?: unknown };
    return typeof target.dispatchEvent === "function"
      ? dispatchVyrnForgeEvent(target, name, detail, options)
      : true;
  }

  private resolveInternals(): VyrnForgeFormInternals | null {
    if (this.#internals === undefined) {
      this.#internals = this.attachFormInternals();
    }
    return this.#internals;
  }
}
