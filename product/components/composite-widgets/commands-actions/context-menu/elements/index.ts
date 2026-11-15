import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
const rootSelector = '[data-vf-context-menu-root],vf-context-menu';
const menuItemSelector = '[data-vf-context-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  const owner = root.closest(rootSelector);
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest(rootSelector) === owner,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof Element ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && root.contains(item) && item.closest(rootSelector) === root.closest(rootSelector) ? item : null;
}
function isDisabled(item: HTMLElement): boolean {
  return item.getAttribute('aria-disabled') === 'true';
}

export class VfContextMenuElement extends HTMLElementBase {
  static observedAttributes = ['open'];
  private surface: HTMLElement | null = null;
  private restoreFocus = false;
  private observer: MutationObserver | null = null;
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pressed = false;
  private pending = false;
  private invocationTimer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    this.setAttribute('data-vf-context-menu-root', '');
    this.sync();
    this.addEventListener('contextmenu', this.onContextMenu);
    this.addEventListener('pointerdown', this.onPointerDown);
    this.addEventListener('pointerup', this.onPointerUp);
    this.addEventListener('pointercancel', this.clearInvocation);
    this.addEventListener('pointerleave', this.onPointerLeave);
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'aria-disabled',
          'data-vf-context-menu-item',
          'data-vf-context-menu-trigger',
          'data-vf-context-menu-content',
        ],
      });
    }
  }

  disconnectedCallback() {
    this.removeEventListener('contextmenu', this.onContextMenu);
    this.removeEventListener('pointerdown', this.onPointerDown);
    this.removeEventListener('pointerup', this.onPointerUp);
    this.removeEventListener('pointercancel', this.clearInvocation);
    this.removeEventListener('pointerleave', this.onPointerLeave);
    this.clearInvocation();
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
    return this.ownedPart('[data-vf-context-menu-trigger]');
  }
  private get content(): HTMLElement | null {
    return this.ownedPart('[data-vf-context-menu-content]');
  }

  private sync() {
    const open = this.hasAttribute('open');
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
    if (trigger && !trigger.hasAttribute('tabindex')) trigger.tabIndex = 0;
    if (content) {
      content.setAttribute('role', 'menu');
      content.tabIndex = -1;
      content.setAttribute('popover', 'auto');
      content.removeAttribute('hidden');
      content.setAttribute('data-vf-placement', 'bottom-start');
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

  private clearInvocation = (): void => {
    if (this.invocationTimer !== null) clearTimeout(this.invocationTimer);
    this.invocationTimer = null;
    this.pressed = false;
    this.pending = false;
  };
  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 2 || !(event.target instanceof Element) || event.target.closest(rootSelector) !== this || event.target.closest('[data-vf-context-menu-trigger]') !== this.trigger) return;
    this.clearInvocation();
    this.pressed = !event.defaultPrevented;
  };
  private onPointerUp = (event: PointerEvent): void => {
    if (event.button !== 2) return;
    this.pressed = false;
    if (this.pending) this.scheduleInvocation();
  };
  private onPointerLeave = (): void => { if (this.pressed) this.clearInvocation(); };
  private scheduleInvocation(): void {
    this.pending = false;
    if (this.invocationTimer !== null) clearTimeout(this.invocationTimer);
    this.invocationTimer = setTimeout(() => { this.invocationTimer = null; this.openFromTrigger(); }, 0);
  }
  private openFromTrigger(): void {
    if (!this.isConnected) return;
    this.trigger?.focus();
    this.setOpen(true);
    this.focusMenu('first');
  }
  private onContextMenu = (event: Event): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const trigger = this.trigger;
    if (
      !trigger ||
      event.target.closest(rootSelector) !== this ||
      event.target.closest('[data-vf-context-menu-trigger]') !== trigger
    )
      return;
    event.preventDefault();
    if (event.type === 'contextmenu') {
      if (this.pressed) this.pending = true;
      else this.scheduleInvocation();
    } else {
      this.clearInvocation();
      this.openFromTrigger();
    }
  };

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootSelector) !== this) return;
    const item = itemFromTarget(this, target);
    if (!item || !this.hasAttribute('open') || !this.content?.contains(item)) return;
    if (isDisabled(item) || item.matches(':disabled')) {
      event.preventDefault();
      return;
    }
    this.setOpen(false);
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootSelector) !== this) return;
    const trigger = target.closest<HTMLElement>('[data-vf-context-menu-trigger]');
    if (trigger && trigger === this.trigger) {
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) this.onContextMenu(event);
      return;
    }
    const content = this.content;
    if (!this.hasAttribute('open') || !content || !content.contains(target)) return;
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
        items.map((item) => ({ eligible: !item.matches(':disabled') })),
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

export function defineContextMenuElement(
  tagName = 'vf-context-menu',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Menu registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfContextMenuElement);
}
