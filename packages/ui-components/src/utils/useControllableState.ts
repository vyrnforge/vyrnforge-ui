import { useCallback, useState } from "react";

export function useControllableState<T>({
  defaultValue,
  onChange,
  value
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [currentValue, setValue] as const;
}
