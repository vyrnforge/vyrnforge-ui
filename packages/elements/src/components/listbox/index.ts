import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement;
const optionSelector = '[data-vf-listbox-option]';

function optionsFor(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)); }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true'; }
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const element = target instanceof HTMLElement ? target.closest<HTMLElement>(optionSelector) : null; return element && root.contains(element) ? element : null; }
function optionValue(option: HTMLElement): string { return option.getAttribute('value') ?? option.dataset.value ?? option.textContent?.trim() ?? ''; }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null) {
  const options = optionsFor(root);
  const states = options.map((option) => ({ disabled: disabled(option) }));
  let activeIndex = preferred ? options.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) {
    const focused = typeof document === 'undefined' ? null : optionFromTarget(root, document.activeElement);
    activeIndex = focused ? options.indexOf(focused) : -1;
  }
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
  if (activeIndex < 0) activeIndex = states.findIndex((option) => !option.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  options.forEach((option, index) => { option.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}

export class VfListboxElement extends HTMLElementBase {
  static get observedAttributes() { return ['selection-mode']; }
  private observer: MutationObserver | null = null;
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    this.setAttribute('role', 'listbox');
    this.setAttribute('data-vf-listbox-root', '');
    this.removeAttribute('tabindex');
    this.syncSelectionMode();
    this.syncOptions();
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    this.addEventListener('focusin', this.onFocusIn);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.syncOptions());
      this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-disabled', 'aria-selected', 'data-vf-listbox-option'] });
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    this.removeEventListener('focusin', this.onFocusIn);
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer) clearTimeout(this.timer);
  }

  attributeChangedCallback(name: string) {
    if (name !== 'selection-mode') return;
    this.syncSelectionMode();
    if (this.isConnected) this.syncOptions();
  }

  private get multiple() { return this.getAttribute('selection-mode') === 'multiple'; }
  private syncSelectionMode() { if (this.multiple) this.setAttribute('aria-multiselectable', 'true'); else this.removeAttribute('aria-multiselectable'); }
  private syncOptions(preferred?: HTMLElement | null) {
    let selectedSeen = false;
    for (const option of optionsFor(this)) {
      option.setAttribute('role', 'option');
      if (!option.hasAttribute('aria-selected')) option.setAttribute('aria-selected', 'false');
      if (!this.multiple && option.getAttribute('aria-selected') === 'true') {
        if (selectedSeen) option.setAttribute('aria-selected', 'false');
        else selectedSeen = true;
      }
    }
    syncTabStops(this, preferred);
  }

  private select(option: HTMLElement) {
    if (disabled(option)) return;
    if (this.multiple) option.setAttribute('aria-selected', option.getAttribute('aria-selected') === 'true' ? 'false' : 'true');
    else for (const candidate of optionsFor(this)) candidate.setAttribute('aria-selected', String(candidate === option));
    const value = this.multiple ? optionsFor(this).filter((candidate) => candidate.getAttribute('aria-selected') === 'true').map(optionValue) : optionValue(option);
    this.dispatchEvent(new CustomEvent('vf-value-change', { detail: { value }, bubbles: true }));
  }

  private onClick = (event: Event) => {
    if (event.defaultPrevented) return;
    const option = optionFromTarget(this, event.target);
    if (!option || disabled(option)) return;
    option.focus();
    this.syncOptions(option);
    this.select(option);
  };

  private onFocusIn = (event: FocusEvent) => {
    const option = optionFromTarget(this, event.target);
    if (option && !disabled(option)) this.syncOptions(option);
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const options = optionsFor(this);
    const currentOption = optionFromTarget(this, event.target);
    const current = currentOption ? options.indexOf(currentOption) : -1;
    if (currentOption && !disabled(currentOption) && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.select(currentOption);
      return;
    }
    let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    let next: number | null = null;
    if (intent) next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), current, intent);
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.query = ''; }, 500);
      next = findTypeaheadMatch(options.map((option) => ({ textValue: option.dataset.vfTextValue ?? option.textContent ?? '', disabled: disabled(option) })), this.query, { startIndex: current });
    }
    if (next == null) return;
    const target = options[next];
    if (!target) return;
    event.preventDefault();
    this.syncOptions(target);
    target.focus();
  };
}

export function defineListboxElement(tagName = 'vf-listbox', registry: CustomElementRegistry | undefined = globalThis.customElements) {
  if (!registry) throw new Error('VyrnForge Listbox registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfListboxElement);
}
