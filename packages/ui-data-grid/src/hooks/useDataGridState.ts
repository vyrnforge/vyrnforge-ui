import { useMemo } from "react";
import { createGridState } from "../state";
import type { DataGridState } from "../types/dataGrid.types";
import { useControlledState } from "./useControlledState";

export type UseDataGridStateOptions = {
  /**
   * Controlled grid view state. Supplying this value makes the caller
   * responsible for applying changes received through onStateChange.
   */
  state?: Partial<DataGridState>;
  /**
   * Initial grid view state for uncontrolled usage. Changes after mount do
   * not reset the current uncontrolled state.
   */
  defaultState?: Partial<DataGridState>;
  /** Called whenever the returned setter resolves a new complete grid state. */
  onStateChange?: (nextState: DataGridState) => void;
};

export type UseDataGridStateResult = readonly [
  DataGridState,
  (
    nextState:
      | DataGridState
      | ((currentState: DataGridState) => DataGridState)
  ) => void
];

/**
 * Experimental public hook for coordinating complete DataGridState outside
 * UniversalDataGrid with the same controlled/uncontrolled ownership model.
 */
export function useDataGridState({
  state,
  defaultState,
  onStateChange
}: UseDataGridStateOptions): UseDataGridStateResult {
  const initialState = useMemo(() => createGridState(defaultState), [defaultState]);
  const controlledState = useMemo(
    () => (state ? createGridState(state) : undefined),
    [state]
  );

  return useControlledState(controlledState, initialState, onStateChange);
}
