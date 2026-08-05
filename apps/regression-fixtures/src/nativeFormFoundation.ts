import {
  VyrnForgeFormAssociatedElement,
  createVyrnForgeEventDispatcher,
  defineVyrnForgeElement,
  type VyrnForgeFormStateRestoreMode,
  type VyrnForgePropertyDeclarations,
} from "@vyrnforge/ui-elements";

type NativeFormProbeEvents = {
  "vf-value-change": {
    readonly previousValue: string;
    readonly reason: "fixture-action";
    readonly value: string;
  };
};

const events = createVyrnForgeEventDispatcher<NativeFormProbeEvents>();

export class NativeFormProbeElement extends VyrnForgeFormAssociatedElement<string> {
  static override readonly properties = Object.freeze({
    value: { reflect: true, type: "string" },
  }) satisfies VyrnForgePropertyDeclarations;

  get value(): string {
    return this.getPropertyValue("value", "");
  }

  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  commitValue(value: string): void {
    const previousValue = this.value;
    if (previousValue === value) return;
    this.value = value;
    events.dispatch(this, "vf-value-change", {
      previousValue,
      reason: "fixture-action",
      value,
    });
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value);
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
    this.setFormValue(this.value, this.value);
    this.setValidity(
      this.required && this.value.length === 0 ? { valueMissing: true } : {},
      this.required && this.value.length === 0
        ? "A fixture value is required."
        : "",
    );
    this.dataset.value = this.value;
    this.dataset.disabled = String(this.effectiveDisabled);
    this.textContent = `Native value: ${this.value || "empty"}`;
  }
}

export const nativeFormProbeTagName = "vf-native-form-probe" as const;

export function registerNativeFormProbeElement(): boolean {
  return defineVyrnForgeElement(nativeFormProbeTagName, NativeFormProbeElement);
}
