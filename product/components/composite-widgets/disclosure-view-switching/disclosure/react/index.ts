import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

interface DisclosureContextValue {
  panelId: string;
  open: boolean;
  disabled: boolean;
  setOpen(next: boolean): void;
}
const DisclosureContext = createContext<DisclosureContextValue | null>(null);
function useDisclosureContext(): DisclosureContextValue {
  const value = useContext(DisclosureContext);
  if (!value) throw new Error('VyrnForge Disclosure parts must be rendered inside DisclosureRoot.');
  return value;
}

export interface DisclosureRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** ID shared by the panel and trigger's aria-controls. Defaults to the root ID plus -panel. */
  panelId?: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export const DisclosureRoot = forwardRef<HTMLDivElement, DisclosureRootProps>(function DisclosureRoot(
  { open, defaultOpen = false, disabled = false, onOpenChange, id, panelId, children, ...props },
  ref,
) {
  const generated = useId().replaceAll(':', '');
  const rootId = id ?? `vf-disclosure-${generated}`;
  const resolvedPanelId = panelId ?? `${rootId}-panel`;
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const expanded = controlled ? open : internalOpen;
  const context = useMemo<DisclosureContextValue>(
    () => ({
      panelId: resolvedPanelId,
      open: expanded,
      disabled,
      setOpen(next) {
        if (disabled || next === expanded) return;
        if (!controlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
    }),
    [controlled, disabled, expanded, onOpenChange, resolvedPanelId],
  );
  return createElement(
    DisclosureContext.Provider,
    { value: context },
    createElement(
      'div',
      {
        ...props,
        id: rootId,
        ref,
        'data-vf-disclosure-root': '',
        'data-vf-open': expanded ? '' : undefined,
        'data-vf-disabled': disabled ? '' : undefined,
      },
      children,
    ),
  );
});

export type DisclosureTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const DisclosureTrigger = forwardRef<HTMLButtonElement, DisclosureTriggerProps>(function DisclosureTrigger(
  { disabled, onClick, type = 'button', ...props },
  ref,
) {
  const context = useDisclosureContext();
  const isDisabled = context.disabled || Boolean(disabled);
  return createElement('button', {
    ...props,
    ref,
    type,
    disabled: isDisabled,
    'aria-expanded': context.open,
    'aria-controls': context.panelId,
    'data-vf-disclosure-trigger': '',
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !isDisabled) context.setOpen(!context.open);
    },
  });
});

export type DisclosurePanelProps = HTMLAttributes<HTMLDivElement>;
export const DisclosurePanel = forwardRef<HTMLDivElement, DisclosurePanelProps>(function DisclosurePanel(props, ref) {
  const context = useDisclosureContext();
  return createElement('div', {
    ...props,
    ref,
    id: context.panelId,
    hidden: !context.open,
    'data-vf-disclosure-panel': '',
    'data-vf-open': context.open ? '' : undefined,
  });
});
