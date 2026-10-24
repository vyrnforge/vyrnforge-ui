import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { autoUpdateFloatingPosition, type FloatingPlacement } from '@vyrnforge/web/floating-positioning';
import { createDismissalCoordinator, type DismissalReason } from '@vyrnforge/web/dismissal-coordination';

export interface FloatingSurfaceOptions {
  open: Ref<boolean>;
  anchor: Ref<HTMLElement | null>;
  surface: Ref<HTMLElement | null>;
  placement: Ref<FloatingPlacement>;
  dismissOnOutsidePointer?: boolean;
  dismissOnOutsideFocus?: boolean;
  onDismiss(reason: DismissalReason): void;
}

export function useFloatingSurface(options: FloatingSurfaceOptions): { portalTarget: Ref<Element | null> } {
  const portalTarget = ref<Element | null>(null);
  let cleanup: (() => void) | null = null;
  function stop() { cleanup?.(); cleanup = null; }
  async function sync() {
    stop();
    if (!options.open.value) return;
    await nextTick();
    const anchor = options.anchor.value;
    const surface = options.surface.value;
    if (!anchor || !surface) return;
    const stopPositioning = autoUpdateFloatingPosition(anchor, surface, { placement: options.placement.value, offset: 6 });
    const coordinator = createDismissalCoordinator(surface.ownerDocument);
    const unregister = coordinator.register({
      element: surface,
      branches: [anchor],
      dismissOnOutsidePointer: options.dismissOnOutsidePointer ?? true,
      dismissOnOutsideFocus: options.dismissOnOutsideFocus ?? false,
      onDismiss: options.onDismiss,
    });
    cleanup = () => { unregister(); coordinator.destroy(); stopPositioning(); };
  }
  onMounted(() => { portalTarget.value = document.body; void sync(); });
  watch([options.open, options.placement], () => { void sync(); });
  onBeforeUnmount(stop);
  return { portalTarget };
}
