import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

function lockBodyScroll() {
  if (typeof document === "undefined") {
    return;
  }

  if (lockCount === 0) {
    const { body, documentElement } = document;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined" || lockCount === 0) {
    return;
  }

  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
}

export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    lockBodyScroll();
    return unlockBodyScroll;
  }, [enabled]);
}
