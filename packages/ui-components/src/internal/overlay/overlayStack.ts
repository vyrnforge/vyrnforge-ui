import {
  createOverlayLayerRegistry,
  type OverlayLayerHandle,
} from "@vyrnforge/ui-behaviors";
import { useEffect, useRef, useState } from "react";

const overlayRegistry = createOverlayLayerRegistry({ baseStackIndex: 1000 });

export function useOverlayStack(enabled: boolean) {
  const handleRef = useRef<OverlayLayerHandle | null>(null);
  const [stackIndex, setStackIndex] = useState(1000);

  useEffect(() => {
    if (!enabled) {
      handleRef.current = null;
      setStackIndex(1000);
      return;
    }

    const handle = overlayRegistry.register();
    handleRef.current = handle;
    setStackIndex(handle.stackIndex);

    return () => {
      handle.release();
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [enabled]);

  return {
    isTopmost: () => handleRef.current?.isTopmost() ?? true,
    zIndex: stackIndex,
  };
}
