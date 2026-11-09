import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
const itemSelector = '[data-vf-context-menu-item]';
function itemsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}
function itemDisabled(item: HTMLElement): boolean {
  return (item instanceof HTMLButtonElement && item.disabled)
    || item.hasAttribute('disabled')
    || item.getAttribute('aria-disabled') === 'true';
}

export class VfContextMenuElement extends HTMLElementBase {
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback(): void {
    this.setAttribute('data-vf-context-menu-root', '');
    this.addEventListener('contextmenu', this.onContextMenu);
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    this.sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('contextmenu', this.onContextMenu);
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    if (this.timer) clearTimeout(this.timer);
  }

  private get trigger(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-vf-context-menu-trigger]');
  }

  private get content(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-vf-context-menu-content]');
  }

  private sync(): void {
    const content = this.content;
    if (content) {
      content.setAttribute('role', 'menu');
      content.tabIndex = -1;
      content.hidden = !this.hasAttribute('open');
    }
    for (const item of itemsFor(this)) {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
      if (itemDisabled(item)) item.setAttribute('aria-disabled', 'true');
      else item.removeAttribute('aria-disabled');
    }
  }

  private setOpen(open: boolean): void {
    this.toggleAttribute('open', open);
    this.sync();
  }

  private focusEdge(edge: 'first' | 'last'): void {
    queueMicrotask(() => {
      const content = this.content;
      if (!content) return;
      const items = itemsFor(content);
      const states = items.map((item) => ({ disabled: itemDisabled(item) }));
      const index = resolveEnabledIndex(states, edge === 'first' ? -1 : items.length, edge);
      if (index != null) items[index]?.focus();
    });
  }

  private onContextMenu = (event: Event): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target?.closest('[data-vf-context-menu-trigger]')) return;
    event.preventDefault();
    this.setOpen(true);
    this.focusEdge('first');
  };

  private onClick = (event: Event): void => {
    if (event.defaultPrevented) return;
    const item = itemFromTarget(this, event.target);
    if (!item) return;
    if (itemDisabled(item)) {
      event.preventDefault();
      return;
    }
    this.setOpen(false);
    this.trigger?.focus();
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    const content = this.content;
    if (!content || !content.contains(event.target as Node)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.setOpen(false);
      this.trigger?.focus();
      return;
    }
    const items = itemsFor(content);
    const currentItem = itemFromTarget(content, event.target);
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
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.query = ''; }, 500);
      next = findTypeaheadMatch(items.map((item) => ({
        textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
        disabled: itemDisabled(item),
      })), this.query, { startIndex: current });
    }
    if (next == null) return;
    event.preventDefault();
    items[next]?.focus();
  };
}

export function defineContextMenuElement(tagName = 'vf-context-menu', registry: CustomElementRegistry | undefined = globalThis.customElements) {
  if (!registry) throw new Error('VyrnForge ContextMenu registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfContextMenuElement);
}
