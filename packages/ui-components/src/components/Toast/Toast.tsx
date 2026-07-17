import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import type { IconName } from "../Icon";
import type { ToastProps, ToastTone } from "./Toast.types";
import { getToastTone } from "./toast.utils";

const toneIconMap: Record<ToastTone, IconName> = {
  neutral: "Info",
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error"
};

export function Toast({
  action,
  className,
  description,
  dismissible = true,
  id,
  onDismiss,
  onFocusPause,
  onFocusResume,
  onHoverPause,
  onHoverResume,
  style,
  title,
  tone = "neutral"
}: ToastProps) {
  const resolvedTone = getToastTone({ tone });
  const role = resolvedTone === "warning" || resolvedTone === "error"
    ? "alert"
    : "status";

  return (
    <div
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={joinClassNames(
        "vf-toast",
        `vf-toast--${resolvedTone}`,
        className
      )}
      id={id}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onFocusResume?.();
        }
      }}
      onFocus={onFocusPause}
      onMouseEnter={onHoverPause}
      onMouseLeave={onHoverResume}
      role={role}
      style={style}
    >
      <span aria-hidden="true" className="vf-toast__icon">
        <Icon name={toneIconMap[resolvedTone]} />
      </span>
      <span className="vf-toast__content">
        {title && <strong className="vf-toast__title">{title}</strong>}
        {description && (
          <span className="vf-toast__description">{description}</span>
        )}
      </span>
      {action && <span className="vf-toast__action">{action}</span>}
      {dismissible && (
        <IconButton
          aria-label="Dismiss notification"
          className="vf-toast__dismiss"
          onClick={onDismiss}
          size="sm"
          variant="ghost"
        >
          <Icon name="Close" />
        </IconButton>
      )}
    </div>
  );
}
