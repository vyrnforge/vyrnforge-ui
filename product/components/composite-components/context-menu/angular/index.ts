import { DestroyRef, Directive, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const itemSelector = '[data-vf-context-menu-item]';
interface ContextMenuDomState {
  anchor: HTMLElement | null;
  surface: HTMLElement | null;
  injector: Injector | null;
}
const contextMenuDom = new WeakMap<VfContextMenuRootDirective, ContextMenuDomState>();
function domFor(root: VfContextMenuRootDirective): ContextMenuDomState {
  let state = contextMenuDom.get(root);
  if (!state) {
    state = { anchor: null, surface: null, injector: null };
    contextMenuDom.set(root, state);
  }
  return state;
}
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
function focusEdge(root: VfContextMenuRootDirective, edge: 'first' | 'last'): void {
  const surface = domFor(root).surface;
  if (!surface) return;
  const items = itemsFor(surface);
  const states = items.map((item) => ({ disabled: itemDisabled(item) }));
  const index = resolveEnabledIndex(states, edge === 'first' ? -1 : items.length, edge);
  if (index != null) items[index]?.focus();
}

@Directive({ selector: '[vfContextMenuRoot]', standalone: true })
export class VfContextMenuRootDirective {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false);
  readonly openChange = output<boolean>();
  private internal = signal(false);
  readonly expanded = computed(() => this.open() ?? this.internal());
  setOpen(next: boolean) {
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }
}

@Directive({
  selector: '[vfContextMenuTrigger]',
  standalone: true,
  host: { 'data-vf-context-menu-trigger': '', '(contextmenu)': 'openMenu($event)' },
})
export class VfContextMenuTriggerDirective {
  constructor(readonly root: VfContextMenuRootDirective) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    const state = domFor(root);
    state.anchor = element;
    state.injector = inject(Injector);
    destroyRef.onDestroy(() => {
      const current = domFor(root);
      if (current.anchor === element) current.anchor = null;
      current.injector = null;
    });
  }

  openMenu(event: Event) {
    event.preventDefault();
    this.root.setOpen(true);
    const injector = domFor(this.root).injector;
    if (injector) afterNextRender(() => focusEdge(this.root, 'first'), { injector });
  }
}

@Directive({
  selector: '[vfContextMenuContent]',
  standalone: true,
  host: {
    role: 'menu',
    tabindex: '-1',
    'data-vf-context-menu-content': '',
    '[hidden]': '!root.expanded()',
  },
})
export class VfContextMenuContentDirective {
  constructor(readonly root: VfContextMenuRootDirective) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    domFor(root).surface = element;
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        root.setOpen(false);
        domFor(root).anchor?.focus();
        return;
      }
      const items = itemsFor(element);
      const currentItem = itemFromTarget(element, event.target);
      const current = currentItem ? items.indexOf(currentItem) : -1;
      const states = items.map((item) => ({ disabled: itemDisabled(item) }));
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveEnabledIndex(states, current, intent);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query += event.key;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { query = ''; }, 500);
        next = findTypeaheadMatch(items.map((item) => ({
          textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
          disabled: itemDisabled(item),
        })), query, { startIndex: current });
      }
      if (next == null) return;
      event.preventDefault();
      items[next]?.focus();
    };

    element.addEventListener('keydown', onKeydown);
    destroyRef.onDestroy(() => {
      element.removeEventListener('keydown', onKeydown);
      if (timer) clearTimeout(timer);
      const state = domFor(root);
      if (state.surface === element) state.surface = null;
    });
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
    '[disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(click)': 'select()',
  },
})
export class VfContextMenuItemDirective {
  readonly disabled = input(false);
  readonly selected = output<void>();
  constructor(readonly root: VfContextMenuRootDirective) {}
  select() {
    if (!this.disabled()) {
      this.selected.emit();
      this.root.setOpen(false);
      domFor(this.root).anchor?.focus();
    }
  }
}
