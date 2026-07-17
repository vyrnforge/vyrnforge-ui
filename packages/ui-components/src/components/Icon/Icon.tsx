import { useId } from "react";
import { joinClassNames } from "../../utils/classNames";
import { iconPaths } from "./icons";
import type { IconProps, IconSize } from "./Icon.types";

const iconSizeMap: Record<Exclude<IconSize, number>, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20
};

function resolveIconSize(size: IconSize) {
  return typeof size === "number" ? size : iconSizeMap[size];
}

export function Icon({
  className,
  decorative = true,
  name,
  size = "md",
  title,
  ...props
}: IconProps) {
  const titleId = useId();
  const resolvedSize = resolveIconSize(size);
  const isDecorative = decorative && !title;

  return (
    <svg
      aria-hidden={isDecorative || undefined}
      aria-labelledby={!isDecorative && title ? titleId : undefined}
      className={joinClassNames("vf-icon", className)}
      fill="none"
      focusable="false"
      height={resolvedSize}
      role={!isDecorative ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={resolvedSize}
      {...props}
    >
      {!isDecorative && title && <title id={titleId}>{title}</title>}
      {iconPaths[name]}
    </svg>
  );
}
