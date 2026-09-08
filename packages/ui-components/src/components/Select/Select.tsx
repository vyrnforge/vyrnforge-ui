import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import {
  Children,
  forwardRef,
  isValidElement,
  type ChangeEvent,
  type ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { SelectProps } from "./Select.types";

type CanonicalSelectElement = VyrnForgeElementForTagName<"vf-select">;
const registerCanonicalSelect = vyrnForgeElementRegistrations["vf-select"];

function firstOptionValue(children: ReactNode): string {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    if (child.type === "option") {
      const optionProps = child.props as {
        children?: ReactNode;
        value?: string | number;
      };
      if (optionProps.value !== undefined) return String(optionProps.value);
      if (typeof optionProps.children === "string") return optionProps.children;
    }
    if (child.type === "optgroup") {
      const value = firstOptionValue(
        (child.props as { children?: ReactNode }).children,
      );
      if (value) return value;
    }
  }
  return "";
}

function normalizeSelectValue(
  value: SelectProps["value"] | SelectProps["defaultValue"],
): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value);
}

const CanonicalSelect = forwardRef<HTMLSelectElement, SelectProps>(
  function CanonicalSelect(
    {
      children,
      className,
      defaultValue,
      disabled,
      invalid = false,
      onChange,
      options,
      required,
      size = "md",
      value,
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLSelectElement>(null);
    const controlledValue = normalizeSelectValue(value);
    const defaultCanonicalValue =
      normalizeSelectValue(defaultValue) ??
      options?.[0]?.value ??
      firstOptionValue(children);

    useImperativeHandle(ref, () => controlRef.current as HTMLSelectElement, []);

    const canonicalProperties = useMemo(
      () => ({
        disabled: disabled ?? false,
        invalid,
        required: required ?? false,
        size,
        ...(controlledValue === undefined ? {} : { value: controlledValue }),
      }),
      [controlledValue, disabled, invalid, required, size],
    );
    const elementRef = useCanonicalElementBridge<CanonicalSelectElement>(null, {
      tagName: "vf-select",
      register: registerCanonicalSelect,
      properties: canonicalProperties,
    });

    useCanonicalControlClassName(controlRef, className);

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      if (controlledValue !== undefined && elementRef.current) {
        elementRef.current.value = controlledValue;
      }
    };

    return (
      <vf-select
        disabled={disabled}
        invalid={invalid}
        ref={elementRef}
        required={required}
        size={size}
        style={{ display: "contents" }}
        value={controlledValue ?? defaultCanonicalValue}
      >
        <select
          {...props}
          aria-invalid={invalid || undefined}
          className={joinClassNames(
            "vf-select",
            `vf-select--${size}`,
            invalid && "vf-select--invalid",
            className,
          )}
          data-vf-select-control=""
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={handleChange}
          ref={controlRef}
          required={required}
          value={value}
        >
          {options
            ? options.map((option) => (
                <option
                  disabled={option.disabled}
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
      </vf-select>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(props, ref) {
    if (props.multiple) {
      const {
        children,
        className,
        invalid = false,
        options,
        size = "md",
        ...rest
      } = props;
      return (
        <select
          {...rest}
          aria-invalid={invalid || undefined}
          className={joinClassNames(
            "vf-select",
            `vf-select--${size}`,
            invalid && "vf-select--invalid",
            className,
          )}
          multiple
          ref={ref}
        >
          {options
            ? options.map((option) => (
                <option
                  disabled={option.disabled}
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
      );
    }

    return <CanonicalSelect {...props} ref={ref} />;
  },
);
