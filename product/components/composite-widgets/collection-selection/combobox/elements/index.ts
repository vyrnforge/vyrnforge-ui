import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
let comboboxId = 0;
const rootSelector = '[data-vf-combobox-root],vf-combobox';
const optionSelector = '[data-vf-combobox-option]';

function visibleOptions(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => !option.hidden && option.closest(rootSelector) === root);
}
function disabled(option: HTMLElement): boolean {
  return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled');
}
function optionValue(option: HTMLElement): string {
  return option.dataset.value ?? option.getAttribute('value') ?? option.textContent?.trim() ?? '';
}
function optionLabel(option: HTMLElement): string {
  return option.dataset.vfTextValue ?? option.textContent?.trim() ?? optionValue(option);
}
function normalizeFilterText(value: string, locale?: string): string {
  return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase();
}

export class VfComboboxElement extends HTMLElementBase {
  private inputId = '';
  private listboxId = '';
  private activeId: string | null = null;
  private composing = false;
  private surface: HTMLElement | null = null;

  connectedCallback() {
    this.setAttribute('data-vf-combobox-root', '');
    const input = this.inputElement();
    const content = this.contentElement();
    const number = ++comboboxId;
    this.inputId = input?.id || `vf-combobox-${number}-input`;
    this.listboxId = content?.id || `vf-combobox-${number}-listbox`;
    if (input) {
      input.id = this.inputId;
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-controls', this.listboxId);
      input.setAttribute('aria-expanded', 'false');
    }
    if (content) {
      content.id = this.listboxId;
      content.setAttribute('role', 'listbox');
      if (!content.hasAttribute('aria-labelledby')) content.setAttribute('aria-labelledby', this.inputId);
      content.setAttribute('popover', 'auto');
      content.removeAttribute('hidden');
      this.surface = content;
      content.addEventListener('toggle', this.onToggle);
    }
    this.syncOptions();
    this.addEventListener('focusin', this.onFocus);
    this.addEventListener('focusout', this.onBlur);
    this.addEventListener('mousedown', this.onMouseDown);
    this.addEventListener('input', this.onInput);
    this.addEventListener('click', this.onClick);
    this.addEventListener('compositionstart', this.onCompositionStart);
    this.addEventListener('compositionend', this.onCompositionEnd);
    this.addEventListener('keydown', this.onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this.onFocus);
    this.removeEventListener('focusout', this.onBlur);
    this.removeEventListener('mousedown', this.onMouseDown);
    this.surface?.removeEventListener('toggle', this.onToggle);
    this.surface = null;
    this.activeId = null;
    this.composing = false;
    this.removeEventListener('input', this.onInput);
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('compositionstart', this.onCompositionStart);
    this.removeEventListener('compositionend', this.onCompositionEnd);
    this.removeEventListener('keydown', this.onKeydown);
  }

  private inputElement() {
    return Array.from(this.querySelectorAll<HTMLInputElement>('[data-vf-combobox-input]')).find(node => node.closest(rootSelector) === this) ?? null;
  }
  private contentElement() {
    return Array.from(this.querySelectorAll<HTMLElement>('[data-vf-combobox-content]')).find(node => node.closest(rootSelector) === this) ?? null;
  }
  private locale() {
    return this.getAttribute('locale') || undefined;
  }
  private syncOptions() {
    const selectedValue = this.getAttribute('value') ?? '';
    Array.from(this.querySelectorAll<HTMLElement>(optionSelector)).filter(option => option.closest(rootSelector) === this).forEach((option, index) => {
      option.id ||= `${this.listboxId}-option-${index + 1}`;
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      if (option.hasAttribute('disabled')) option.setAttribute('aria-disabled', 'true');
      const selected = this.activeId
        ? option.id === this.activeId
        : optionValue(option) === selectedValue && selectedValue !== '';
      option.setAttribute('aria-selected', String(selected));
    });
    const input = this.inputElement();
    if (input) {
      if (this.activeId) input.setAttribute('aria-activedescendant', this.activeId);
      else input.removeAttribute('aria-activedescendant');
    }
  }
  private setOpen(open: boolean) {
    const input = this.inputElement();
    const content = this.contentElement();
    if (content && input) {
      if (open && !content.matches(':popover-open')) content.showPopover({ source: input });
      if (!open && content.matches(':popover-open')) content.hidePopover();
      content.toggleAttribute('data-vf-open', open);
    }
    input?.setAttribute('aria-expanded', String(open));
    if (!open) {
      this.activeId = null;
      this.syncOptions();
    }
  }
  private setActive(option: HTMLElement) {
    this.activeId = option.id;
    this.syncOptions();
    option.scrollIntoView?.({ block: 'nearest' });
  }
  private moveActive(intent: Extract<CollectionNavigationIntent, 'next' | 'previous'>) {
    const options = visibleOptions(this);
    const current = options.findIndex((option) => option.id === this.activeId);
    const start = current >= 0 ? current : intent === 'previous' ? options.length : -1;
    const next = resolveNavigationIndex(
      options.map((option) => ({ eligible: !disabled(option) })),
      start,
      intent,
      { loop: false },
    );
    if (next == null) return;
    const target = options[next];
    if (target) this.setActive(target);
  }
  private select(option: HTMLElement) {
    if (disabled(option)) return;
    const value = optionValue(option);
    this.setAttribute('value', value);
    const input = this.inputElement();
    if (input) input.value = optionLabel(option);
    input?.focus();
    this.setOpen(false);
  }

  private onToggle = (event: Event) => {
    const content = this.surface;
    if (content && event.target === content) this.setOpen(content.matches(':popover-open'));
  };
  private onFocus = (event: FocusEvent) => {
    if (event.target === this.inputElement()) this.setOpen(true);
  };
  private onBlur = (event: FocusEvent) => {
    if (event.target !== this.inputElement()) return;
    if (!(event.relatedTarget instanceof Node && this.contentElement()?.contains(event.relatedTarget))) this.setOpen(false);
  };
  private onMouseDown = (event: MouseEvent) => {
    const option = event.target instanceof Element ? event.target.closest(optionSelector) : null;
    if (event.button === 0 && option?.closest(rootSelector) === this) event.preventDefault();
  };
  private onInput = (event: Event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (!input || input !== this.inputElement()) return;
    const locale = this.locale();
    const query = normalizeFilterText(input.value, locale);
    this.activeId = null;
    Array.from(this.querySelectorAll<HTMLElement>(optionSelector)).filter(option => option.closest(rootSelector) === this).forEach((option) => {
      option.hidden = !normalizeFilterText(optionLabel(option), locale).includes(query);
    });
    this.setOpen(true);
    this.syncOptions();
  };

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const option = (event.target as HTMLElement).closest<HTMLElement>(optionSelector);
    if (!option || option.closest(rootSelector) !== this || !this.contentElement()?.matches(':popover-open') || option.hidden || disabled(option)) return;
    this.select(option);
  };

  private onCompositionStart = (event: Event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (input === this.inputElement()) this.composing = true;
  };

  private onCompositionEnd = (event: Event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (input === this.inputElement()) this.composing = false;
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (!input || input !== this.inputElement()) return;
    if (this.composing || event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setOpen(true);
      this.moveActive(event.key === 'ArrowDown' ? 'next' : 'previous');
      return;
    }
    if (event.key === 'Enter' && this.activeId) {
      const target = visibleOptions(this).find((option) => option.id === this.activeId && !disabled(option));
      if (target) {
        event.preventDefault();
        this.select(target);
      }
      return;
    }
    const content = this.contentElement();
    if (event.key === 'Tab') this.setOpen(false);
    if (event.key === 'Escape' && content?.matches(':popover-open')) {
      event.preventDefault();
      this.setOpen(false);
    }
  };
}

export function defineComboboxElement(
  tag = 'vf-combobox',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Combobox registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfComboboxElement);
}
