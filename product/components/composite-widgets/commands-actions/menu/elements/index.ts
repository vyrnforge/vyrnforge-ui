import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
const rootSelector = '[data-vf-menu-root],vf-menu,vf-split-button,[data-vf-split-button-root]';
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
function ownedContent(root: HTMLElement): HTMLElement | null {
  if (root.matches('[data-vf-menu-content]')) return root;
  return (
    Array.from(root.querySelectorAll<HTMLElement>('[data-vf-menu-content]')).find(
      (node) => node.closest(rootSelector) === root,
    ) ?? null
  );
}
function menuItems(root: HTMLElement): HTMLElement[] {
  const content = ownedContent(root);
  return content
    ? Array.from(content.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
        (item) => item.closest('[data-vf-menu-content]') === content,
      )
    : [];
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof Element ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === ownedContent(root) ? item : null;
}
function isDisabled(item: HTMLElement): boolean {
  return item.getAttribute('aria-disabled') === 'true';
}

export class VfMenuElement extends HTMLElementBase {
  static observedAttributes = ['open', 'placement'];
  private surface: HTMLElement | null = null;
  private restoreFocus = false;
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
    this.surface?.removeEventListener('toggle', this.onToggle);
    this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
    this.surface = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.query = '';
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private ownedPart(selector: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find((node) => node.closest(rootSelector) === this) ??
      null
    );
  }

  private get trigger(): HTMLElement | null {
    return this.ownedPart('[data-vf-menu-trigger]');
  }
  private get content(): HTMLElement | null {
    return this.ownedPart('[data-vf-menu-content]');
  }

  private parentMenu(): VfMenuElement | null {
    const parent = this.parentElement?.closest('[data-vf-menu-content]')?.closest(rootSelector);
    return parent instanceof VfMenuElement ? parent : null;
  }
  private closeChain(): VfMenuElement {
    this.setOpen(false);
    const parent = this.parentMenu();
    return parent ? parent.closeChain() : this;
  }
  private sync() {
    const parent = this.parentMenu();
    const open = this.hasAttribute('open') && (!parent || parent.hasAttribute('open'));
    if (!open) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.query = '';
    }
    const trigger = this.trigger;
    const content = this.content;
    if (content !== this.surface) {
      this.surface?.removeEventListener('toggle', this.onToggle);
      this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
      if (this.surface?.matches(':popover-open')) this.surface.hidePopover();
      this.surface = content;
      content?.addEventListener('toggle', this.onToggle);
      content?.addEventListener('beforetoggle', this.onBeforeToggle);
    }
    if (parent && trigger) {
      trigger.setAttribute('role', 'menuitem');
      trigger.tabIndex = -1;
      if (!trigger.hasAttribute('data-vf-menu-item')) trigger.setAttribute('data-vf-menu-item', '');
    }
    trigger?.setAttribute('aria-haspopup', 'menu');
    trigger?.setAttribute('aria-expanded', String(open));
    if (content) {
      content.setAttribute('role', 'menu');
      content.tabIndex = -1;
      content.setAttribute('popover', 'auto');
      content.removeAttribute('hidden');
      content.toggleAttribute('data-vf-menu-submenu', !!parent);
      content.setAttribute('data-vf-placement', this.getAttribute('placement') ?? 'bottom-start');
      content.toggleAttribute('data-vf-open', open);
    }
    for (const item of menuItems(this)) {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
    }
    if (!content || !trigger) return;
    if (open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!open && content.matches(':popover-open')) content.hidePopover();
  }

  private onBeforeToggle = (event: Event) => {
    const surface = this.surface;
    if (!surface || event.target !== surface) return;
    this.restoreFocus = surface.matches(':popover-open') && surface.contains(this.ownerDocument.activeElement);
  };

  private onToggle = (event: Event) => {
    const surface = this.surface;
    if (!surface || event.target !== surface) return;
    const actual = surface.matches(':popover-open');
    if (!actual && this.restoreFocus) {
      this.restoreFocus = false;
      const active = this.ownerDocument.activeElement;
      if (!active || active === this.ownerDocument.body || surface.contains(active)) this.trigger?.focus();
    }
    if (actual !== this.hasAttribute('open')) this.setOpen(actual);
  };

  private setOpen(open: boolean) {
    this.toggleAttribute('open', open);
  }
  private focusMenu(edge: 'first' | 'last') {
    queueMicrotask(() => {
      if (!this.isConnected || !this.hasAttribute('open')) return;
      const content = this.content;
      const items = content?.matches(':popover-open') ? menuItems(content) : [];
      const index = resolveNavigationIndex(
        items.map((item) => ({ eligible: !item.matches(':disabled') })),
        edge === 'first' ? -1 : items.length,
        edge,
      );
      if (index != null) items[index]?.focus();
    });
  }

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootSelector) !== this) return;
    const trigger = target.closest<HTMLElement>('[data-vf-menu-trigger]');
    if (trigger && trigger === this.trigger) {
      if (trigger.matches(':disabled,[aria-disabled="true"]')) {
        event.preventDefault();
        return;
      }
      if (this.hasAttribute('open')) this.setOpen(false);
      else {
        this.setOpen(true);
        this.focusMenu('first');
      }
      return;
    }
    const item = itemFromTarget(this, target);
    if (!item || !this.hasAttribute('open') || !this.content?.contains(item)) return;
    if (isDisabled(item) || item.matches(':disabled')) {
      event.preventDefault();
      return;
    }
    this.closeChain();
    this.dispatchEvent(new CustomEvent('vf-select', { detail: { item }, bubbles: true }));
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || (target.closest(rootSelector) !== this && target.closest('[data-vf-menu-content]') !== this.content))
      return;
    const trigger = target.closest<HTMLElement>('[data-vf-menu-trigger]');
    if (trigger && trigger === this.trigger) {
      if (trigger.matches(':disabled,[aria-disabled="true"]')) return;
      if (this.parentMenu()) {
        if (event.key === submenuArrow(trigger, true) || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.setOpen(true);
          this.focusMenu('first');
        }
        return;
      }
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
    if (!this.hasAttribute('open') || !content || !content.contains(target)) return;
    const nextTrigger = adjacentMenubarTrigger(this.trigger, event);
    const nextMenu = nextTrigger?.closest(rootSelector);
    if (nextTrigger && nextMenu instanceof VfMenuElement) {
      event.preventDefault();
      this.setOpen(false);
      nextTrigger.focus();
      nextMenu.setOpen(true);
      nextMenu.focusMenu('first');
      return;
    }
    if (
      event.key === 'Escape' ||
      (this.parentMenu() && this.trigger && event.key === submenuArrow(this.trigger, false))
    ) {
      event.preventDefault();
      this.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      this.closeChain().trigger?.focus();
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
  };
}

export function defineMenuElement(
  tagName = 'vf-menu',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Menu registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfMenuElement);
}
