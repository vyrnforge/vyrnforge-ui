import {
  Directive,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  DestroyRef,
  type OnDestroy,
  type WritableSignal,
} from '@angular/core';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const menuItemSelector = '[data-vf-context-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-context-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-context-menu-content]') === root ? item : null;
}

interface MenuFocusRequest {
  anchor: HTMLElement | null;
  surface: HTMLElement | null;
  edge: 'first' | 'last' | null;
  revision: WritableSignal<number>;
}
const focusRequests = new WeakMap<VfContextMenuRootDirective, MenuFocusRequest>();
function focusRequestFor(root: VfContextMenuRootDirective): MenuFocusRequest {
  let request = focusRequests.get(root);
  if (!request) {
    request = { anchor: null, surface: null, edge: null, revision: signal(0) };
    focusRequests.set(root, request);
  }
  return request;
}

@Directive({ selector: '[vfContextMenuRoot]', standalone: true })
export class VfContextMenuRootDirective {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false);
  readonly openChange = output<boolean>();
  private readonly internal = signal<boolean | undefined>(undefined);
  readonly expanded = computed(() => this.open() ?? this.internal() ?? this.defaultOpen());
  setOpen(next: boolean) {
    if (next === this.expanded()) return;
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }
}

@Directive({
  selector: '[vfContextMenuTrigger]',
  standalone: true,
  host: {
    'data-vf-context-menu-trigger': '',
    tabindex: '0',
    '(contextmenu)': 'openMenu($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfContextMenuTriggerDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private pressed = false;
  private pending = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(readonly root: VfContextMenuRootDirective) {
    const state = focusRequestFor(root);
    state.anchor = this.element;
    const onDown = (event: PointerEvent) => {
      if (event.button !== 2 || event.target instanceof Element && event.target.closest('[data-vf-context-menu-trigger]') !== this.element) return;
      this.clear();
      this.pressed = !event.defaultPrevented;
    };
    const onUp = (event: PointerEvent) => {
      if (event.button !== 2) return;
      this.pressed = false;
      if (this.pending) this.schedule();
    };
    const onCancel = () => this.clear();
    const onLeave = () => { if (this.pressed) this.clear(); };
    this.element.addEventListener('pointerdown', onDown);
    this.element.addEventListener('pointerup', onUp);
    this.element.addEventListener('pointercancel', onCancel);
    this.element.addEventListener('pointerleave', onLeave);
    inject(DestroyRef).onDestroy(() => {
      this.clear();
      this.element.removeEventListener('pointerdown', onDown);
      this.element.removeEventListener('pointerup', onUp);
      this.element.removeEventListener('pointercancel', onCancel);
      this.element.removeEventListener('pointerleave', onLeave);
      if (state.anchor === this.element) state.anchor = null;
    });
  }
  openMenu(event: Event): void {
    if (
      event.defaultPrevented ||
      !(event.target instanceof Element) ||
      event.target.closest('[data-vf-context-menu-trigger]') !== this.element
    )
      return;
    event.preventDefault();
    if (event.type === 'contextmenu') {
      if (this.pressed) this.pending = true;
      else this.schedule();
    } else {
      this.clear();
      this.open();
    }
  }
  private clear(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.pressed = false;
    this.pending = false;
  }
  private schedule(): void {
    this.pending = false;
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.timer = null; this.open(); }, 0);
  }
  private open(): void {
    if (!this.element.isConnected) return;
    this.element.focus();
    this.root.setOpen(true);
    const state = focusRequestFor(this.root);
    state.edge = 'first';
    state.revision.update((revision) => revision + 1);
  }
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) this.openMenu(event);
  }
}

@Directive({
  selector: '[vfContextMenuContent]',
  standalone: true,
  host: {
    role: 'menu',
    tabindex: '-1',
    'data-vf-context-menu-content': '',
    popover: 'auto',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
    'data-vf-placement': 'bottom-start',
    '(beforetoggle)': 'onBeforeToggle($event)',
    '(toggle)': 'onToggle($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfContextMenuContentDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly nativeRevision = signal(0);
  private restoreFocus = false;
  constructor(readonly root: VfContextMenuRootDirective) {
    focusRequestFor(this.root).surface = this.element.nativeElement;
    afterRenderEffect(() => {
      this.nativeRevision();
      const open = this.root.expanded();
      const surface = this.element.nativeElement;
      const trigger = focusRequestFor(this.root).anchor;
      if (trigger) {
        if (open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
        if (!open && surface.matches(':popover-open')) surface.hidePopover();
      }
      if (!open) {
        if (this.timer !== null) clearTimeout(this.timer);
        this.timer = null;
        this.query = '';
      }
      const request = focusRequestFor(this.root);
      request.revision();
      const edge = request.edge;
      request.edge = null;
      if (!edge || !open || !surface.matches(':popover-open')) return;
      const items = menuItems(surface);
      const index = resolveNavigationIndex(
        items.map(() => ({})),
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
      if (!active || active === surface.ownerDocument.body || surface.contains(active))
        focusRequestFor(this.root).anchor?.focus();
    }
    if (actual === this.root.expanded()) return;
    this.root.setOpen(actual);
    this.nativeRevision.update((revision) => revision + 1);
  }
  ngOnDestroy(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    if (focusRequestFor(this.root).surface === this.element.nativeElement) focusRequestFor(this.root).surface = null;
  }
  onKeydown(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLElement) ||
      event.target.closest('[data-vf-context-menu-content]') !== this.element.nativeElement
    )
      return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.root.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      this.root.setOpen(false);
      focusRequestFor(this.root).anchor?.focus();
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
        items.map(() => ({})),
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
        items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })),
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
  selector: 'button[vfContextMenuItem]',
  standalone: true,
  host: {
    type: 'button',
    role: 'menuitem',
    tabindex: '-1',
    'data-vf-context-menu-item': '',
    '[attr.disabled]': 'null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(click)': 'select($event)',
  },
})
export class VfContextMenuItemDirective {
  readonly disabled = input(false);
  readonly selected = output<void>();
  constructor(readonly root: VfContextMenuRootDirective) {}
  select(event?: MouseEvent) {
    if (event?.defaultPrevented) return;
    if (this.disabled()) {
      event?.preventDefault();
      return;
    }
    this.selected.emit();
    this.root.setOpen(false);
  }
}
