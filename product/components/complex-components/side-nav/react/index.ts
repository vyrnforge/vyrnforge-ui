import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react';
export type SideNavProps = ComponentPropsWithoutRef<'nav'>;
export type SideNavGroupProps = ComponentPropsWithoutRef<'section'>;
export type SideNavGroupLabelProps = ComponentPropsWithoutRef<'h2'>;
export type SideNavListProps = ComponentPropsWithoutRef<'ul'>;
export type SideNavItemProps = ComponentPropsWithoutRef<'li'>;
export interface SideNavLinkProps extends ComponentPropsWithoutRef<'a'> { current?: boolean; }
export const SideNav = forwardRef<HTMLElement,SideNavProps>(function SideNav(props,ref){return createElement('nav',{...props,ref,'data-vf-side-nav':''});});
export const SideNavGroup = forwardRef<HTMLElement,SideNavGroupProps>(function SideNavGroup(props,ref){return createElement('section',{...props,ref,'data-vf-side-nav-group':''});});
export const SideNavGroupLabel = forwardRef<HTMLHeadingElement,SideNavGroupLabelProps>(function SideNavGroupLabel(props,ref){return createElement('h2',{...props,ref,'data-vf-side-nav-group-label':''});});
export const SideNavList = forwardRef<HTMLUListElement,SideNavListProps>(function SideNavList(props,ref){return createElement('ul',{...props,ref,'data-vf-side-nav-list':''});});
export const SideNavItem = forwardRef<HTMLLIElement,SideNavItemProps>(function SideNavItem(props,ref){return createElement('li',{...props,ref,'data-vf-side-nav-item':''});});
export const SideNavLink = forwardRef<HTMLAnchorElement,SideNavLinkProps>(function SideNavLink({current=false,...props},ref){return createElement('a',{...props,ref,'data-vf-side-nav-link':'','data-vf-current':current?'true':undefined,'aria-current':current?'page':props['aria-current']});});
