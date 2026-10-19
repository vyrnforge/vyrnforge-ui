import { useCallback, useRef } from "react";

export interface ReactCanonicalModelOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export interface ReactCanonicalModel<T> {
  value: T;
  controlled: boolean;
  propose: (value: T) => void;
}

export function resolveReactCanonicalModel<T>(
  value: T | undefined,
  defaultValue: T,
): { value: T; controlled: boolean } {
  return value === undefined
    ? { value: defaultValue, controlled: false }
    : { value, controlled: true };
}

export function useReactCanonicalModel<T>({
  value,
  defaultValue,
  onChange,
}: ReactCanonicalModelOptions<T>): ReactCanonicalModel<T> {
  const initial = resolveReactCanonicalModel(value, defaultValue);
  const uncontrolledRef = useRef(initial.value);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledRef.current;

  const propose = useCallback(
    (nextValue: T) => {
      if (!controlled) uncontrolledRef.current = nextValue;
      onChange?.(nextValue);
    },
    [controlled, onChange],
  );

  return {
    value: currentValue,
    controlled,
    propose,
  };
}
