import type { CSSProperties } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SkeletonProps } from "./Skeleton.types";

type SkeletonStyleVars = CSSProperties & {
  "--dv-skeleton-height"?: string;
  "--dv-skeleton-radius"?: string;
  "--dv-skeleton-width"?: string;
};

function toCssLength(value: number | string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({
  animated = true,
  className,
  height,
  radius,
  style,
  width,
  ...props
}: SkeletonProps) {
  const skeletonStyle: SkeletonStyleVars = {
    "--dv-skeleton-height": toCssLength(height),
    "--dv-skeleton-radius": toCssLength(radius),
    "--dv-skeleton-width": toCssLength(width),
    ...style
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
