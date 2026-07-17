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
        "vf-page-toolbar",
        `vf-page-toolbar--${density}`,
        sticky && "vf-page-toolbar--sticky",
        className
      )}
      {...props}
    >
      {(left || children) && (
        <div className="vf-page-toolbar__left">{left ?? children}</div>
      )}
      {right && <div className="vf-page-toolbar__right">{right}</div>}
    </div>
  );
}
