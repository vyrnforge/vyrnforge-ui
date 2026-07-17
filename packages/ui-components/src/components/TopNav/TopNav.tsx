import { joinClassNames } from "../../utils/classNames";
import type { TopNavProps } from "./TopNav.types";

export function TopNav({
  actions,
  brand,
  className,
  navigation,
  userArea,
  ...props
}: TopNavProps) {
  return (
    <header className={joinClassNames("vf-top-nav", className)} {...props}>
      {brand && <div className="vf-top-nav__brand">{brand}</div>}
      {navigation && <nav className="vf-top-nav__navigation">{navigation}</nav>}
      {(actions || userArea) && (
        <div className="vf-top-nav__actions">
          {actions}
          {userArea && <div className="vf-top-nav__user">{userArea}</div>}
        </div>
      )}
    </header>
  );
}
