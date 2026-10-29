import { Directive, ElementRef, inject, input, type AfterViewInit, type OnDestroy } from '@angular/core';
import { navigationIntentForArrow, type CollectionNavigationArrow, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
import { resolveCompositeFocusIndex, rovingTabIndex } from '@vyrnforge/core/composite-focus';

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

@Directive({ selector: '[vfToolbarRoot]', standalone: true, host: { role: 'toolbar', 'data-vf-toolbar-root': '', '[attr.aria-orientation]': 'orientation()', '[attr.data-vf-orientation]': 'orientation()', '(keydown)': 'onKeydown($event)', '(focusin)': 'onFocusin($event)' } })
export class VfToolbarRootDirective implements AfterViewInit, OnDestroy {
  readonly orientation = input<ToolbarOrientation>('horizontal');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: MutationObserver | null = null;
  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    const root = this.element.nativeElement;
    syncTabStops(root);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => syncTabStops(root));
      this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
  }
  ngOnDestroy() { this.observer?.disconnect(); }
  onFocusin(event: FocusEvent) {
    if (typeof window === 'undefined') return;
    const root = this.element.nativeElement;
    const item = itemFromTarget(root, event.target);
    if (item && !disabled(item)) syncTabStops(root, item);
  }
  onKeydown(event: KeyboardEvent) {
    if (typeof window === 'undefined') return;
    const root = this.element.nativeElement;
    const direction = typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    const intent = intentForKey(event.key, this.orientation(), direction);
    if (!intent) return;
    const items = toolbarItems(root);
    const currentItem = itemFromTarget(root, event.target);
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
    const nextIndex = resolveCompositeFocusIndex(items.map((item) => ({ disabled: disabled(item) })), currentIndex, intent);
    if (nextIndex == null) return;
    const next = items[nextIndex];
    if (!next) return;
    event.preventDefault();
    syncTabStops(root, next);
    next.focus();
  }
}
@Directive({ selector: 'button[vfToolbarButton]', standalone: true, host: { type: 'button', 'data-vf-toolbar-item': '' } }) export class VfToolbarButtonDirective {}
@Directive({ selector: 'a[vfToolbarLink]', standalone: true, host: { 'data-vf-toolbar-item': '' } }) export class VfToolbarLinkDirective {}
@Directive({ selector: '[vfToolbarSeparator]', standalone: true, host: { role: 'separator', 'data-vf-toolbar-separator': '' } }) export class VfToolbarSeparatorDirective {}
