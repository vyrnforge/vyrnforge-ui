import { navigationIntentForArrow, resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';

const H: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
const itemSelector = '[data-vf-segmented-control-item]';

function itemsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(itemSelector));
}

function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}

function itemDisabled(item: HTMLButtonElement): boolean {
  return item.disabled || item.getAttribute('aria-disabled') === 'true';
}

function intentForKey(key: string, direction: 'ltr' | 'rtl') {
  const arrow = key === 'ArrowLeft' ? 'left'
    : key === 'ArrowRight' ? 'right'
      : key === 'ArrowUp' ? 'up'
        : key === 'ArrowDown' ? 'down'
          : null;
  if (!arrow) return null;
  return navigationIntentForArrow(
    arrow,
    arrow === 'left' || arrow === 'right' ? 'horizontal' : 'vertical',
    direction,
  );
}

function setAttributeIfChanged(element: HTMLElement, name: string, value: string): void {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function sync(root: HTMLElement): void {
  const items = itemsFor(root);
  const checked = items.find((item) => !itemDisabled(item) && item.getAttribute('aria-checked') === 'true');
  const fallback = items.find((item) => !itemDisabled(item));
  const active = checked ?? fallback ?? null;
  for (const item of items) {
    setAttributeIfChanged(item, 'role', 'radio');
    if (!item.hasAttribute('aria-checked')) item.setAttribute('aria-checked', 'false');
    const tabIndex = item === active ? 0 : -1;
    if (item.tabIndex !== tabIndex) item.tabIndex = tabIndex;
  }
}

function select(root: HTMLElement, item: HTMLButtonElement): void {
  if (itemDisabled(item)) return;
  for (const candidate of itemsFor(root)) {
    setAttributeIfChanged(candidate, 'aria-checked', String(candidate === item));
  }
  sync(root);
}

export class VfSegmentedControlElement extends H {
  connectedCallback(): void {
    this.setAttribute('role', 'radiogroup');
    this.setAttribute('data-vf-segmented-control-root', '');
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    sync(this);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
  }

  private onClick = (event: Event): void => {
    if (event.defaultPrevented) return;
    const item = itemFromTarget(this, event.target);
    if (!item) return;
    select(this, item);
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    const currentItem = itemFromTarget(this, event.target);
    if (!currentItem) return;
    const direction = getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr';
    const intent = intentForKey(event.key, direction);
    if (!intent) return;
    const items = itemsFor(this);
    const current = items.indexOf(currentItem);
    const next = resolveEnabledIndex(
      items.map((item) => ({ disabled: itemDisabled(item) })),
      current,
      intent,
    );
    if (next == null) return;
    event.preventDefault();
    const candidate = items[next];
    if (!candidate) return;
    candidate.focus();
    select(this, candidate);
  };
}

export function defineSegmentedControlElement(
  tag = 'vf-segmented-control',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge SegmentedControl registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfSegmentedControlElement);
}
