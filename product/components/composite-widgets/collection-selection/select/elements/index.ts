import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
const rootSelector = '[data-vf-select-root],vf-select';
let nextSelectId = 0;
const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter(
    (option) => option.closest(rootSelector) === root.closest(rootSelector),
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const option = target instanceof Element ? target.closest<HTMLElement>(optionSelector) : null;
  return option && root.contains(option) && option.closest(rootSelector) === root.closest(rootSelector) ? option : null;
}
function optionDisabled(option: HTMLElement): boolean {
  return option.matches(':disabled,[disabled],[aria-disabled="true"]');
}
function optionValue(option: HTMLElement): string {
  return option.dataset.vfValue ?? option.getAttribute('value') ?? '';
}

export class VfSelectElement extends H {
  static observedAttributes = ['open', 'value'];
  private readonly generatedListboxId = `vf-select-${++nextSelectId}-listbox`;
  private surface: HTMLElement | null = null;
  private restoreFocus = false;
  private observer: MutationObserver | null = null;
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback(): void {
    this.setAttribute('data-vf-select-root', '');
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'open', 'disabled', 'aria-disabled', 'data-vf-select-option', 'data-vf-value', 'value'],
      });
    }
    this.sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.query = '';
    this.surface?.removeEventListener('toggle', this.onToggle);
    this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
    this.surface = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.sync();
  }

  private ownedPart(selector: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find((node) => node.closest(rootSelector) === this) ??
      null
    );
  }

  private get trigger(): HTMLElement | null {
    return this.ownedPart('[data-vf-select-trigger]');
  }

  private get content(): HTMLElement | null {
    return this.ownedPart('[data-vf-select-content]');
  }

  private sync(): void {
    const open = this.hasAttribute('open');
    if (!open) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.query = '';
    }
    const selectedValue = this.getAttribute('value') ?? '';
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
    trigger?.setAttribute('aria-haspopup', 'listbox');
    trigger?.setAttribute('aria-expanded', String(open));
    if (content) {
      content.id ||= this.id ? `${this.id}-listbox` : this.generatedListboxId;
      trigger?.setAttribute('aria-controls', content.id);
      content.setAttribute('role', 'listbox');
      content.tabIndex = -1;
      content.setAttribute('popover', 'auto');
      content.removeAttribute('hidden');
      content.toggleAttribute('data-vf-open', open);
    } else trigger?.removeAttribute('aria-controls');
    for (const option of optionsFor(this)) {
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      option.setAttribute('aria-selected', String(optionValue(option) === selectedValue));
    }
    if (!content || !trigger) return;
    if (open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!open && content.matches(':popover-open')) content.hidePopover();
  }

  private onBeforeToggle = (event: Event): void => {
    const surface = this.surface;
    if (!surface || event.target !== surface) return;
    this.restoreFocus = surface.matches(':popover-open') && surface.contains(this.ownerDocument.activeElement);
  };

  private onToggle = (event: Event): void => {
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

  private setOpen(open: boolean): void {
    this.toggleAttribute('open', open);
  }

  private focusOptions(edge: 'first' | 'last'): void {
    queueMicrotask(() => {
      const content = this.content;
      if (!this.isConnected || !content?.matches(':popover-open')) return;
      const options = optionsFor(content);
      const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
      const selected = options.findIndex(
        (option, index) => states[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
      );
      const index =
        selected >= 0 ? selected : resolveNavigationIndex(states, edge === 'first' ? -1 : options.length, edge);
      if (index != null) options[index]?.focus();
    });
  }

  private onClick = (event: Event): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootSelector) !== this) return;
    const trigger = target.closest('[data-vf-select-trigger]');
    if (trigger && trigger === this.trigger) {
      if (trigger.matches(':disabled,[aria-disabled="true"]')) return;
      if (this.hasAttribute('open')) this.setOpen(false);
      else {
        this.setOpen(true);
        this.focusOptions('first');
      }
      return;
    }
    const option = optionFromTarget(this, target);
    if (!option || !this.hasAttribute('open') || !this.content?.contains(option)) return;
    if (optionDisabled(option)) {
      event.preventDefault();
      return;
    }
    this.setAttribute('value', optionValue(option));
    this.setOpen(false);
    this.sync();
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootSelector) !== this) return;
    const trigger = target.closest('[data-vf-select-trigger]');
    if (trigger && trigger === this.trigger) {
      if (trigger.matches(':disabled,[aria-disabled="true"]')) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.setOpen(true);
        this.focusOptions('last');
      } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.setOpen(true);
        this.focusOptions('first');
      }
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

    const options = optionsFor(content);
    const currentOption = optionFromTarget(content, event.target);
    const current = currentOption ? options.indexOf(currentOption) : -1;
    const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
    let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    let next: number | null = null;
    if (intent) next = resolveNavigationIndex(states, current, intent);
    else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.query = '';
      }, 500);
      next = findTypeaheadMatch(
        options.map((option) => ({
          textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
          eligible: !optionDisabled(option),
        })),
        this.query,
        { startIndex: current },
      );
    }
    if (next == null) return;
    event.preventDefault();
    options[next]?.focus();
  };
}

export function defineSelectElement(
  tag = 'vf-select',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge Select registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfSelectElement);
}
