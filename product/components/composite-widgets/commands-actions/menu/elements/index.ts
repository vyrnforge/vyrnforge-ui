import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
let nextId = 0;
const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(item => item.closest('[data-vf-menu-content]') === root);
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}
function isDisabled(item: HTMLElement): boolean {
  return item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true';
}

export class VfMenuElement extends HTMLElementBase {
  static observedAttributes = ['open','placement'];
  private surface: HTMLElement | null = null;
  private previousFocus: HTMLElement | null = null;
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
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-disabled', 'data-vf-menu-item', 'data-vf-menu-trigger', 'data-vf-menu-content'],
      });
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    this.observer?.disconnect();
    this.observer = null;
    this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
    this.surface?.removeEventListener('toggle', this.onToggle);
    this.surface = null;
    if (this.timer) clearTimeout(this.timer);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private owns(node: Element): boolean { return node.closest(`[data-vf-menu-root],vf-menu,vf-split-button,${this.localName}`) === this; }
  private part(selector: string): HTMLElement | null { return Array.from(this.querySelectorAll<HTMLElement>(selector)).find(node => this.owns(node)) ?? null; }
  private get trigger(): HTMLElement | null {
    return this.part('[data-vf-menu-trigger]');
  }
  private get content(): HTMLElement | null {
    return this.part('[data-vf-menu-content]');
  }

  private sync() {
    const open = this.hasAttribute('open');
    const trigger = this.trigger;
    const content = this.content;
    if (this.surface !== content) {
      this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
      this.surface?.removeEventListener('toggle', this.onToggle);
      if (this.surface?.matches(':popover-open')) this.surface.hidePopover();
      this.surface = content;
      content?.addEventListener('beforetoggle', this.onBeforeToggle);
      content?.addEventListener('toggle', this.onToggle);
    }
    if (!trigger || !content) return;
    if (!content.id) {
      let id: string;
      do { id = `vf-menu-${++nextId}`; } while (this.ownerDocument.getElementById(id));
      content.id = id;
    }
    trigger.setAttribute('aria-haspopup','menu');
    trigger.setAttribute('aria-expanded',String(open));
    trigger.setAttribute('aria-controls', content.id);
    trigger.setAttribute('popovertarget', content.id);
    if (trigger instanceof HTMLButtonElement && !trigger.hasAttribute('type')) trigger.type = 'button';
    content.setAttribute('role','menu');
    content.setAttribute('popover','auto');
    content.setAttribute('data-vf-placement', this.getAttribute('placement') ?? 'bottom-start');
    content.tabIndex = -1;
    content.removeAttribute('hidden');
    for (const item of menuItems(content)) {
      item.setAttribute('role','menuitem');
      item.tabIndex = -1;
      if (item instanceof HTMLButtonElement && !item.hasAttribute('type')) item.type = 'button';
    }
    if (open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!open && content.matches(':popover-open')) content.hidePopover();
    if (!open && this.previousFocus) {
      this.previousFocus = null;
      const active = this.ownerDocument.activeElement;
      if (!active || active === this.ownerDocument.body || content.contains(active)) trigger.focus();
    }
  }

  private onBeforeToggle = (event: Event) => {
    const content = this.surface;
    if (!content || event.target !== content || !content.matches(':popover-open')) return;
    const focused = this.ownerDocument.activeElement;
    this.previousFocus = focused instanceof HTMLElement && content.contains(focused) ? focused : null;
  };
  private onToggle = (event: Event) => {
    const content = this.surface;
    if (!content || event.target !== content) return;
    const actual = content.matches(':popover-open');
    if (actual !== this.hasAttribute('open')) this.setOpen(actual);
  };

  private setOpen(open: boolean) {
    if (open === this.hasAttribute('open')) return;
    this.toggleAttribute('open', open);
    this.dispatchEvent(new CustomEvent('vf-open-change', {detail:{open},bubbles:true}));
  }
  private focusMenu(edge: 'first' | 'last') {
    queueMicrotask(() => {
      const content = this.content;
      const items = content ? menuItems(content) : [];
      const index = resolveNavigationIndex(
        items.map(item => ({ eligible: !item.matches(':disabled') })),
        edge === 'first' ? -1 : items.length,
        edge,
      );
      if (index != null) items[index]?.focus();
      else content?.focus();
    });
  }

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || !this.owns(target)) return;
    if (target.closest('[data-vf-menu-trigger]') === this.trigger && this.trigger && !this.trigger.matches(':disabled,[aria-disabled="true"]')) {
      event.preventDefault();
      if (this.hasAttribute('open')) this.setOpen(false);
      else {
        this.setOpen(true);
        this.focusMenu('first');
      }
      return;
    }
    const content = this.content;
    const item = content ? itemFromTarget(content, target) : null;
    if (!item) return;
    if (isDisabled(item)) {
      event.preventDefault();
      return;
    }
    this.setOpen(false);
    this.dispatchEvent(new CustomEvent('vf-select', { detail: { item }, bubbles: true }));
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element) || !this.owns(event.target)) return;
    const trigger = event.target instanceof HTMLElement ? event.target.closest('[data-vf-menu-trigger]') : null;
    if (trigger && trigger === this.trigger && !trigger.matches(':disabled,[aria-disabled="true"]')) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.setOpen(true);
        this.focusMenu('last');
      } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.setOpen(true);
        this.focusMenu('first');
      }
      return;
    }
    const content = this.content;
    if (!content || !content.contains(event.target as Node)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      this.setOpen(false);
      this.trigger?.focus();
      return;
    }
    const items = menuItems(content);
    const currentItem = itemFromTarget(content, event.target);
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
  };
}

export function defineMenuElement(
  tagName = 'vf-menu',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Menu registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfMenuElement);
}
