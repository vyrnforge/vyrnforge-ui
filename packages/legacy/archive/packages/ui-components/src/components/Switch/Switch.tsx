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
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { SwitchProps } from "./Switch.types";

type CanonicalSwitchElement = VyrnForgeElementForTagName<"vf-switch">;
const registerCanonicalSwitch = vyrnForgeElementRegistrations["vf-switch"];

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
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
    onCheckedChange,
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
      value: canonicalValue,
      ...(checked === undefined ? {} : { checked }),
    }),
    [checked, canonicalValue, invalid, readOnly, required, state.disabled],
  );
  const elementRef = useCanonicalElementBridge<CanonicalSwitchElement>(null, {
    tagName: "vf-switch",
    register: registerCanonicalSwitch,
    properties: canonicalProperties,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
    if (checked !== undefined && elementRef.current) {
      elementRef.current.checked = checked;
    }
  };

  return (
    <label className={joinClassNames("vf-switch", className)} style={style}>
      <vf-switch
        checked={canonicalChecked}
        disabled={state.disabled}
        invalid={invalid}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        style={{ display: "contents" }}
        value={canonicalValue}
      >
        <input
          {...props}
          aria-checked={state.checked}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (label ? generatedLabelId : undefined)
          }
          checked={checked}
          className="vf-switch__input"
          data-vf-choice-control=""
          defaultChecked={defaultChecked}
          disabled={state.disabled}
          onChange={handleChange}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          role="switch"
          type="checkbox"
          value={value}
        />
      </vf-switch>
      <span aria-hidden="true" className="vf-switch__control">
        <span className="vf-switch__thumb" />
        <span className="vf-switch__state vf-switch__state--on">On</span>
        <span className="vf-switch__state vf-switch__state--off">Off</span>
      </span>
      {(label || description) && (
        <span className="vf-switch__content">
          {label && (
            <span className="vf-switch__label" id={generatedLabelId}>
              {label}
            </span>
          )}
          {description && (
            <span className="vf-switch__description">{description}</span>
          )}
        </span>
      )}
    </label>
  );
});
