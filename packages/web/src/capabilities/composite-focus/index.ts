export interface FocusCompositeOptions {
  preventScroll?: boolean;
}

export function applyRovingTabIndex(
  elements: readonly HTMLElement[],
  activeIndex: number | null,
  disabled: (element: HTMLElement, index: number) => boolean = (element) => element.matches(':disabled,[aria-disabled="true"],[data-vf-disabled]'),
): void {
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (!element) continue;
    element.tabIndex = !disabled(element, index) && activeIndex === index ? 0 : -1;
  }
}

export function focusCompositeItem(
  elements: readonly HTMLElement[],
  activeIndex: number | null,
  options: FocusCompositeOptions = {},
): HTMLElement | null {
  if (activeIndex == null || activeIndex < 0 || activeIndex >= elements.length) return null;
  const element = elements[activeIndex] ?? null;
  element?.focus({ preventScroll: options.preventScroll });
  return element;
}

export function applyActiveDescendant(container: HTMLElement, activeDescendantId: string | null): void {
  if (activeDescendantId) container.setAttribute('aria-activedescendant', activeDescendantId);
  else container.removeAttribute('aria-activedescendant');
}
