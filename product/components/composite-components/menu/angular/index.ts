import { Directive, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)); }
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null; return item && root.contains(item) ? item : null; }

@Directive({ selector: '[vfMenuRoot]', standalone: true })
export class VfMenuRootDirective {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false);
  readonly openChange = output<boolean>();
  private readonly injector = inject(Injector);
  private internal = signal(false);
  private initialized = signal(false);
  readonly expanded = computed(() => this.open() ?? (this.initialized() ? this.internal() : this.defaultOpen()));
  anchor: HTMLElement | null = null;
  surface: HTMLElement | null = null;
  setOpen(next: boolean) { this.initialized.set(true); if (this.open() === undefined) this.internal.set(next); this.openChange.emit(next); }
  focusMenu(edge: 'first' | 'last') {
    afterNextRender(() => {
      const items = this.surface ? menuItems(this.surface) : [];
      const index = resolveEnabledIndex(items.map(() => ({})), edge === 'first' ? -1 : items.length, edge);
      if (index != null) items[index]?.focus();
    }, { injector: this.injector });
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
  constructor(readonly root: VfMenuRootDirective) { this.root.anchor = this.element.nativeElement; }
  onClick(event: MouseEvent) { if (event.defaultPrevented) return; if (this.root.expanded()) this.root.setOpen(false); else { this.root.setOpen(true); this.root.focusMenu('first'); } }
  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowUp') { event.preventDefault(); this.root.setOpen(true); this.root.focusMenu('last'); }
    else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.root.setOpen(true); this.root.focusMenu('first'); }
  }
}

@Directive({
  selector: '[vfMenuContent]',
  standalone: true,
  host: {
    role: 'menu',
    tabindex: '-1',
    'data-vf-menu-content': '',
    '[hidden]': '!root.expanded()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfMenuContentDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(readonly root: VfMenuRootDirective) { this.root.surface = this.element.nativeElement; }
  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); this.root.setOpen(false); this.root.anchor?.focus(); return; }
    if (event.key === 'Tab') { this.root.setOpen(false); this.root.anchor?.focus(); return; }
    const items = menuItems(this.element.nativeElement);
    const currentItem = itemFromTarget(this.element.nativeElement, event.target);
    const current = currentItem ? items.indexOf(currentItem) : -1;
    let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    let next: number | null = null;
    if (intent) next = resolveEnabledIndex(items.map(() => ({})), current, intent);
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.query = ''; }, 500);
      next = findTypeaheadMatch(items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })), this.query, { startIndex: current });
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
  select(event: MouseEvent) { if (event.defaultPrevented) return; if (this.disabled()) { event.preventDefault(); return; } this.selected.emit(); this.root.setOpen(false); this.root.anchor?.focus(); }
}

@Directive({ selector: '[vfMenuSeparator]', standalone: true, host: { role: 'separator', 'data-vf-menu-separator': '' } }) export class VfMenuSeparatorDirective {}
