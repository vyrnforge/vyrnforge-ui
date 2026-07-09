import { useMemo } from "react";
import { createGridState } from "../state";
import type { DataGridState } from "../types/dataGrid.types";
import { useControlledState } from "./useControlledState";

export function useDataGridState({
  state,
  defaultState,
  onStateChange
}: {
  state?: Partial<DataGridState>;
  defaultState?: Partial<DataGridState>;
  onStateChange?: (nextState: DataGridState) => void;
}) {
  const initialState = useMemo(() => createGridState(defaultState), [defaultState]);
  const controlledState = useMemo(
    () => (state ? createGridState(state) : undefined),
    [state]
  );

  return useControlledState(controlledState, initialState, onStateChange);
}
