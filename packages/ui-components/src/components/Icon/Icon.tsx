import { resolveVyrnForgeIconSize } from "@vyrnforge/ui-core";
import { useId } from "react";
import { joinClassNames } from "../../utils/classNames";
import { iconPaths } from "./icons";
import type { IconProps } from "./Icon.types";

export function Icon({
  className,
  decorative = true,
  name,
  size = "md",
  title,
  ...props
}: IconProps) {
  const titleId = useId();
  const resolvedSize = resolveVyrnForgeIconSize(size);
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
