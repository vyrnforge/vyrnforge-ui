import type { VyrnForgeIconName, VyrnForgeIconSize } from "@vyrnforge/ui-core";
import type { CSSProperties, SVGProps } from "react";

export type IconName = VyrnForgeIconName;
export type IconSize = VyrnForgeIconSize;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "ref"> & {
  name: IconName;
  size?: IconSize;
  decorative?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
};
