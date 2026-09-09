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
import type { RadioProps } from "./Radio.types";

type CanonicalRadioElement = VyrnForgeElementForTagName<"vf-radio">;
const registerCanonicalRadio = vyrnForgeElementRegistrations["vf-radio"];

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    checked,
    className,
    defaultChecked,
    description,
    disabled,
    invalid = false,
    label,
    onChange,
    readOnly,
    required,
    style,
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

  useImperativeHandle(ref, () => controlRef.current as HTMLInputElement, []);

  const canonicalProperties = useMemo(
    () => ({
      disabled: disabled ?? false,
      invalid,
      readOnly: readOnly ?? false,
      required: required ?? false,
      value: canonicalValue,
      ...(checked === undefined ? {} : { checked }),
    }),
    [checked, canonicalValue, disabled, invalid, readOnly, required],
  );
  const elementRef = useCanonicalElementBridge<CanonicalRadioElement>(null, {
    tagName: "vf-radio",
    register: registerCanonicalRadio,
    properties: canonicalProperties,
  });

  useCanonicalControlClassName(controlRef, className);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (checked !== undefined && elementRef.current) {
      elementRef.current.checked = checked;
    }
  };

  const input = (
    <vf-radio
      checked={canonicalChecked}
      disabled={disabled}
      invalid={invalid}
      readOnly={readOnly}
      required={required}
      ref={elementRef}
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
        className={joinClassNames("vf-radio", className)}
        data-vf-choice-control=""
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        readOnly={readOnly}
        ref={controlRef}
        required={required}
        style={label ? undefined : style}
        type="radio"
        value={value}
      />
    </vf-radio>
  );

  if (!label) return input;

  return (
    <label className="vf-radio-field" style={style}>
      {input}
      <span className="vf-radio-field__content">
        <span className="vf-radio-field__label" id={generatedLabelId}>
          {label}
        </span>
        {description && (
          <span className="vf-radio-field__description">{description}</span>
        )}
      </span>
    </label>
  );
});
