import { resolveActionState } from "@vyrnforge/ui-behaviors";
import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useCanonicalActionControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import { Tooltip } from "../Tooltip";
import type { IconButtonProps } from "./IconButton.types";

type CanonicalIconButtonElement = VyrnForgeElementForTagName<"vf-icon-button">;

const registerCanonicalIconButton =
  vyrnForgeElementRegistrations["vf-icon-button"];

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      className,
      disabled,
      loading = false,
      size = "md",
      tooltip,
      type = "button",
      value,
      variant = "default",
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLButtonElement>(null);
    const action = resolveActionState({ disabled, loading });
    const ariaLabel = props["aria-label"];

    useImperativeHandle(ref, () => controlRef.current as HTMLButtonElement, []);

    const canonicalProperties = useMemo(
      () => ({
        ariaLabel: ariaLabel ?? "",
        disabled: disabled ?? false,
        loading,
        size,
        type,
        value: value === undefined ? "" : String(value),
        variant,
      }),
      [ariaLabel, disabled, loading, size, type, value, variant],
    );

    const elementRef = useCanonicalElementBridge<CanonicalIconButtonElement>(
      null,
      {
        tagName: "vf-icon-button",
        register: registerCanonicalIconButton,
        properties: canonicalProperties,
      },
    );

    useCanonicalActionControlClassName(controlRef, className);

    const button = (
      <vf-icon-button ref={elementRef} style={{ display: "contents" }}>
        <button
          {...props}
          aria-busy={action.ariaBusy}
          className={joinClassNames(
            "vf-icon-button",
            `vf-icon-button--${variant}`,
            `vf-icon-button--${size}`,
            loading && "vf-icon-button--loading",
            className,
          )}
          data-vf-action-control=""
          disabled={action.disabled}
          ref={controlRef}
          type={type}
          value={value}
        >
          <span
            aria-hidden="true"
            className="vf-button__spinner"
            data-vf-action-spinner=""
            hidden={!action.loading}
          />
          <span data-vf-action-content="" style={{ display: "contents" }}>
            {!action.loading ? children : null}
          </span>
        </button>
      </vf-icon-button>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{button}</Tooltip>;
    }

    return button;
  },
);
