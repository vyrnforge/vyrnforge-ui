import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { AnchoredPosition, AnchoredPositionOptions, OverlayPlacement } from "./overlay.types";

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Position = Pick<AnchoredPosition, "x" | "y" | "resolvedPlacement">;

function oppositePlacement(placement: OverlayPlacement): OverlayPlacement {
  if (placement.startsWith("bottom")) return placement.replace("bottom", "top") as OverlayPlacement;
  if (placement.startsWith("top")) return placement.replace("top", "bottom") as OverlayPlacement;
  if (placement === "left") return "right";
  return "left";
}

function calculatePosition(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  placement: OverlayPlacement,
  offset: number
): Position {
  switch (placement) {
    case "top":
      return { x: anchorRect.left + (anchorRect.width - floatingRect.width) / 2, y: anchorRect.top - floatingRect.height - offset, resolvedPlacement: placement };
    case "top-start":
      return { x: anchorRect.left, y: anchorRect.top - floatingRect.height - offset, resolvedPlacement: placement };
    case "top-end":
      return { x: anchorRect.right - floatingRect.width, y: anchorRect.top - floatingRect.height - offset, resolvedPlacement: placement };
    case "bottom":
      return { x: anchorRect.left + (anchorRect.width - floatingRect.width) / 2, y: anchorRect.bottom + offset, resolvedPlacement: placement };
    case "bottom-end":
      return { x: anchorRect.right - floatingRect.width, y: anchorRect.bottom + offset, resolvedPlacement: placement };
    case "left":
      return { x: anchorRect.left - floatingRect.width - offset, y: anchorRect.top + (anchorRect.height - floatingRect.height) / 2, resolvedPlacement: placement };
    case "right":
      return { x: anchorRect.right + offset, y: anchorRect.top + (anchorRect.height - floatingRect.height) / 2, resolvedPlacement: placement };
    default:
      return { x: anchorRect.left, y: anchorRect.bottom + offset, resolvedPlacement: "bottom-start" };
  }
}

function overflowsViewport(position: Position, floatingRect: DOMRect, padding: number) {
  return (
    position.x < padding ||
    position.y < padding ||
    position.x + floatingRect.width > window.innerWidth - padding ||
    position.y + floatingRect.height > window.innerHeight - padding
  );
}

export function useAnchoredPosition({
  anchor,
  floating,
  flip = true,
  matchAnchorWidth = false,
  offset = 8,
  placement = "bottom-start",
  shift = true,
  viewportPadding = 8
}: AnchoredPositionOptions): AnchoredPosition {
  const [position, setPosition] = useState<AnchoredPosition>({
    x: 0,
    y: 0,
    resolvedPlacement: placement,
    strategy: "fixed",
    ready: false,
    update: () => undefined
  });

  const update = useCallback(() => {
    if (!anchor || !floating || typeof window === "undefined") {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    let next = calculatePosition(anchorRect, floatingRect, placement, offset);

    if (flip && overflowsViewport(next, floatingRect, viewportPadding)) {
      const flipped = calculatePosition(anchorRect, floatingRect, oppositePlacement(placement), offset);
      if (!overflowsViewport(flipped, floatingRect, viewportPadding)) {
        next = flipped;
      }
    }

    if (shift) {
      next = {
        ...next,
        x: Math.min(Math.max(viewportPadding, next.x), window.innerWidth - floatingRect.width - viewportPadding),
        y: Math.min(Math.max(viewportPadding, next.y), window.innerHeight - floatingRect.height - viewportPadding)
      };
    }

    if (matchAnchorWidth) {
      floating.style.setProperty("--dv-overlay-anchor-width", `${anchorRect.width}px`);
    } else {
      floating.style.removeProperty("--dv-overlay-anchor-width");
    }

    setPosition((current) => ({ ...current, ...next, ready: true }));
  }, [anchor, flip, floating, matchAnchorWidth, offset, placement, shift, viewportPadding]);

  useSafeLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!anchor || !floating || typeof window === "undefined") {
      return;
    }

    const handleUpdate = () => update();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    const resizeObserver = typeof ResizeObserver === "undefined"
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
