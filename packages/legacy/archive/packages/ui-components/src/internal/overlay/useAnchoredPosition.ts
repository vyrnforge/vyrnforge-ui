import { resolveOverlayPosition } from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type {
  AnchoredPosition,
  AnchoredPositionOptions,
} from "./overlay.types";

const useSafeLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useAnchoredPosition({
  anchor,
  floating,
  flip = true,
  matchAnchorWidth = false,
  offset = 8,
  placement = "bottom-start",
  shift = true,
  viewportPadding = 8,
}: AnchoredPositionOptions): AnchoredPosition {
  const [position, setPosition] = useState<AnchoredPosition>({
    x: 0,
    y: 0,
    resolvedPlacement: placement,
    strategy: "fixed",
    ready: false,
    update: () => undefined,
  });

  const update = useCallback(() => {
    if (!anchor || !floating || typeof window === "undefined") return;

    const anchorRect = anchor.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const next = resolveOverlayPosition(
      anchorRect,
      floatingRect,
      { width: window.innerWidth, height: window.innerHeight },
      { flip, offset, placement, shift, viewportPadding },
    );

    if (matchAnchorWidth) {
      floating.style.setProperty(
        "--vf-overlay-anchor-width",
        `${anchorRect.width}px`,
      );
    } else {
      floating.style.removeProperty("--vf-overlay-anchor-width");
    }

    setPosition((current) => ({ ...current, ...next, ready: true }));
  }, [
    anchor,
    flip,
    floating,
    matchAnchorWidth,
    offset,
    placement,
    shift,
    viewportPadding,
  ]);

  useSafeLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!anchor || !floating || typeof window === "undefined") return;

    const handleUpdate = () => update();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(handleUpdate);
    resizeObserver?.observe(anchor);
    resizeObserver?.observe(floating);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      resizeObserver?.disconnect();
    };
  }, [anchor, floating, update]);

  return { ...position, update };
}
