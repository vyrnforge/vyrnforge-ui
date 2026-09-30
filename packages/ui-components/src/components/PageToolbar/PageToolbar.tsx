import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import type { PageToolbarProps } from "./PageToolbar.types";

const region = (name: string) => adoptedRegionClassName("page-toolbar", name);

export function PageToolbar({
  children,
  className,
  density = "standard",
  left,
  right,
  sticky = false,
  ...props
}: PageToolbarProps) {
  return (
    <div
      className={resolveAdoptedHostClassName(
        "page-toolbar",
        { density, sticky },
        className,
      )}
      {...props}
    >
      {(left || children) && (
        <div className={region("left")}>{left ?? children}</div>
      )}
      {right && <div className={region("right")}>{right}</div>}
    </div>
  );
}
