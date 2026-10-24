import { createContext, createElement, forwardRef, useContext, useId, useMemo, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type AccordionType = 'single' | 'multiple';
export type AccordionValue = string | readonly string[];
interface RootContext { rootId: string; type: AccordionType; openValues: readonly string[]; toggle(value: string): void; }
interface ItemContext { value: string; disabled: boolean; triggerId: string; panelId: string; }
const RootContext = createContext<RootContext | null>(null);
const ItemContext = createContext<ItemContext | null>(null);
function useRoot() { const value = useContext(RootContext); if (!value) throw new Error('VyrnForge Accordion parts must be inside AccordionRoot.'); return value; }
function useItem() { const value = useContext(ItemContext); if (!value) throw new Error('VyrnForge Accordion item parts must be inside AccordionItem.'); return value; }
function toValues(value: AccordionValue | undefined, type: AccordionType): string[] { if (value === undefined) return []; if (type === 'single') return typeof value === 'string' ? [value] : value.slice(0, 1); return typeof value === 'string' ? [value] : [...value]; }
function token(value: string) { return encodeURIComponent(value).replaceAll('%', '_'); }

export interface AccordionRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> { children?: ReactNode; type?: AccordionType; value?: AccordionValue; defaultValue?: AccordionValue; collapsible?: boolean; onValueChange?: (value: AccordionValue) => void; }
export const AccordionRoot = forwardRef<HTMLDivElement, AccordionRootProps>(function AccordionRoot({ type = 'single', value, defaultValue, collapsible = false, onValueChange, id, children, ...props }, ref) {
  const generated = useId().replaceAll(':', ''); const rootId = id ?? `vf-accordion-${generated}`; const controlled = value !== undefined; const [internal, setInternal] = useState<string[]>(() => toValues(defaultValue, type)); const openValues = controlled ? toValues(value, type) : internal;
  const context = useMemo<RootContext>(() => ({ rootId, type, openValues, toggle(itemValue) { const isOpen = openValues.includes(itemValue); let next: string[]; if (type === 'single') next = isOpen ? (collapsible ? [] : openValues) : [itemValue]; else next = isOpen ? openValues.filter((candidate) => candidate !== itemValue) : [...openValues, itemValue]; if (next === openValues || (next.length === openValues.length && next.every((candidate, index) => candidate === openValues[index]))) return; if (!controlled) setInternal(next); onValueChange?.(type === 'single' ? (next[0] ?? '') : next); } }), [collapsible, controlled, onValueChange, openValues, rootId, type]);
  return createElement(RootContext.Provider, { value: context }, createElement('div', { ...props, id: rootId, ref, 'data-vf-accordion-root': '', 'data-vf-type': type }, children));
});

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> { value: string; disabled?: boolean; }
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem({ value, disabled = false, children, ...props }, ref) { const root = useRoot(); const item = useMemo<ItemContext>(() => ({ value, disabled, triggerId: `${root.rootId}-trigger-${token(value)}`, panelId: `${root.rootId}-panel-${token(value)}` }), [disabled, root.rootId, value]); const open = root.openValues.includes(value); return createElement(ItemContext.Provider, { value: item }, createElement('div', { ...props, ref, 'data-vf-accordion-item': '', 'data-vf-open': open ? '' : undefined, 'data-vf-disabled': disabled ? '' : undefined }, children)); });

export type AccordionHeaderProps = HTMLAttributes<HTMLHeadingElement>;
export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(function AccordionHeader(props, ref) { return createElement('h3', { ...props, ref, 'data-vf-accordion-header': '' }); });

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger({ disabled, onClick, onKeyDown, type = 'button', ...props }, ref) { const root = useRoot(); const item = useItem(); const open = root.openValues.includes(item.value); const isDisabled = item.disabled || Boolean(disabled); return createElement('button', { ...props, ref, id: item.triggerId, type, disabled: isDisabled, 'aria-expanded': open, 'aria-controls': item.panelId, 'data-vf-accordion-trigger': '', onClick(event) { onClick?.(event); if (!event.defaultPrevented && !isDisabled) root.toggle(item.value); }, onKeyDown(event) { onKeyDown?.(event); if (event.defaultPrevented) return; let intent: CollectionNavigationIntent | null = null; if (event.key === 'ArrowDown') intent = 'next'; else if (event.key === 'ArrowUp') intent = 'previous'; else if (event.key === 'Home') intent = 'first'; else if (event.key === 'End') intent = 'last'; if (!intent) return; const container = event.currentTarget.closest<HTMLElement>('[data-vf-accordion-root]'); if (!container) return; const triggers = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-vf-accordion-trigger]')); const index = triggers.indexOf(event.currentTarget); const next = resolveEnabledIndex(triggers.map((candidate) => ({ disabled: candidate.disabled })), index, intent); if (next === null) return; event.preventDefault(); triggers[next]?.focus(); } }); });

export type AccordionPanelProps = HTMLAttributes<HTMLDivElement>;
export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(function AccordionPanel(props, ref) { const root = useRoot(); const item = useItem(); const open = root.openValues.includes(item.value); return createElement('div', { ...props, ref, id: props.id ?? item.panelId, role: 'region', hidden: !open, 'aria-labelledby': item.triggerId, 'data-vf-accordion-panel': '', 'data-vf-open': open ? '' : undefined }); });
