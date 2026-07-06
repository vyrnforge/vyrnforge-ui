import { useCallback, useState } from "react";

export function useControlledState<State>(
  controlledValue: State | undefined,
  defaultValue: State,
  onChange?: (nextValue: State) => void
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: State | ((currentValue: State) => State)) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: State) => State)(value)
          : nextValue;

      if (!isControlled) {
        setUncontrolledValue(resolvedValue);
      }

      onChange?.(resolvedValue);
    },
    [isControlled, onChange, value]
  );

  return [value, setValue] as const;
}
