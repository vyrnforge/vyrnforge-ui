import {
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

export type DialogDismissReason = 'escape' | 'backdrop' | 'close-control';

export interface DialogDismissRequest {
  readonly reason: DialogDismissReason;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

function createDismissRequest(reason: DialogDismissReason): DialogDismissRequest {
  let prevented = false;
  return {
    reason,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

interface DialogContextValue {
  rootId: string;
  titleId: string;
  descriptionId: string | undefined;
  requestDismiss(reason: DialogDismissReason): void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error('VyrnForge Dialog compound components must be rendered inside DialogRoot.');
  return context;
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]'));
}

function isBackdropHit(event: {
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  button: number;
  clientX: number;
  clientY: number;
}): boolean {
  if (event.target !== event.currentTarget || event.button !== 0) return false;
  const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
  return (
    event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  );
}

export interface DialogRootProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'open' | 'onCancel' | 'onClose'
> {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismissRequest?: (request: DialogDismissRequest) => void;
  backdropDismiss?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  titleId?: string;
  descriptionId?: string;
}

export const DialogRoot = forwardRef<HTMLDialogElement, DialogRootProps>(function DialogRoot(
  {
    open,
    defaultOpen = false,
    onOpenChange,
    onDismissRequest,
    backdropDismiss = false,
    initialFocusRef,
    titleId: titleIdProp,
    descriptionId,
    id,
    children,
    onPointerDown,
    onPointerCancel,
    onClick,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId().replaceAll(':', '');
  const rootId = id ?? `vf-dialog-${generatedId}`;
  const titleId = titleIdProp ?? `${rootId}-title`;
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const desiredOpen = controlled ? open : internalOpen;
  const desiredOpenRef = useRef(desiredOpen);
  desiredOpenRef.current = desiredOpen;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreTargetRef = useRef<HTMLElement | null>(null);
  const backdropPointerDownRef = useRef(false);

  useImperativeHandle(forwardedRef, () => dialogRef.current as HTMLDialogElement, []);

  const requestDismiss = useCallback(
    (reason: DialogDismissReason) => {
      const request = createDismissRequest(reason);
      onDismissRequest?.(request);
      if (request.defaultPrevented) return;
      if (!controlled) setInternalOpen(false);
      onOpenChange?.(false);
    },
    [controlled, onDismissRequest, onOpenChange],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (desiredOpen && !dialog.open) {
      restoreTargetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      initialFocusRef?.current?.focus();
      return;
    }

    if (!desiredOpen && dialog.open) dialog.close();
  }, [desiredOpen, initialFocusRef]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const activeDialog = dialog;

    function restoreFocus() {
      const restoreTarget = restoreTargetRef.current;
      restoreTargetRef.current = null;
      const focused = activeDialog.ownerDocument.activeElement;
      if (
        canRestoreFocus(restoreTarget) &&
        (!focused || focused === activeDialog.ownerDocument.body || activeDialog.contains(focused))
      )
        restoreTarget.focus();
    }

    function handleCancel(event: Event) {
      if (event.defaultPrevented) return;
      event.preventDefault();
      requestDismiss('escape');
    }

    function handleClose() {
      if (activeDialog.open) return;
      if (desiredOpenRef.current) {
        if (!controlled) setInternalOpen(false);
        onOpenChange?.(false);
        if (controlled) {
          queueMicrotask(() => {
            if (desiredOpenRef.current && activeDialog.isConnected && !activeDialog.open) {
              activeDialog.showModal();
              initialFocusRef?.current?.focus();
            } else if (!desiredOpenRef.current) {
              restoreFocus();
            }
          });
          return;
        }
      }
      restoreFocus();
    }

    activeDialog.addEventListener('cancel', handleCancel);
    activeDialog.addEventListener('close', handleClose);
    return () => {
      activeDialog.removeEventListener('cancel', handleCancel);
      activeDialog.removeEventListener('close', handleClose);
    };
  }, [controlled, initialFocusRef, onOpenChange, requestDismiss]);

  const context = useMemo<DialogContextValue>(
    () => ({
      rootId,
      titleId,
      descriptionId,
      requestDismiss,
    }),
    [descriptionId, requestDismiss, rootId, titleId],
  );

  return createElement(
    DialogContext.Provider,
    { value: context },
    createElement('dialog', {
      ...props,
      id: rootId,
      ref: dialogRef,
      'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : titleId),
      'aria-describedby': props['aria-describedby'] ?? descriptionId,
      'data-vf-dialog-root': '',
      'data-vf-open': desiredOpen ? '' : undefined,
      'data-vf-backdrop-dismiss': backdropDismiss ? '' : undefined,
      onPointerDown(event: ReactPointerEvent<HTMLDialogElement>) {
        onPointerDown?.(event);
        backdropPointerDownRef.current = !event.defaultPrevented && isBackdropHit(event);
      },
      onPointerCancel(event: ReactPointerEvent<HTMLDialogElement>) {
        onPointerCancel?.(event);
        backdropPointerDownRef.current = false;
      },
      onClick(event: ReactMouseEvent<HTMLDialogElement>) {
        onClick?.(event);
        const isBackdrop = backdropPointerDownRef.current && isBackdropHit(event);
        backdropPointerDownRef.current = false;
        if (!event.defaultPrevented && backdropDismiss && isBackdrop) requestDismiss('backdrop');
      },
      children,
    }),
  );
});

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;
export function DialogTitle({ id, ...props }: DialogTitleProps) {
  const context = useDialogContext();
  return createElement('h2', { ...props, id: id ?? context.titleId, 'data-vf-dialog-title': '' });
}

export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export function DialogDescription({ id, ...props }: DialogDescriptionProps) {
  const context = useDialogContext();
  return createElement('p', {
    ...props,
    id: id ?? context.descriptionId ?? `${context.rootId}-description`,
    'data-vf-dialog-description': '',
  });
}

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement> & { divider?: boolean };
export function DialogHeader({ divider = false, ...props }: DialogHeaderProps): ReactElement {
  return createElement('div', {
    ...props,
    'data-vf-dialog-header': '',
    'data-vf-divider': divider ? '' : undefined,
  });
}

export type DialogFooterProps = HTMLAttributes<HTMLDivElement> & { divider?: boolean };
export function DialogFooter({ divider = false, ...props }: DialogFooterProps): ReactElement {
  return createElement('div', {
    ...props,
    'data-vf-dialog-footer': '',
    'data-vf-divider': divider ? '' : undefined,
  });
}

export type DialogBodyProps = HTMLAttributes<HTMLDivElement>;
export function DialogBody(props: DialogBodyProps) {
  return createElement('div', { ...props, 'data-vf-dialog-body': '' });
}

export type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
export function DialogClose({ type = 'button', onClick, ...props }: DialogCloseProps) {
  const context = useDialogContext();
  return createElement('button', {
    ...props,
    type,
    'data-vf-dialog-close': '',
    onClick(event: ReactMouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (!event.defaultPrevented) context.requestDismiss('close-control');
    },
  });
}
