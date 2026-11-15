import { Directive, ElementRef, inject, type AfterViewInit, type OnDestroy } from '@angular/core';
export {
  VfMenuContentDirective as VfMenubarContentDirective,
  VfMenuItemDirective as VfMenubarItemDirective,
  VfMenuRootDirective as VfMenubarMenuDirective,
} from '@vyrnforge/angular/menu';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';

const rootSelector = '[data-vf-menubar-root]';
const triggerSelector = '[data-vf-menubar-trigger]';

function triggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(triggerSelector)).filter(
    (item) => item.closest(rootSelector) === root,
  );
}

function triggerFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(triggerSelector) : null;
  return item?.closest(rootSelector) === root ? item : null;
}

function syncTabStops(root: HTMLElement, preferred?: HTMLButtonElement | null): void {
  const items = triggers(root);
  const eligible = items.filter((item) => !item.matches(':disabled'));
  const remembered = eligible.find((item) => item.tabIndex === 0);
  const active = preferred && eligible.includes(preferred) ? preferred : (remembered ?? eligible[0]);
  for (const item of items) {
    const tabIndex = item === active ? 0 : -1;
    if (item.tabIndex !== tabIndex) item.tabIndex = tabIndex;
  }
}

type NavigationEvent = Pick<KeyboardEvent, 'key' | 'defaultPrevented' | 'preventDefault'>;
function moveFocus(root: HTMLElement, current: HTMLButtonElement, event: NavigationEvent): void {
  if (event.defaultPrevented) return;
  const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent =
    event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          ? navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction)
          : null;
  if (!intent) return;
  const items = triggers(root);
  const index = items.indexOf(current);
  if (index < 0) return;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    index,
    intent,
  );
  if (next == null) return;
  const item = items[next];
  if (!item) return;
  event.preventDefault();
  syncTabStops(root, item);
  item.focus();
}

function observeTriggers(root: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => {
    syncTabStops(root, triggerFromTarget(root, root.ownerDocument.activeElement));
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'data-vf-menubar-trigger', 'data-vf-menubar-root'],
  });
  return observer;
}

@Directive({
  selector: '[vfMenubarRoot]',
  standalone: true,
  host: { role: 'menubar', 'data-vf-menubar-root': '', '(focusin)': 'onFocusin($event)' },
})
export class VfMenubarRootDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: MutationObserver | undefined;
  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    const root = this.element.nativeElement;
    syncTabStops(root);
    if (typeof MutationObserver !== 'undefined') this.observer = observeTriggers(root);
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
  onFocusin(event: FocusEvent): void {
    const root = this.element.nativeElement;
    const item = triggerFromTarget(root, event.target);
    if (item) syncTabStops(root, item);
  }
}
@Directive({
  selector: 'button[vfMenubarTrigger]',
  standalone: true,
  host: { type: 'button', role: 'menuitem', 'data-vf-menubar-trigger': '', '(keydown)': 'onKeydown($event)' },
})
export class VfMenubarTriggerDirective {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  onKeydown(event: KeyboardEvent) {
    const trigger = this.element.nativeElement;
    const root = trigger.closest<HTMLElement>(rootSelector);
    if (root) moveFocus(root, trigger, event);
  }
}
