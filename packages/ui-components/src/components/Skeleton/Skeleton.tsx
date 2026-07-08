import type { CSSProperties } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SkeletonProps } from "./Skeleton.types";

export function Skeleton({
  animated = true,
  className,
  height,
  radius,
  style,
  width,
  ...props
}: SkeletonProps) {
  const skeletonStyle: CSSProperties = {
    ...style,
    ...(height === undefined ? {} : { height }),
    ...(radius === undefined ? {} : { borderRadius: radius }),
    ...(width === undefined ? {} : { width })
  };

  return (
    <span
      aria-hidden="true"
      className={joinClassNames("dv-skeleton", !animated && "dv-skeleton--static", className)}
      style={skeletonStyle}
      {...props}
    />
  );
}
