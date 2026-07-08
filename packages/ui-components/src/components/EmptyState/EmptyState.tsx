import { joinClassNames } from "../../utils/classNames";
import type { EmptyStateProps } from "./EmptyState.types";

export function EmptyState({
  action,
  actions,
  className,
  description,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={joinClassNames("dv-empty-state", className)} {...props}>
      <p className="dv-empty-state__title">{title}</p>
      {description && <p className="dv-empty-state__description">{description}</p>}
      {(actions || action) && <div className="dv-state-actions">{actions ?? action}</div>}
    </div>
  );
}
