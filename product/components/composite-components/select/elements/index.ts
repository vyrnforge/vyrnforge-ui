import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const H: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector));
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const option = target instanceof HTMLElement ? target.closest<HTMLElement>(optionSelector) : null;
  return option && root.contains(option) ? option : null;
}
function optionDisabled(option: HTMLElement): boolean {
  return (option instanceof HTMLButtonElement && option.disabled)
    || option.hasAttribute('disabled')
    || option.getAttribute('aria-disabled') === 'true';
}
function optionValue(option: HTMLElement): string {
  return option.dataset.vfValue ?? option.getAttribute('value') ?? '';
}

export class VfSelectElement extends H {
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
        attributeFilter: ['open', 'disabled', 'aria-disabled', 'data-vf-select-option', 'data-vf-value', 'value'],
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
  }

  private get trigger(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-vf-select-trigger]');
  }

  private get content(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-vf-select-content]');
  }

  private sync(): void {
    const open = this.hasAttribute('open');
    const selectedValue = this.getAttribute('value') ?? '';
    const trigger = this.trigger;
    const content = this.content;
    trigger?.setAttribute('aria-haspopup', 'listbox');
    trigger?.setAttribute('aria-expanded', String(open));
    if (content) {
      content.setAttribute('role', 'listbox');
      content.tabIndex = -1;
      content.hidden = !open;
    }
    for (const option of optionsFor(this)) {
      const disabled = optionDisabled(option);
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      option.setAttribute('aria-selected', String(optionValue(option) === selectedValue));
      if (disabled) {
        if (option.getAttribute('aria-disabled') !== 'true') option.setAttribute('aria-disabled', 'true');
      } else if (option.hasAttribute('aria-disabled')) {
        option.removeAttribute('aria-disabled');
      }
    }
  }

  private setOpen(open: boolean): void {
    this.toggleAttribute('open', open);
  }

  private focusOptions(edge: 'first' | 'last'): void {
    queueMicrotask(() => {
      const content = this.content;
      if (!content) return;
      const options = optionsFor(content);
      const states = options.map((option) => ({ disabled: optionDisabled(option) }));
      const selected = options.findIndex(
        (option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true',
      );
      const index = selected >= 0
        ? selected
        : resolveEnabledIndex(states, edge === 'first' ? -1 : options.length, edge);
      if (index != null) options[index]?.focus();
    });
  }

  private onClick = (event: Event): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('[data-vf-select-trigger]')) {
      if (this.hasAttribute('open')) this.setOpen(false);
      else {
        this.setOpen(true);
        this.focusOptions('first');
      }
      return;
    }
    const option = optionFromTarget(this, target);
    if (!option) return;
    if (optionDisabled(option)) {
      event.preventDefault();
      return;
    }
    this.setAttribute('value', optionValue(option));
    this.setOpen(false);
    this.sync();
    this.trigger?.focus();
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('[data-vf-select-trigger]')) {
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
    if (!content || !content.contains(event.target as Node)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.setOpen(false);
      this.trigger?.focus();
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
    const states = options.map((option) => ({ disabled: optionDisabled(option) }));
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
      next = findTypeaheadMatch(options.map((option) => ({
        textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
        disabled: optionDisabled(option),
      })), this.query, { startIndex: current });
    }
    if (next == null) return;
    event.preventDefault();
    options[next]?.focus();
  };
}

export function defineSelectElement(tag = 'vf-select', registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Select registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfSelectElement);
}
