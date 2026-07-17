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
      className={joinClassNames("vf-loading-state", `vf-loading-state--${size}`, className)}
      role="status"
      {...props}
    >
      <span aria-hidden="true" className="vf-loading-state__spinner" />
      <p className="vf-loading-state__title">{titleContent}</p>
      {description && <p className="vf-loading-state__description">{description}</p>}
    </div>
  );
}
