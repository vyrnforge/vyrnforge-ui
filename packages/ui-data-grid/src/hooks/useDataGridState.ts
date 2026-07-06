import { useMemo } from "react";
import { createGridState } from "../core/createGridState";
import type { DataGridState } from "../types/dataGrid.types";
import { useControlledState } from "./useControlledState";

export function useDataGridState({
  state,
  defaultState,
  onStateChange
}: {
  state?: DataGridState;
  defaultState?: Partial<DataGridState>;
  onStateChange?: (nextState: DataGridState) => void;
}) {
  const initialState = useMemo(() => createGridState(defaultState), [defaultState]);
  return useControlledState(state, initialState, onStateChange);
}
