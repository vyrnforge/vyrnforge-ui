import { joinClassNames } from "../../utils/classNames";
import type { LoadingStateProps } from "./LoadingState.types";

export function LoadingState({
  className,
  description,
  label,
  size = "md",
  title = "Loading",
  ...props
}: LoadingStateProps) {
  const titleContent = label ?? title;

  return (
    <div
      aria-busy="true"
      className={joinClassNames("dv-loading-state", `dv-loading-state--${size}`, className)}
      role="status"
      {...props}
    >
      <span aria-hidden="true" className="dv-loading-state__spinner" />
      <p className="dv-loading-state__title">{titleContent}</p>
      {description && <p className="dv-loading-state__description">{description}</p>}
    </div>
  );
}
