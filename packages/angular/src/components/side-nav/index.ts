import { Directive, input } from '@angular/core';
@Directive({selector:'nav[vfSideNav]',standalone:true,host:{'data-vf-side-nav':''}}) export class VfSideNavDirective {}
@Directive({selector:'[vfSideNavGroup]',standalone:true,host:{'data-vf-side-nav-group':''}}) export class VfSideNavGroupDirective {}
@Directive({selector:'[vfSideNavGroupLabel]',standalone:true,host:{'data-vf-side-nav-group-label':''}}) export class VfSideNavGroupLabelDirective {}
@Directive({selector:'ul[vfSideNavList]',standalone:true,host:{'data-vf-side-nav-list':''}}) export class VfSideNavListDirective {}
@Directive({selector:'li[vfSideNavItem]',standalone:true,host:{'data-vf-side-nav-item':''}}) export class VfSideNavItemDirective {}
@Directive({selector:'a[vfSideNavLink]',standalone:true,host:{'data-vf-side-nav-link':'','[attr.data-vf-current]':'vfSideNavCurrent() ? "true" : null','[attr.aria-current]':'vfSideNavCurrent() ? "page" : null'}}) export class VfSideNavLinkDirective { readonly vfSideNavCurrent=input(false); }
