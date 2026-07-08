import { joinClassNames } from "../../utils/classNames";
import type { InlineMessageProps } from "./InlineMessage.types";

export function InlineMessage({
  children,
  className,
  title,
  variant = "info",
  ...props
}: InlineMessageProps) {
  return (
    <div
      className={joinClassNames(
        "dv-inline-message",
        `dv-inline-message--${variant}`,
        className
      )}
      role={variant === "danger" ? "alert" : "status"}
      {...props}
    >
      {title && <strong className="dv-inline-message__title">{title}</strong>}
      {children && <div className="dv-inline-message__content">{children}</div>}
    </div>
  );
}
