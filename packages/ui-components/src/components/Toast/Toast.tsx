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
        "dv-toast",
        `dv-toast--${resolvedTone}`,
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
      <span aria-hidden="true" className="dv-toast__icon">
        <Icon name={toneIconMap[resolvedTone]} />
      </span>
      <span className="dv-toast__content">
        {title && <strong className="dv-toast__title">{title}</strong>}
        {description && (
          <span className="dv-toast__description">{description}</span>
        )}
      </span>
      {action && <span className="dv-toast__action">{action}</span>}
      {dismissible && (
        <IconButton
          aria-label="Dismiss notification"
          className="dv-toast__dismiss"
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
