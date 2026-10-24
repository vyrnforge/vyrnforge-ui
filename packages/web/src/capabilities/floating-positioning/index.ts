export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
export type FloatingAlignment = 'start' | 'center' | 'end';
export type FloatingPlacement = FloatingSide | `${FloatingSide}-start` | `${FloatingSide}-end`;
export type FloatingStrategy = 'fixed' | 'absolute';

export interface FloatingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface FloatingSize {
  width: number;
  height: number;
}

export interface FloatingPositionOptions {
  placement?: FloatingPlacement;
  offset?: number;
  crossOffset?: number;
  padding?: number;
  flip?: boolean;
  shift?: boolean;
  arrowSize?: number;
  arrowPadding?: number;
  strategy?: FloatingStrategy;
}

export interface FloatingPositionResult {
  x: number;
  y: number;
  placement: FloatingPlacement;
  availableWidth: number;
  availableHeight: number;
  arrowX: number | null;
  arrowY: number | null;
}

function splitPlacement(placement: FloatingPlacement): [FloatingSide, FloatingAlignment] {
  const [side, alignment = 'center'] = placement.split('-') as [FloatingSide, FloatingAlignment?];
  return [side, alignment ?? 'center'];
}

function oppositeSide(side: FloatingSide): FloatingSide {
  if (side === 'top') return 'bottom';
  if (side === 'bottom') return 'top';
  if (side === 'left') return 'right';
  return 'left';
}

function placementFor(side: FloatingSide, alignment: FloatingAlignment): FloatingPlacement {
  return alignment === 'center' ? side : `${side}-${alignment}`;
}

function sideSpace(anchor: FloatingRect, viewport: FloatingRect, side: FloatingSide, padding: number): number {
  if (side === 'top') return anchor.top - viewport.top - padding;
  if (side === 'bottom') return viewport.bottom - anchor.bottom - padding;
  if (side === 'left') return anchor.left - viewport.left - padding;
  return viewport.right - anchor.right - padding;
}

function coordinates(anchor: FloatingRect, floating: FloatingSize, side: FloatingSide, alignment: FloatingAlignment, offset: number, crossOffset: number): { x: number; y: number } {
  let x = anchor.left + (anchor.width - floating.width) / 2;
  let y = anchor.top + (anchor.height - floating.height) / 2;

  if (side === 'top') y = anchor.top - floating.height - offset;
  if (side === 'bottom') y = anchor.bottom + offset;
  if (side === 'left') x = anchor.left - floating.width - offset;
  if (side === 'right') x = anchor.right + offset;

  const vertical = side === 'top' || side === 'bottom';
  if (alignment === 'start') {
    if (vertical) x = anchor.left + crossOffset;
    else y = anchor.top + crossOffset;
  } else if (alignment === 'end') {
    if (vertical) x = anchor.right - floating.width + crossOffset;
    else y = anchor.bottom - floating.height + crossOffset;
  } else if (vertical) x += crossOffset;
  else y += crossOffset;

  return { x, y };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function computeFloatingPosition(
  anchor: FloatingRect,
  floating: FloatingSize,
  viewport: FloatingRect,
  options: FloatingPositionOptions = {},
): FloatingPositionResult {
  const requested = options.placement ?? 'bottom';
  const padding = options.padding ?? 8;
  const offset = options.offset ?? 4;
  const crossOffset = options.crossOffset ?? 0;
  let [side, alignment] = splitPlacement(requested);
  const mainSize = side === 'top' || side === 'bottom' ? floating.height : floating.width;

  if (options.flip ?? true) {
    const currentSpace = sideSpace(anchor, viewport, side, padding);
    const opposite = oppositeSide(side);
    const oppositeSpace = sideSpace(anchor, viewport, opposite, padding);
    if (currentSpace < mainSize + offset && oppositeSpace > currentSpace) side = opposite;
  }

  let { x, y } = coordinates(anchor, floating, side, alignment, offset, crossOffset);
  if (options.shift ?? true) {
    x = clamp(x, viewport.left + padding, viewport.right - padding - floating.width);
    y = clamp(y, viewport.top + padding, viewport.bottom - padding - floating.height);
  }

  const placement = placementFor(side, alignment);
  const availableWidth = Math.max(0, viewport.width - padding * 2);
  const availableHeight = Math.max(0, viewport.height - padding * 2);
  const arrowSize = options.arrowSize ?? 0;
  const arrowPadding = options.arrowPadding ?? 4;
  let arrowX: number | null = null;
  let arrowY: number | null = null;
  if (arrowSize > 0) {
    if (side === 'top' || side === 'bottom') {
      const center = anchor.left + anchor.width / 2 - x - arrowSize / 2;
      arrowX = clamp(center, arrowPadding, Math.max(arrowPadding, floating.width - arrowSize - arrowPadding));
    } else {
      const center = anchor.top + anchor.height / 2 - y - arrowSize / 2;
      arrowY = clamp(center, arrowPadding, Math.max(arrowPadding, floating.height - arrowSize - arrowPadding));
    }
  }

  return { x, y, placement, availableWidth, availableHeight, arrowX, arrowY };
}

function rectFromDomRect(rect: DOMRect): FloatingRect {
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
}

export function positionFloatingElement(
  anchor: Element,
  floating: HTMLElement,
  options: FloatingPositionOptions = {},
): FloatingPositionResult {
  const ownerWindow = anchor.ownerDocument.defaultView;
  if (!ownerWindow) throw new Error('Floating positioning requires a live browser window.');
  const doc = anchor.ownerDocument.documentElement;
  const viewport: FloatingRect = { left: 0, top: 0, right: doc.clientWidth, bottom: doc.clientHeight, width: doc.clientWidth, height: doc.clientHeight };
  const anchorRect = rectFromDomRect(anchor.getBoundingClientRect());
  const floatingRect = floating.getBoundingClientRect();
  const result = computeFloatingPosition(anchorRect, { width: floatingRect.width, height: floatingRect.height }, viewport, options);
  const strategy = options.strategy ?? 'fixed';
  const scrollX = strategy === 'absolute' ? ownerWindow.scrollX : 0;
  const scrollY = strategy === 'absolute' ? ownerWindow.scrollY : 0;
  floating.style.position = strategy;
  floating.style.left = `${result.x + scrollX}px`;
  floating.style.top = `${result.y + scrollY}px`;
  floating.style.setProperty('--vf-floating-available-width', `${result.availableWidth}px`);
  floating.style.setProperty('--vf-floating-available-height', `${result.availableHeight}px`);
  floating.dataset.vfPlacement = result.placement;
  return result;
}

export function autoUpdateFloatingPosition(
  anchor: Element,
  floating: HTMLElement,
  options: FloatingPositionOptions = {},
  onPosition?: (result: FloatingPositionResult) => void,
): () => void {
  const ownerWindow = anchor.ownerDocument.defaultView;
  if (!ownerWindow) return () => undefined;
  let frame = 0;
  const update = () => {
    if (frame) ownerWindow.cancelAnimationFrame(frame);
    frame = ownerWindow.requestAnimationFrame(() => {
      frame = 0;
      onPosition?.(positionFloatingElement(anchor, floating, options));
    });
  };
  ownerWindow.addEventListener('resize', update);
  ownerWindow.addEventListener('scroll', update, true);
  const Observer = ownerWindow.ResizeObserver;
  const observer = Observer ? new Observer(update) : null;
  observer?.observe(anchor);
  observer?.observe(floating);
  update();
  return () => {
    if (frame) ownerWindow.cancelAnimationFrame(frame);
    ownerWindow.removeEventListener('resize', update);
    ownerWindow.removeEventListener('scroll', update, true);
    observer?.disconnect();
  };
}
