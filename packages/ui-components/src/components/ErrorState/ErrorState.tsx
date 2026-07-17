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
    <div className={joinClassNames("vf-error-state", className)} role="alert" {...props}>
      <p className="vf-error-state__title">{title}</p>
      {description && <p className="vf-error-state__description">{description}</p>}
      {actionContent && <div className="vf-state-actions">{actionContent}</div>}
    </div>
  );
}
