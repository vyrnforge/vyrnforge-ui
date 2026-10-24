import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface PortalProps {
  children?: ReactNode;
  target?: Element | DocumentFragment | null;
  disabled?: boolean;
}

export function Portal({ children, target = null, disabled = false }: PortalProps): ReactNode {
  if (disabled || !target || typeof document === 'undefined') return children ?? null;
  return createPortal(children, target);
}
