import type { CSSProperties } from "react";
import type { SkeletonProps } from "./Skeleton.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Skeleton({
  className,
  height,
  style,
  width,
  ...props
}: SkeletonProps) {
  const skeletonStyle: CSSProperties = {
    ...style,
    ...(height === undefined ? {} : { height }),
    ...(width === undefined ? {} : { width })
  };

  return (
    <span
      aria-hidden="true"
      className={joinClassNames("dv-skeleton", className)}
      style={skeletonStyle}
      {...props}
    />
  );
}
