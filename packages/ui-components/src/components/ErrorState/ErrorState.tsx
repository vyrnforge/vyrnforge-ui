import type { ErrorStateProps } from "./ErrorState.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function ErrorState({
  action,
  className,
  description,
  title,
  ...props
}: ErrorStateProps) {
  return (
    <div className={joinClassNames("dv-error-state", className)} role="alert" {...props}>
      <p className="dv-error-state__title">{title}</p>
      {description && <p className="dv-error-state__description">{description}</p>}
      {action}
    </div>
  );
}
