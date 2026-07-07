import type { EmptyStateProps } from "./EmptyState.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function EmptyState({
  action,
  className,
  description,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={joinClassNames("dv-empty-state", className)} {...props}>
      <p className="dv-empty-state__title">{title}</p>
      {description && <p className="dv-empty-state__description">{description}</p>}
      {action}
    </div>
  );
}
