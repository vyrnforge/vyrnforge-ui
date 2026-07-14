import { useEffect, useRef } from "react";

type OverlayEntry = {
  id: number;
  order: number;
};

const overlays = new Map<number, OverlayEntry>();
let nextOverlayId = 1;
let nextOrder = 1;

function registerOverlay(id: number) {
  overlays.set(id, { id, order: nextOrder++ });
}

function unregisterOverlay(id: number) {
  overlays.delete(id);
}

function isTopmostOverlay(id: number) {
  let topmost: OverlayEntry | undefined;

  overlays.forEach((entry) => {
    if (!topmost || entry.order > topmost.order) {
      topmost = entry;
    }
  });

  return topmost?.id === id;
}

export function useOverlayStack(enabled: boolean) {
  const idRef = useRef<number | undefined>(undefined);

  if (idRef.current === undefined) {
    idRef.current = nextOverlayId++;
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    registerOverlay(idRef.current!);

    return () => {
      unregisterOverlay(idRef.current!);
    };
  }, [enabled]);

  return {
    isTopmost: () => isTopmostOverlay(idRef.current!),
    zIndex: 1000 + idRef.current!
  };
}
