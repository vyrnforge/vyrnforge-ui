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
    <div className={joinClassNames("vf-empty-state", className)} {...props}>
      <p className="vf-empty-state__title">{title}</p>
      {description && <p className="vf-empty-state__description">{description}</p>}
      {(actions || action) && <div className="vf-state-actions">{actions ?? action}</div>}
    </div>
  );
}
