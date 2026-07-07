import type { LoadingStateProps } from "./LoadingState.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function LoadingState({
  className,
  description,
  title = "Loading",
  ...props
}: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      className={joinClassNames("dv-loading-state", className)}
      role="status"
      {...props}
    >
      <span aria-hidden="true" className="dv-loading-state__spinner" />
      <p className="dv-loading-state__title">{title}</p>
      {description && <p className="dv-loading-state__description">{description}</p>}
    </div>
  );
}
