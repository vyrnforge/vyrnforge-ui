import { describe, expect, it, vi } from "vitest";

import {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormInternals,
  type VyrnForgeFormState,
  type VyrnForgeFormStateRestoreMode,
  type VyrnForgeFormValue,
  type VyrnForgeValidityFlags,
} from "./VyrnForgeFormAssociatedElement";

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

function validityFrom(flags: VyrnForgeValidityFlags): ValidityState {
  return Object.freeze({
    ...validState,
    ...flags,
    valid: !Object.values(flags).some(Boolean),
  });
}

class FakeInternals implements VyrnForgeFormInternals {
  readonly form = {
    requestSubmit: vi.fn(),
    reset: vi.fn(),
  } as unknown as HTMLFormElement;
  readonly labels = [] as unknown as NodeList;
  validationMessage = "";
  validity: ValidityState = validState;
  willValidate = true;
  readonly setFormValue = vi.fn(
    (_value: VyrnForgeFormValue, _state?: VyrnForgeFormState) => undefined,
  );
  readonly setValidity = vi.fn(
    (
      flags: VyrnForgeValidityFlags = {},
      message = "",
      _anchor?: HTMLElement,
    ) => {
      this.validity = validityFrom(flags);
      this.validationMessage = this.validity.valid ? "" : message;
    },
  );
  readonly checkValidity = vi.fn(() => this.validity.valid);
  readonly reportValidity = vi.fn(() => this.validity.valid);
}

class ProbeFormElement extends VyrnForgeFormAssociatedElement<string> {
  readonly reflectedAttributes = new Map<string, string>();
  readonly associatedForms: Array<HTMLFormElement | null> = [];
  readonly disabledChanges: boolean[] = [];
  readonly restored: Array<{
    mode: VyrnForgeFormStateRestoreMode;
    state: string;
  }> = [];
  readonly resetStates: Array<string | undefined> = [];
  readonly target = new EventTarget();
  readonly internals = new FakeInternals();
  value = "initial";

  override addEventListener(
    type: string,
    listener: unknown,
    options?: AddEventListenerOptions | boolean,
  ): void {
    if (listener === null) return;
    this.target.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  override dispatchEvent(event: Event): boolean {
    return this.target.dispatchEvent(event);
  }

  override removeAttribute(name: string): void {
    this.reflectedAttributes.delete(name);
  }

  override setAttribute(name: string, value: string): void {
    this.reflectedAttributes.set(name, value);
  }

  commit(value: VyrnForgeFormValue, state: VyrnForgeFormState = value): void {
    this.setFormValue(value, state);
  }

  capture(state: string, force = false): void {
    this.captureInitialFormState(state, force);
  }

  invalidate(
    flags: VyrnForgeValidityFlags,
    message: string,
    anchor?: HTMLElement,
  ): void {
    this.setValidity(flags, message, anchor);
  }

  requestReset(): boolean {
    return this.requestAssociatedFormReset();
  }

  requestSubmit(): boolean {
    return this.requestAssociatedFormSubmit();
  }

  get submittedState(): VyrnForgeFormState | undefined {
    return this.submittedFormState;
  }

  get submittedValue(): VyrnForgeFormValue {
    return this.submittedFormValue;
  }

  protected override attachFormInternals(): VyrnForgeFormInternals | null {
    return this.internals;
  }

  protected override formAssociated(form: HTMLFormElement | null): void {
    this.associatedForms.push(form);
  }

  protected override formDisabledChanged(disabled: boolean): void {
    this.disabledChanges.push(disabled);
  }

  protected override resetFormState(state: string | undefined): void {
    this.resetStates.push(state);
    this.value = state ?? "";
  }

  protected override restoreFormState(
    state: string,
    mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.restored.push({ mode, state });
    this.value = state;
  }
}

class FallbackFormElement extends ProbeFormElement {
  protected override attachFormInternals(): null {
    return null;
  }
}

class ServerFallbackFormElement extends VyrnForgeFormAssociatedElement<string> {
  protected override attachFormInternals(): null {
    return null;
  }

  invalidate(): void {
    this.setValidity({ customError: true }, "Server fallback invalid");
  }
}

class DefaultHooksFormElement extends VyrnForgeFormAssociatedElement<string> {
  readonly target = new EventTarget();

  override dispatchEvent(event: Event): boolean {
    return this.target.dispatchEvent(event);
  }

  protected override attachFormInternals(): null {
    return null;
  }
}

describe("VyrnForgeFormAssociatedElement", () => {
  it("declares form association and exposes internals lazily", () => {
    const element = new ProbeFormElement();

    expect(ProbeFormElement.formAssociated).toBe(true);
    expect(element.formAssociationMode).toBe("value");
    expect(element.form).toBe(element.internals.form);
    expect(element.labels).toBe(element.internals.labels);
    expect(element.validity.valid).toBe(true);
    expect(element.validationMessage).toBe("");
    expect(element.willValidate).toBe(true);
  });

  it("reflects form properties and tracks effective disabled state", () => {
    const element = new ProbeFormElement();

    element.name = "account";
    element.required = true;
    element.disabled = true;
    element.disabled = true;
    expect(element.reflectedAttributes).toEqual(
      new Map([
        ["name", "account"],
        ["required", ""],
        ["disabled", ""],
      ]),
    );
    expect(element.effectiveDisabled).toBe(true);
    expect(element.disabledChanges).toEqual([true]);

    element.disabled = false;
    element.formDisabledCallback(true);
    element.formDisabledCallback(true);
    element.formDisabledCallback(false);
    expect(element.effectiveDisabled).toBe(false);
    expect(element.disabledChanges).toEqual([true, false, true, false]);
  });

  it("forwards submitted values and state to ElementInternals", () => {
    const element = new ProbeFormElement();

    element.commit("ready", "restore-ready");
    expect(element.internals.setFormValue).toHaveBeenCalledWith(
      "ready",
      "restore-ready",
    );
    expect(element.submittedValue).toBe("ready");
    expect(element.submittedState).toBe("restore-ready");
  });

  it("forwards validity and emits canonical invalid events", () => {
    const element = new ProbeFormElement();
    const invalid = vi.fn();
    element.addEventListener("vf-invalid", invalid);

    element.invalidate({ valueMissing: true }, "A value is required.");
    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);
    expect(element.validationMessage).toBe("A value is required.");
    expect(invalid).toHaveBeenCalledTimes(2);
    expect((invalid.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      message: "A value is required.",
      reason: "check-validity",
      validity: { valid: false, valueMissing: true },
    });

    element.setCustomValidity("");
    expect(element.validity.valid).toBe(true);
    expect(element.checkValidity()).toBe(true);
  });

  it("restores initial and browser-provided form state without user changes", () => {
    const element = new ProbeFormElement();
    const reset = vi.fn();
    element.addEventListener("vf-reset", reset);

    element.capture("initial");
    element.capture("ignored");
    element.capture("forced", true);
    element.value = "changed";
    element.formResetCallback();
    expect(element.value).toBe("forced");
    expect(element.resetStates).toEqual(["forced"]);
    expect(reset).toHaveBeenCalledOnce();

    element.formStateRestoreCallback("restored", "autocomplete");
    expect(element.value).toBe("restored");
    expect(element.restored).toEqual([
      { mode: "autocomplete", state: "restored" },
    ]);
    expect(reset).toHaveBeenCalledOnce();
  });

  it("forwards form association and submitter utilities", () => {
    const element = new ProbeFormElement();
    const form = element.internals.form;

    element.formAssociatedCallback(form);
    element.formAssociatedCallback(null);
    expect(element.associatedForms).toEqual([form, null]);
    expect(element.requestSubmit()).toBe(true);
    expect(element.requestReset()).toBe(true);
    expect(form.requestSubmit).toHaveBeenCalledOnce();
    expect(form.reset).toHaveBeenCalledOnce();
  });

  it("provides deterministic fallbacks without ElementInternals", () => {
    const element = new FallbackFormElement();
    const invalid = vi.fn();
    element.addEventListener("vf-invalid", invalid);

    expect(element.form).toBeNull();
    expect(element.labels).toBeNull();
    expect(element.requestSubmit()).toBe(false);
    expect(element.requestReset()).toBe(false);
    element.setCustomValidity("Fallback invalid state");
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe("Fallback invalid state");
    expect(element.reportValidity()).toBe(false);
    expect(invalid).toHaveBeenCalledOnce();
    element.disabled = true;
    expect(element.willValidate).toBe(false);
  });

  it("keeps server fallbacks safe without an EventTarget implementation", () => {
    const element = new ServerFallbackFormElement();
    element.invalidate();
    expect(element.reportValidity()).toBe(false);
    expect(() => element.formResetCallback()).not.toThrow();
  });

  it("supports the default form lifecycle hooks", () => {
    const element = new DefaultHooksFormElement();

    element.formAssociatedCallback(null);
    element.formDisabledCallback(true);
    element.formResetCallback();
    element.formStateRestoreCallback("restored", "restore");
    expect(element.effectiveDisabled).toBe(true);
  });
});
