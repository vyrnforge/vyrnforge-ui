import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PortalProps } from "./overlay.types";

export function Portal({ children, container, disabled = false }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled || !mounted || typeof document === "undefined") {
    return <>{children}</>;
  }

  return createPortal(children, container ?? document.body);
}
