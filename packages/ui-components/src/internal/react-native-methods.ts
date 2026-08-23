export type CanonicalMethodNames<TElement extends object> = ReadonlyArray<
  Extract<keyof TElement, string>
>;

export function createCanonicalMethodHandle<
  TElement extends object,
  TMethodName extends Extract<keyof TElement, string>,
>(
  element: TElement,
  methodNames: ReadonlyArray<TMethodName>,
): Pick<TElement, TMethodName> {
  const handle: Partial<Pick<TElement, TMethodName>> = {};

  for (const methodName of methodNames) {
    const method = element[methodName];
    if (typeof method !== "function") {
      throw new TypeError(
        `Canonical element method ${String(methodName)} is not callable`,
      );
    }

    Object.defineProperty(handle, methodName, {
      enumerable: true,
      configurable: false,
      value: (...args: unknown[]) =>
        (method as (...methodArgs: unknown[]) => unknown).apply(element, args),
    });
  }

  return handle as Pick<TElement, TMethodName>;
}

export function assignForwardedRef<T>(
  ref: ((value: T | null) => void) | { current: T | null } | null | undefined,
  value: T | null,
): void {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) ref.current = value;
}
