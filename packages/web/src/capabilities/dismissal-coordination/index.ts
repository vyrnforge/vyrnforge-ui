export type DismissalReason = 'escape' | 'outside-pointer' | 'outside-focus';

export interface DismissalLayer {
  element: Element;
  branches?: readonly Element[] | (() => Iterable<Element>);
  enabled?: boolean;
  dismissOnEscape?: boolean;
  dismissOnOutsidePointer?: boolean;
  dismissOnOutsideFocus?: boolean;
  onDismiss(reason: DismissalReason, event: Event): void;
}

export interface DismissalCoordinator {
  register(layer: DismissalLayer): () => void;
  destroy(): void;
}

function branchesFor(layer: DismissalLayer): Element[] {
  const branches = typeof layer.branches === 'function' ? layer.branches() : layer.branches;
  return branches ? Array.from(branches) : [];
}

function eventIsInside(layer: DismissalLayer, event: Event): boolean {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
  if (path.includes(layer.element)) return true;
  return branchesFor(layer).some((branch) => path.includes(branch));
}

function isEscapeKeyEvent(event: Event): event is KeyboardEvent {
  return 'key' in event && event.key === 'Escape';
}

export function createDismissalCoordinator(ownerDocument: Document): DismissalCoordinator {
  const layers: DismissalLayer[] = [];
  let listening = false;

  const topLayer = () => {
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (layer && layer.enabled !== false) return layer;
    }
    return null;
  };

  const onKeyDown = (event: Event) => {
    if (!isEscapeKeyEvent(event)) return;
    const layer = topLayer();
    if (layer && layer.dismissOnEscape !== false) layer.onDismiss('escape', event);
  };
  const onPointerDown = (event: Event) => {
    const layer = topLayer();
    if (layer && layer.dismissOnOutsidePointer !== false && !eventIsInside(layer, event)) layer.onDismiss('outside-pointer', event);
  };
  const onFocusIn = (event: Event) => {
    const layer = topLayer();
    if (layer && layer.dismissOnOutsideFocus && !eventIsInside(layer, event)) layer.onDismiss('outside-focus', event);
  };

  const listen = () => {
    if (listening) return;
    listening = true;
    ownerDocument.addEventListener('keydown', onKeyDown, true);
    ownerDocument.addEventListener('pointerdown', onPointerDown, true);
    ownerDocument.addEventListener('focusin', onFocusIn, true);
  };
  const unlisten = () => {
    if (!listening) return;
    listening = false;
    ownerDocument.removeEventListener('keydown', onKeyDown, true);
    ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
    ownerDocument.removeEventListener('focusin', onFocusIn, true);
  };

  return {
    register(layer) {
      layers.push(layer);
      listen();
      return () => {
        const index = layers.lastIndexOf(layer);
        if (index >= 0) layers.splice(index, 1);
        if (layers.length === 0) unlisten();
      };
    },
    destroy() {
      layers.length = 0;
      unlisten();
    },
  };
}
