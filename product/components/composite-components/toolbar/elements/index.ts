import { navigationIntentForArrow, type CollectionNavigationArrow, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
import { resolveCompositeFocusIndex, rovingTabIndex } from '@vyrnforge/core/composite-focus';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
export type ToolbarOrientation = 'horizontal' | 'vertical';

function toolbarItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>('[data-vf-toolbar-item]')); }
function disabled(item: HTMLElement): boolean { return item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true'; }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null): void {
  const items = toolbarItems(root);
  const states = items.map((item) => ({ disabled: disabled(item) }));
  let activeIndex = preferred ? items.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = items.findIndex((item) => item.tabIndex === 0 && !disabled(item));
  if (activeIndex < 0) activeIndex = states.findIndex((item) => !item.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  items.forEach((item, index) => { item.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const element = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-vf-toolbar-item]') : null;
  return element && root.contains(element) ? element : null;
}
function intentForKey(key: string, orientation: ToolbarOrientation, direction: 'ltr' | 'rtl'): CollectionNavigationIntent | null {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const arrow: CollectionNavigationArrow | null = key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : key === 'ArrowUp' ? 'up' : key === 'ArrowDown' ? 'down' : null;
  return arrow ? navigationIntentForArrow(arrow, orientation, direction) : null;
}

export class VfToolbarElement extends HTMLElementBase {
  static get observedAttributes() { return ['orientation']; }
  private observer: MutationObserver | null = null;
  connectedCallback() {
    this.setAttribute('role', 'toolbar');
    this.setAttribute('data-vf-toolbar-root', '');
    this.syncOrientation();
    this.addEventListener('keydown', this.onKeydown);
    this.addEventListener('focusin', this.onFocusin);
    queueMicrotask(() => syncTabStops(this));
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => syncTabStops(this));
      this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
  }
  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKeydown);
    this.removeEventListener('focusin', this.onFocusin);
    this.observer?.disconnect();
    this.observer = null;
  }
  attributeChangedCallback() { this.syncOrientation(); }
  private syncOrientation() {
    const orientation = (this.getAttribute('orientation') ?? 'horizontal') as ToolbarOrientation;
    this.setAttribute('aria-orientation', orientation);
    this.setAttribute('data-vf-orientation', orientation);
  }
  private onFocusin = (event: FocusEvent) => {
    const item = itemFromTarget(this, event.target);
    if (item && !disabled(item)) syncTabStops(this, item);
  };
  private onKeydown = (event: KeyboardEvent) => {
    const orientation = (this.getAttribute('orientation') ?? 'horizontal') as ToolbarOrientation;
    const direction = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr';
    const intent = intentForKey(event.key, orientation, direction);
    if (!intent) return;
    const items = toolbarItems(this);
    const currentItem = itemFromTarget(this, event.target);
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
    const nextIndex = resolveCompositeFocusIndex(items.map((item) => ({ disabled: disabled(item) })), currentIndex, intent);
    if (nextIndex == null) return;
    const next = items[nextIndex];
    if (!next) return;
    event.preventDefault();
    syncTabStops(this, next);
    next.focus();
  };
}
export function defineToolbarElement(tagName = 'vf-toolbar', registry: CustomElementRegistry | undefined = globalThis.customElements) { if (!registry) throw new Error('VyrnForge Toolbar registration requires a CustomElementRegistry.'); if (!registry.get(tagName)) registry.define(tagName, VfToolbarElement); }
