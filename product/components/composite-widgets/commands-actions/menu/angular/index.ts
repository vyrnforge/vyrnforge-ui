import {
  Directive,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  type OnDestroy,
  type WritableSignal,
} from '@angular/core';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

function adjacentMenubarTrigger(
  trigger: HTMLElement | null,
  event: Pick<KeyboardEvent, 'key'>,
): HTMLButtonElement | null {
  if (!trigger?.matches('[data-vf-menubar-trigger]') || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'))
    return null;
  const bar = trigger.closest('[data-vf-menubar-root]');
  if (!bar) return null;
  const items = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-vf-menubar-trigger]')).filter(
    (item) => item.closest('[data-vf-menubar-root]') === bar,
  );
  const direction = getComputedStyle(bar).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent = navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction);
  if (!intent) return null;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    items.indexOf(trigger as HTMLButtonElement),
    intent,
  );
  return next == null || items[next] === trigger ? null : (items[next] ?? null);
}

function submenuArrow(trigger: HTMLElement, opening: boolean): 'ArrowLeft' | 'ArrowRight' {
  const rtl = getComputedStyle(trigger).direction === 'rtl';
  return opening === rtl ? 'ArrowLeft' : 'ArrowRight';
}

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}

interface MenuFocusRequest {
  edge: 'first' | 'last' | null;
  revision: WritableSignal<number>;
}
const focusRequests = new WeakMap<VfMenuRootDirective, MenuFocusRequest>();
const menusByTrigger = new WeakMap<HTMLElement, VfMenuRootDirective>();
const parentMenus = new WeakMap<VfMenuRootDirective, VfMenuRootDirective>();
function closeMenuChain(menu: VfMenuRootDirective): VfMenuRootDirective {
  let current = menu;
  current.setOpen(false);
  for (let parent = parentMenus.get(current); parent; parent = parentMenus.get(current)) {
    current = parent;
    current.setOpen(false);
  }
  return current;
}
function focusRequestFor(root: VfMenuRootDirective): MenuFocusRequest {
  let request = focusRequests.get(root);
  if (!request) {
    request = { edge: null, revision: signal(0) };
    focusRequests.set(root, request);
  }
  return request;
}

@Directive({ selector: '[vfMenuRoot]', standalone: true })
export class VfMenuRootDirective {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false);
  readonly openChange = output<boolean>();
  readonly placement = input<FloatingPlacement>('bottom-start');
  private readonly internal = signal<boolean | undefined>(undefined);
  readonly expanded = computed(() => this.open() ?? this.internal() ?? this.defaultOpen());
  anchor: HTMLElement | null = null;
  surface: HTMLElement | null = null;
  constructor() {
    const parent = inject(VfMenuContentDirective, { optional: true, skipSelf: true });
    if (parent) parentMenus.set(this, parent.root);
  }
  setOpen(next: boolean) {
    if (next === this.expanded()) return;
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }
  focusMenu(edge: 'first' | 'last') {
    const request = focusRequestFor(this);
    request.edge = edge;
    request.revision.update((revision) => revision + 1);
  }
}

@Directive({
  selector: 'button[vfMenuTrigger]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-menu-trigger': '',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'root.expanded()',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfMenuTriggerDirective {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  constructor(readonly root: VfMenuRootDirective) {
    const trigger = this.element.nativeElement;
    if (parentMenus.has(root)) {
      trigger.setAttribute('role', 'menuitem');
      trigger.tabIndex = -1;
      trigger.setAttribute('data-vf-menu-item', '');
    }
    this.root.anchor = trigger;
    menusByTrigger.set(trigger, root);
    inject(DestroyRef).onDestroy(() => {
      menusByTrigger.delete(trigger);
      if (root.anchor === trigger) root.anchor = null;
    });
  }
  onClick(event: MouseEvent) {
    if (event.defaultPrevented || this.element.nativeElement.matches(':disabled,[aria-disabled="true"]')) return;
    if (this.root.expanded()) this.root.setOpen(false);
    else {
      this.root.setOpen(true);
      this.root.focusMenu('first');
    }
  }
  onKeydown(event: KeyboardEvent) {
    const trigger = this.element.nativeElement;
    if (event.defaultPrevented || trigger.matches(':disabled,[aria-disabled="true"]')) return;
    if (parentMenus.has(this.root)) {
      if (event.key === submenuArrow(trigger, true) || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.root.setOpen(true);
        this.root.focusMenu('first');
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.root.setOpen(true);
      this.root.focusMenu('last');
    } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.root.setOpen(true);
      this.root.focusMenu('first');
    }
  }
}

@Directive({
  selector: '[vfMenuContent]',
  standalone: true,
  host: {
    role: 'menu',
    tabindex: '-1',
    'data-vf-menu-content': '',
    popover: 'auto',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
    '[attr.data-vf-placement]': 'root.placement()',
    '(beforetoggle)': 'onBeforeToggle($event)',
    '(toggle)': 'onToggle($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfMenuContentDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly nativeRevision = signal(0);
  private restoreFocus = false;
  private switchTarget: HTMLButtonElement | null = null;
  constructor(readonly root: VfMenuRootDirective) {
    this.root.surface = this.element.nativeElement;
    if (parentMenus.has(root)) this.element.nativeElement.setAttribute('data-vf-menu-submenu', '');
    afterRenderEffect(() => {
      this.nativeRevision();
      const parent = parentMenus.get(root);
      const open = this.root.expanded() && (!parent || parent.expanded());
      const surface = this.element.nativeElement;
      const trigger = this.root.anchor;
      if (trigger) {
        if (open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
        if (!open && surface.matches(':popover-open')) surface.hidePopover();
      }
      if (!open) {
        if (this.timer !== null) clearTimeout(this.timer);
        this.timer = null;
        this.query = '';
        const next = this.switchTarget;
        this.switchTarget = null;
        const targetMenu = next ? menusByTrigger.get(next) : undefined;
        if (next?.isConnected && targetMenu) {
          next.focus();
          targetMenu.setOpen(true);
          targetMenu.focusMenu('first');
        }
      } else this.switchTarget = null;
      const request = focusRequestFor(this.root);
      request.revision();
      const edge = request.edge;
      request.edge = null;
      if (!edge || !open || !surface.matches(':popover-open')) return;
      const items = menuItems(surface);
      const index = resolveNavigationIndex(
        items.map((item) => ({ eligible: !item.matches(':disabled') })),
        edge === 'first' ? -1 : items.length,
        edge,
      );
      if (index != null) items[index]?.focus();
    });
  }
  onBeforeToggle(event: Event): void {
    const surface = this.element.nativeElement;
    if (event.target !== surface) return;
    this.restoreFocus = surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
  }
  onToggle(event: Event): void {
    const surface = this.element.nativeElement;
    if (event.target !== surface) return;
    const actual = surface.matches(':popover-open');
    if (!actual && this.restoreFocus) {
      this.restoreFocus = false;
      const active = surface.ownerDocument.activeElement;
      if (!active || active === surface.ownerDocument.body || surface.contains(active)) this.root.anchor?.focus();
    }
    if (actual === this.root.expanded()) return;
    this.root.setOpen(actual);
    this.nativeRevision.update((revision) => revision + 1);
  }
  ngOnDestroy(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    if (this.root.surface === this.element.nativeElement) this.root.surface = null;
  }
  onKeydown(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLElement) ||
      event.target.closest('[data-vf-menu-content]') !== this.element.nativeElement
    )
      return;
    const nextTrigger = adjacentMenubarTrigger(this.root.anchor, event);
    if (nextTrigger && menusByTrigger.has(nextTrigger)) {
      event.preventDefault();
      this.switchTarget = nextTrigger;
      this.root.setOpen(false);
      this.nativeRevision.update((revision) => revision + 1);
      return;
    }
    if (
      event.key === 'Escape' ||
      (parentMenus.has(this.root) && this.root.anchor && event.key === submenuArrow(this.root.anchor, false))
    ) {
      event.preventDefault();
      this.root.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      closeMenuChain(this.root).anchor?.focus();
      return;
    }
    const items = menuItems(this.element.nativeElement);
    const currentItem = itemFromTarget(this.element.nativeElement, event.target);
    const current = currentItem ? items.indexOf(currentItem) : -1;
    let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    let next: number | null = null;
    if (intent)
      next = resolveNavigationIndex(
        items.map((item) => ({ eligible: !item.matches(':disabled') })),
        current,
        intent,
      );
    else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.query = '';
      }, 500);
      next = findTypeaheadMatch(
        items.map((item) => ({
          textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
          eligible: !item.matches(':disabled'),
        })),
        this.query,
        { startIndex: current },
      );
    }
    if (next == null) return;
    event.preventDefault();
    items[next]?.focus();
  }
}

@Directive({
  selector: 'button[vfMenuItem]',
  standalone: true,
  host: {
    type: 'button',
    role: 'menuitem',
    tabindex: '-1',
    'data-vf-menu-item': '',
    '[attr.disabled]': 'null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(click)': 'select($event)',
  },
})
export class VfMenuItemDirective {
  readonly disabled = input(false);
  readonly selected = output<void>();
  constructor(readonly root: VfMenuRootDirective) {}
  select(event: MouseEvent) {
    if (event.defaultPrevented) return;
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.selected.emit();
    closeMenuChain(this.root);
  }
}

@Directive({
  selector: '[vfMenuSeparator]',
  standalone: true,
  host: { role: 'separator', 'data-vf-menu-separator': '' },
})
export class VfMenuSeparatorDirective {}
