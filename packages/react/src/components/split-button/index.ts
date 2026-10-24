import { createElement, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger, type MenuContentProps, type MenuItemProps } from '../menu/index.js';
export interface SplitButtonRootProps extends ComponentPropsWithoutRef<'div'> { children?: ReactNode; }
export const SplitButtonRoot = forwardRef<HTMLDivElement, SplitButtonRootProps>(function SplitButtonRoot({ children, ...props }, ref) { return createElement(MenuRoot, null, createElement('div', { ...props, ref, 'data-vf-split-button-root': '' }, children)); });
export type SplitButtonActionProps = ComponentPropsWithoutRef<'button'>;
export const SplitButtonAction = forwardRef<HTMLButtonElement, SplitButtonActionProps>(function SplitButtonAction(props, ref) { return createElement('button', { ...props, ref, type: props.type ?? 'button', 'data-vf-split-button-action': '' }); });
export const SplitButtonTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function SplitButtonTrigger(props, ref) { return createElement(MenuTrigger, { ...props, ref, 'data-vf-split-button-trigger': '', 'aria-label': props['aria-label'] ?? 'More actions' }); });
export type SplitButtonContentProps = MenuContentProps;
export const SplitButtonContent = MenuContent;
export type SplitButtonItemProps = MenuItemProps;
export const SplitButtonItem = MenuItem;
