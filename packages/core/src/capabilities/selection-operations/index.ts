export type SelectionEquality<T> = (left: T, right: T) => boolean;

function defaultEquality<T>(left: T, right: T): boolean {
  return Object.is(left, right);
}

export function selectionContains<T>(
  selection: readonly T[],
  value: T,
  equals: SelectionEquality<T> = defaultEquality,
): boolean {
  return selection.some((candidate) => equals(candidate, value));
}

export function normalizeSelection<T>(
  selection: readonly T[],
  equals: SelectionEquality<T> = defaultEquality,
): T[] {
  const result: T[] = [];
  for (const value of selection) {
    if (!selectionContains(result, value, equals)) result.push(value);
  }
  return result;
}

export function replaceSelection<T>(value: T | null | undefined): T[] {
  return value == null ? [] : [value];
}

export function addToSelection<T>(
  selection: readonly T[],
  value: T,
  equals: SelectionEquality<T> = defaultEquality,
): T[] {
  const normalized = normalizeSelection(selection, equals);
  return selectionContains(normalized, value, equals) ? normalized : [...normalized, value];
}

export function removeFromSelection<T>(
  selection: readonly T[],
  value: T,
  equals: SelectionEquality<T> = defaultEquality,
): T[] {
  return normalizeSelection(selection, equals).filter((candidate) => !equals(candidate, value));
}

export function toggleSelection<T>(
  selection: readonly T[],
  value: T,
  equals: SelectionEquality<T> = defaultEquality,
): T[] {
  return selectionContains(selection, value, equals)
    ? removeFromSelection(selection, value, equals)
    : addToSelection(selection, value, equals);
}
