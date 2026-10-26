import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
let comboboxId = 0;
const optionSelector = '[data-vf-combobox-option]';

function visibleOptions(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => !option.hidden); }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled'); }
function optionValue(option: HTMLElement): string { return option.dataset.value ?? option.getAttribute('value') ?? option.textContent?.trim() ?? ''; }
function optionLabel(option: HTMLElement): string { return option.dataset.vfTextValue ?? option.textContent?.trim() ?? optionValue(option); }

export class VfComboboxElement extends HTMLElementBase {
  private inputId = '';
  private listboxId = '';
  private activeId: string | null = null;

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
      input.setAttribute('aria-expanded', String(!content?.hidden));
    }
    if (content) {
      content.id = this.listboxId;
      content.setAttribute('role', 'listbox');
      content.setAttribute('aria-labelledby', this.inputId);
    }
    this.syncOptions();
    this.addEventListener('input', this.onInput);
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('input', this.onInput);
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
  }

  private inputElement() { return this.querySelector<HTMLInputElement>('[data-vf-combobox-input]'); }
  private contentElement() { return this.querySelector<HTMLElement>('[data-vf-combobox-content]'); }
  private syncOptions() {
    const selectedValue = this.getAttribute('value') ?? '';
    this.querySelectorAll<HTMLElement>(optionSelector).forEach((option, index) => {
      option.id ||= `${this.listboxId}-option-${index + 1}`;
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      if (option.hasAttribute('disabled')) option.setAttribute('aria-disabled', 'true');
      const selected = this.activeId ? option.id === this.activeId : optionValue(option) === selectedValue && selectedValue !== '';
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
    if (content) content.hidden = !open;
    input?.setAttribute('aria-expanded', String(open));
    if (!open) { this.activeId = null; this.syncOptions(); }
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
    const next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), start, intent, { loop: false });
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
    this.setOpen(false);
    input?.focus();
  }

  private onInput = (event: Event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (!input || !this.contains(input)) return;
    const query = input.value.toLocaleLowerCase();
    this.activeId = null;
    this.querySelectorAll<HTMLElement>(optionSelector).forEach((option) => { option.hidden = !optionLabel(option).toLocaleLowerCase().includes(query); });
    this.setOpen(true);
    this.syncOptions();
  };

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const option = (event.target as HTMLElement).closest<HTMLElement>(optionSelector);
    if (!option || !this.contains(option) || disabled(option)) return;
    this.select(option);
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-vf-combobox-input]');
    if (!input || !this.contains(input)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setOpen(true);
      this.moveActive(event.key === 'ArrowDown' ? 'next' : 'previous');
      return;
    }
    if (event.key === 'Enter' && this.activeId) {
      const target = visibleOptions(this).find((option) => option.id === this.activeId && !disabled(option));
      if (target) { event.preventDefault(); this.select(target); }
      return;
    }
    const content = this.contentElement();
    if (event.key === 'Escape' && content && !content.hidden) {
      event.preventDefault();
      this.setOpen(false);
    }
  };
}

export function defineComboboxElement(tag = 'vf-combobox', registry: CustomElementRegistry | undefined = globalThis.customElements) {
  if (!registry) throw new Error('VyrnForge Combobox registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfComboboxElement);
}
