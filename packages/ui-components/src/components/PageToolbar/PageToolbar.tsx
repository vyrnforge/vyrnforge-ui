import { joinClassNames } from "../../utils/classNames";
import type { PageToolbarProps } from "./PageToolbar.types";

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
      className={joinClassNames(
        "dv-page-toolbar",
        `dv-page-toolbar--${density}`,
        sticky && "dv-page-toolbar--sticky",
        className
      )}
      {...props}
    >
      {(left || children) && (
        <div className="dv-page-toolbar__left">{left ?? children}</div>
      )}
      {right && <div className="dv-page-toolbar__right">{right}</div>}
    </div>
  );
}
