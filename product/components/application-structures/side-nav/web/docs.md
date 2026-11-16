# Native SideNav current-link semantics

Use native anchors with href and the `data-vf-side-nav-link` hook inside the authored navigation structure. Supply `aria-current="page"` on the actual current-page link. Other applicable ARIA values such as `step`, `location` and `false` retain their own meaning and are not automatically page-current.

The application determines the current destination and updates or removes the native attribute. Canonical Web styling follows the effective page state; do not assert a conflicting `data-vf-current="true"` styling hook when the link is not page-current. The Elements navigation container uses the same native link semantics.

Use `data-vf-side-nav-group-label` on an authored heading appropriate to the surrounding outline. The default React/Vue group-label heading remains h2; the native hook does not require a new heading API.

In Angular, an anchor using only this Web hook can bind `[attr.aria-current]` directly. An anchor carrying the Angular `vfSideNavLink` directive instead uses its `[aria-current]` input alias when supplying a dynamic authored value; see the Angular adaptation.
