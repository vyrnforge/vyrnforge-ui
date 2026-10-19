import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PortalProps } from "./overlay.types";

export function Portal({ children, container, disabled = false }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  // Do not mount portal content inline before the real portal is available.
  // Mounting it twice causes focus scopes to capture the wrong return target,
  // particularly under React Strict Mode.
  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, container ?? document.body);
}
