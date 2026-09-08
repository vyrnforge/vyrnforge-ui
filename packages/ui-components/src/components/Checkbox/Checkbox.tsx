import { resolveToggleInputState } from "@vyrnforge/ui-behaviors";
import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import {
  forwardRef,
  type ChangeEvent,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { CheckboxProps } from "./Checkbox.types";

type CanonicalCheckboxElement = VyrnForgeElementForTagName<"vf-checkbox">;
const registerCanonicalCheckbox = vyrnForgeElementRegistrations["vf-checkbox"];

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      checked,
      className,
      defaultChecked,
      disabled,
      invalid = false,
      label,
      onChange,
      readOnly,
      required,
      size = "md",
      value,
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLInputElement>(null);
    const generatedLabelId = useId();
    const initialCheckedRef = useRef(checked ?? defaultChecked ?? false);
    const canonicalChecked = checked ?? initialCheckedRef.current;
    const canonicalValue = value === undefined ? "on" : String(value);
    const state = resolveToggleInputState({
      checked,
      defaultChecked,
      disabled,
      readOnly,
    });

    useImperativeHandle(ref, () => controlRef.current as HTMLInputElement, []);

    const canonicalProperties = useMemo(
      () => ({
        disabled: state.disabled,
        invalid,
        readOnly: readOnly ?? false,
        required: required ?? false,
        size,
        value: canonicalValue,
        ...(checked === undefined ? {} : { checked }),
      }),
      [
        checked,
        canonicalValue,
        invalid,
        readOnly,
        required,
        size,
        state.disabled,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalCheckboxElement>(
      null,
      {
        tagName: "vf-checkbox",
        register: registerCanonicalCheckbox,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(controlRef, className);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (checked !== undefined && elementRef.current) {
        elementRef.current.checked = checked;
      }
    };

    const input = (
      <vf-checkbox
        checked={canonicalChecked}
        disabled={state.disabled}
        invalid={invalid}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        size={size}
        style={{ display: "contents" }}
        value={canonicalValue}
      >
        <input
          {...props}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (label ? generatedLabelId : undefined)
          }
          checked={checked}
          className={joinClassNames(
            "vf-checkbox",
            `vf-checkbox--${size}`,
            className,
          )}
          data-vf-choice-control=""
          defaultChecked={defaultChecked}
          disabled={state.disabled}
          onChange={handleChange}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          type="checkbox"
          value={value}
        />
      </vf-checkbox>
    );

    if (!label) return input;

    return (
      <label className="vf-checkbox-field">
        {input}
        <span id={generatedLabelId}>{label}</span>
      </label>
    );
  },
);
