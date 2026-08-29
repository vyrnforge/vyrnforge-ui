import {
  Directive,
  ElementRef,
  Renderer2,
  forwardRef,
  inject,
  type OnDestroy,
} from "@angular/core";
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  type AbstractControl,
  type ControlValueAccessor,
  type ValidationErrors,
  type Validator,
} from "@angular/forms";
import type {
  VyrnForgeCheckedChangeDetail,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";

interface VyrnForgeAngularFormElement extends HTMLElement {
  disabled: boolean;
  readonly validationMessage: string;
  readonly validity: ValidityState;
  readonly willValidate: boolean;
}

export type VyrnForgeAngularFormValue =
  boolean | number | readonly string[] | string | null;

type ChangeCallback = (value: VyrnForgeAngularFormValue) => void;
type TouchedCallback = () => void;
type ValidatorChangeCallback = () => void;

const checkedTagNames = new Set(["vf-checkbox", "vf-switch"]);
const numericTagNames = new Set(["vf-rating", "vf-slider"]);
const stringArrayTagNames = new Set(["vf-multi-select", "vf-transfer-list"]);

function isCheckedElement(element: VyrnForgeAngularFormElement): boolean {
  return checkedTagNames.has(element.localName);
}

function normalizeValueForElement(
  element: VyrnForgeAngularFormElement,
  value: unknown,
): VyrnForgeAngularFormValue {
  if (stringArrayTagNames.has(element.localName)) {
    return Array.isArray(value)
      ? Object.freeze(value.map((entry) => String(entry)))
      : Object.freeze([]);
  }

  if (numericTagNames.has(element.localName)) {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return value == null ? "" : String(value);
}

function serializeValidity(
  validity: ValidityState,
): Readonly<Record<string, boolean>> {
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
 * Angular Forms bridge for VyrnForge form-associated Custom Elements.
 *
 * The directive translates Angular Forms callbacks to the native `value`,
 * `checked`, `disabled`, `validity`, and canonical `vf-*` event contracts. It
 * does not render controls or duplicate VyrnForge validation/accessibility
 * behavior.
 */
@Directive({
  selector:
    "vf-autocomplete[vfFormControl]," +
    "vf-checkbox[vfFormControl]," +
    "vf-date-input[vfFormControl]," +
    "vf-datetime-input[vfFormControl]," +
    "vf-multi-select[vfFormControl]," +
    "vf-number-input[vfFormControl]," +
    "vf-rating[vfFormControl]," +
    "vf-search-input[vfFormControl]," +
    "vf-select[vfFormControl]," +
    "vf-slider[vfFormControl]," +
    "vf-switch[vfFormControl]," +
    "vf-text-input[vfFormControl]," +
    "vf-textarea[vfFormControl]," +
    "vf-transfer-list[vfFormControl]",
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VyrnForgeFormControlDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => VyrnForgeFormControlDirective),
      multi: true,
    },
  ],
})
export class VyrnForgeFormControlDirective
  implements ControlValueAccessor, OnDestroy, Validator
{
  private readonly elementRef =
    inject<ElementRef<VyrnForgeAngularFormElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly listenerCleanup: ReadonlyArray<() => void> = [
    this.renderer.listen(
      this.elementRef.nativeElement,
      "focusout",
      (event: Event) => this.handleFocusOut(event as FocusEvent),
    ),
    this.renderer.listen(
      this.elementRef.nativeElement,
      "vf-checked-change",
      (event: Event) => this.handleCheckedChange(event),
    ),
    this.renderer.listen(
      this.elementRef.nativeElement,
      "vf-invalid",
      (event: Event) => this.handleInvalid(event),
    ),
    this.renderer.listen(
      this.elementRef.nativeElement,
      "vf-value-change",
      (event: Event) => this.handleValueChange(event),
    ),
  ];

  private onChange: ChangeCallback = () => undefined;
  private onTouched: TouchedCallback = () => undefined;
  private onValidatorChange: ValidatorChangeCallback = () => undefined;

  writeValue(value: unknown): void {
    const element = this.elementRef.nativeElement;
    if (isCheckedElement(element)) {
      this.renderer.setProperty(element, "checked", value === true);
    } else {
      this.renderer.setProperty(
        element,
        "value",
        normalizeValueForElement(element, value),
      );
    }
    this.requestValidatorRefresh();
  }

  registerOnChange(callback: ChangeCallback): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: TouchedCallback): void {
    this.onTouched = callback;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(
      this.elementRef.nativeElement,
      "disabled",
      isDisabled,
    );
    this.requestValidatorRefresh();
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    const element = this.elementRef.nativeElement;
    if (element.disabled || !element.willValidate || element.validity.valid) {
      return null;
    }

    return {
      vyrnForge: {
        message: element.validationMessage,
        validity: serializeValidity(element.validity),
      },
    };
  }

  registerOnValidatorChange(callback: ValidatorChangeCallback): void {
    this.onValidatorChange = callback;
  }

  ngOnDestroy(): void {
    for (const cleanup of this.listenerCleanup) cleanup();
  }

  handleValueChange(event: Event): void {
    if (isCheckedElement(this.elementRef.nativeElement)) return;
    const detail = (event as CustomEvent<VyrnForgeValueChangeDetail<unknown>>)
      .detail;
    this.onChange(detail.value as VyrnForgeAngularFormValue);
    this.requestValidatorRefresh();
  }

  handleCheckedChange(event: Event): void {
    if (!isCheckedElement(this.elementRef.nativeElement)) return;
    const detail = (event as CustomEvent<VyrnForgeCheckedChangeDetail>).detail;
    this.onChange(detail.checked === "mixed" ? null : detail.checked);
    this.requestValidatorRefresh();
  }

  handleFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      this.elementRef.nativeElement.contains(nextTarget)
    ) {
      return;
    }
    this.onTouched();
  }

  handleInvalid(_event: Event): void {
    this.requestValidatorRefresh();
  }

  private requestValidatorRefresh(): void {
    queueMicrotask(() => this.onValidatorChange());
  }
}
