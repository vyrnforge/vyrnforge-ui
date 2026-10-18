import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import { useEffect } from "react";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { TopNavProps } from "./TopNav.types";

type CanonicalTopNavElement = VyrnForgeElementForTagName<"vf-top-nav">;
const registerCanonicalTopNav = vyrnForgeElementRegistrations["vf-top-nav"];

export function TopNav({
  actions,
  brand,
  className,
  navigation,
  role,
  userArea,
  ...props
}: TopNavProps) {
  const elementRef = useCanonicalElementBridge<CanonicalTopNavElement>(null, {
    tagName: "vf-top-nav",
    register: registerCanonicalTopNav,
  });

  useEffect(() => {
    if (!role) return;
    const element = elementRef.current;
    if (!element) return;
    queueMicrotask(() => {
      if (element.isConnected) element.setAttribute("role", role);
    });
  }, [elementRef, role]);

  return (
    <vf-top-nav
      {...props}
      className={joinClassNames("vf-top-nav", className)}
      ref={elementRef}
      role={role ?? "banner"}
    >
      {brand && (
        <div className="vf-top-nav__brand" data-vf-top-nav-internal="">
          {brand}
        </div>
      )}
      {navigation && (
        <nav className="vf-top-nav__navigation" data-vf-top-nav-internal="">
          {navigation}
        </nav>
      )}
      {(actions || userArea) && (
        <div className="vf-top-nav__actions" data-vf-top-nav-internal="">
          {actions}
          {userArea && <div className="vf-top-nav__user">{userArea}</div>}
        </div>
      )}
    </vf-top-nav>
  );
}
