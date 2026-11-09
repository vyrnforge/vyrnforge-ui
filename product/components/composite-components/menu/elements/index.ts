import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)); }
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null; return item && root.contains(item) ? item : null; }
function isDisabled(item: HTMLElement): boolean { return item.getAttribute('aria-disabled') === 'true'; }

export class VfMenuElement extends HTMLElementBase {
  static observedAttributes = ['open'];
  private observer: MutationObserver | null = null;
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    this.setAttribute('data-vf-menu-root', '');
    this.sync();
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-disabled', 'data-vf-menu-item', 'data-vf-menu-trigger', 'data-vf-menu-content'] });
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer) clearTimeout(this.timer);
  }

  attributeChangedCallback() { this.sync(); }

  private get trigger(): HTMLElement | null { return this.querySelector<HTMLElement>('[data-vf-menu-trigger]'); }
  private get content(): HTMLElement | null { return this.querySelector<HTMLElement>('[data-vf-menu-content]'); }

  private sync() {
    const open = this.hasAttribute('open');
    const trigger = this.trigger;
    const content = this.content;
    trigger?.setAttribute('aria-haspopup', 'menu');
    trigger?.setAttribute('aria-expanded', String(open));
    if (content) { content.setAttribute('role', 'menu'); content.tabIndex = -1; content.hidden = !open; }
    for (const item of menuItems(this)) { item.setAttribute('role', 'menuitem'); item.tabIndex = -1; }
  }

  private setOpen(open: boolean) { this.toggleAttribute('open', open); }
  private focusMenu(edge: 'first' | 'last') { queueMicrotask(() => { const content = this.content; const items = content ? menuItems(content) : []; const index = resolveEnabledIndex(items.map(() => ({})), edge === 'first' ? -1 : items.length, edge); if (index != null) items[index]?.focus(); }); }

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('[data-vf-menu-trigger]')) {
      if (this.hasAttribute('open')) this.setOpen(false);
      else { this.setOpen(true); this.focusMenu('first'); }
      return;
    }
    const item = itemFromTarget(this, target);
    if (!item) return;
    if (isDisabled(item)) { event.preventDefault(); return; }
    this.setOpen(false);
    this.trigger?.focus();
    this.dispatchEvent(new CustomEvent('vf-select', { detail: { item }, bubbles: true }));
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const trigger = event.target instanceof HTMLElement ? event.target.closest('[data-vf-menu-trigger]') : null;
    if (trigger) {
      if (event.key === 'ArrowUp') { event.preventDefault(); this.setOpen(true); this.focusMenu('last'); }
      else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.setOpen(true); this.focusMenu('first'); }
      return;
    }
    const content = this.content;
    if (!content || !content.contains(event.target as Node)) return;
    if (event.key === 'Escape') { event.preventDefault(); this.setOpen(false); this.trigger?.focus(); return; }
    if (event.key === 'Tab') { this.setOpen(false); this.trigger?.focus(); return; }
    const items = menuItems(content);
    const currentItem = itemFromTarget(content, event.target);
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
  };
}

export function defineMenuElement(tagName = 'vf-menu', registry: CustomElementRegistry | undefined = globalThis.customElements) {
  if (!registry) throw new Error('VyrnForge Menu registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfMenuElement);
}
