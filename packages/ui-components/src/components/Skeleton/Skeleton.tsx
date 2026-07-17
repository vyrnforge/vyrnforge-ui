import type { CSSProperties } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SkeletonProps } from "./Skeleton.types";

type SkeletonStyleVars = CSSProperties & {
  "--vf-skeleton-height"?: string;
  "--vf-skeleton-radius"?: string;
  "--vf-skeleton-width"?: string;
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
    "--vf-skeleton-height": toCssLength(height),
    "--vf-skeleton-radius": toCssLength(radius),
    "--vf-skeleton-width": toCssLength(width),
    ...style
  };

  return (
    <span
      aria-hidden="true"
      className={joinClassNames("vf-skeleton", !animated && "vf-skeleton--static", className)}
      style={skeletonStyle}
      {...props}
    />
  );
}
