import {
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  type OnDestroy,
} from '@angular/core';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(item => item.closest('[data-vf-menu-content]') === root);
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}

@Directive({ selector: '[vfMenuRoot]', standalone: true })
export class VfMenuRootDirective {
  readonly id = input.required<string>();
  readonly contentId = input<string | undefined>(undefined);
  readonly resolvedContentId = computed(() => this.contentId() ?? `${this.id()}-content`);
  readonly placement = input<FloatingPlacement>('bottom-start');
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  private internal = signal(false);
  private initialized = signal(false);
  readonly expanded = computed(() => this.open() ?? (this.initialized() ? this.internal() : this.defaultOpen()));
  anchor: HTMLElement | null = null;
  surface: HTMLElement | null = null;
  edge: 'first' | 'last' = 'first';
  setOpen(next: boolean) {
    if (next === this.expanded()) return;
    this.initialized.set(true);
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }
  focusMenu(edge: 'first' | 'last') {
    this.edge = edge;
    if (this.surface?.matches(':popover-open')) this.focusOpenMenu();
  }
  focusOpenMenu() {
    const surface = this.surface;
    if (!surface) return;
    const items = menuItems(surface);
    const index = resolveNavigationIndex(items.map(item => ({ eligible: !item.matches(':disabled') })), this.edge === 'first' ? -1 : items.length, this.edge);
    if (index != null) items[index]?.focus();
    else surface.focus();
    this.edge = 'first';
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
    '[attr.aria-controls]': 'root.resolvedContentId()',
    '[attr.popovertarget]': 'root.resolvedContentId()',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfMenuTriggerDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  constructor(readonly root: VfMenuRootDirective) {
    this.root.anchor = this.element.nativeElement;
  }
  onClick(event: MouseEvent) {
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (this.root.expanded()) this.root.setOpen(false);
    else {
      this.root.setOpen(true);
      this.root.focusMenu('first');
    }
  }
  ngOnDestroy() { if (this.root.anchor === this.element.nativeElement) this.root.anchor = null; }
  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
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
    '[attr.id]': 'root.resolvedContentId()',
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
  private previousFocus: HTMLElement | null = null;
  constructor(readonly root: VfMenuRootDirective) {
    this.root.surface = this.element.nativeElement;
    afterRenderEffect(() => {
      this.nativeRevision();
      const open = this.root.expanded();
      const surface = this.element.nativeElement;
      const anchor = this.root.anchor;
      if (!anchor) return;
      if (open && !surface.matches(':popover-open')) {
        surface.showPopover({ source: anchor });
        const previous = this.previousFocus;
        this.previousFocus = null;
        if (previous && surface.contains(previous)) previous.focus();
        else this.root.focusOpenMenu();
      } else if (!open) {
        if (surface.matches(':popover-open')) surface.hidePopover();
        if (this.previousFocus) {
          this.previousFocus = null;
          const active = surface.ownerDocument.activeElement;
          if (!active || active === surface.ownerDocument.body || surface.contains(active)) anchor.focus();
        }
        this.query = '';
        if (this.timer) clearTimeout(this.timer);
      }
    });
  }
  onBeforeToggle(event: Event) {
    const surface = this.element.nativeElement;
    if (event.target === surface && surface.matches(':popover-open')) {
      const focused = surface.ownerDocument.activeElement;
      this.previousFocus = focused instanceof HTMLElement && surface.contains(focused) ? focused : null;
    }
  }
  onToggle(event: Event) {
    const surface = this.element.nativeElement;
    if (event.target !== surface) return;
    const actual = surface.matches(':popover-open');
    if (actual !== this.root.expanded()) {
      this.root.setOpen(actual);
      this.nativeRevision.update(revision => revision + 1);
    }
  }
  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
    if (this.root.surface === this.element.nativeElement) this.root.surface = null;
  }
  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('[data-vf-menu-content]') !== this.element.nativeElement)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.root.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      this.root.setOpen(false);
      this.root.anchor?.focus();
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
        items.map(item => ({ eligible: !item.matches(':disabled') })),
        current,
        intent,
      );
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.query = '';
      }, 500);
      next = findTypeaheadMatch(
        items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '', eligible: !item.matches(':disabled') })),
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
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly selected = output<void>();
  constructor(readonly root: VfMenuRootDirective) {}
  select(event: MouseEvent) {
    if (event.defaultPrevented) return;
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.selected.emit();
    this.root.setOpen(false);
  }
}

@Directive({
  selector: '[vfMenuSeparator]',
  standalone: true,
  host: { role: 'separator', 'data-vf-menu-separator': '' },
})
export class VfMenuSeparatorDirective {}
