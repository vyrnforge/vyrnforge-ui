import {
  createNavigationController,
  type BehaviorChangeReason,
  type CollectionMoveIntent,
  type NavigationController,
  type NavigationDismissReason,
  type NavigationItem,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot } from "./useBehaviorSnapshot";

export function useNavigationBehavior({
  activeId,
  dismissOnSelect = false,
  items,
  loop = true,
  selectedId,
}: {
  activeId?: string | null;
  dismissOnSelect?: boolean;
  items: readonly NavigationItem[];
  loop?: boolean;
  selectedId?: string | null;
}) {
  const controllerRef = useRef<NavigationController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = createNavigationController({
      items,
      activeId,
      selectedId,
      dismissOnSelect,
      loop,
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    controller.replaceItems(items);
  }, [controller, items]);

  useEffect(() => {
    if (activeId !== undefined) {
      controller.setActiveId(activeId, "programmatic");
    }
  }, [activeId, controller]);

  useEffect(() => {
    if (selectedId !== undefined) {
      controller.syncSelectedId(selectedId);
    }
  }, [controller, selectedId]);

  const dismiss = useCallback(
    (reason: NavigationDismissReason) => controller.dismiss(reason),
    [controller],
  );
  const isDisabled = useCallback(
    (id: string) => controller.isDisabled(id),
    [controller],
  );
  const moveActive = useCallback(
    (intent: CollectionMoveIntent, reason: BehaviorChangeReason = "keyboard") =>
      controller.moveActive(intent, reason),
    [controller],
  );
  const select = useCallback(
    (id: string, reason: BehaviorChangeReason = "selection") =>
      controller.select(id, reason),
    [controller],
  );
  const setActiveId = useCallback(
    (id: string | null, reason: BehaviorChangeReason = "programmatic") =>
      controller.setActiveId(id, reason),
    [controller],
  );

  return useMemo(
    () => ({
      activeId: snapshot.activeId,
      selectedId: snapshot.selectedId,
      dismiss,
      isDisabled,
      moveActive,
      select,
      setActiveId,
    }),
    [
      dismiss,
      isDisabled,
      moveActive,
      select,
      setActiveId,
      snapshot.activeId,
      snapshot.selectedId,
    ],
  );
}
