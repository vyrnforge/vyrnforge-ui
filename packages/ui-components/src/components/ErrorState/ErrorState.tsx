import { joinClassNames } from "../../utils/classNames";
import type { ErrorStateProps } from "./ErrorState.types";

export function ErrorState({
  action,
  actions,
  className,
  description,
  retryAction,
  title,
  ...props
}: ErrorStateProps) {
  const actionContent = actions ?? retryAction ?? action;

  return (
    <div className={joinClassNames("dv-error-state", className)} role="alert" {...props}>
      <p className="dv-error-state__title">{title}</p>
      {description && <p className="dv-error-state__description">{description}</p>}
      {actionContent && <div className="dv-state-actions">{actionContent}</div>}
    </div>
  );
}
