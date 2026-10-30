import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

export interface TabsValueChangeDetail {
  value: string;
}

export type TabsValueChangeEvent = CustomEvent<TabsValueChangeDetail>;

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
let generatedTabsId = 0;

function valueToken(value: string): string {
  return encodeURIComponent(value).replaceAll('%', '_');
}

function belongsToRoot(root: VfTabsElement, element: Element): boolean {
  return element.closest('vf-tabs') === root;
}

function tabValue(element: HTMLElement): string {
  return element.dataset.vfValue ?? '';
}

function tabDisabled(element: HTMLElement): boolean {
  if (element instanceof HTMLButtonElement && element.disabled) return true;
  return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

export class VfTabsElement extends HTMLElementBase {
  static readonly observedAttributes = ['value', 'default-value', 'orientation', 'activation', 'dir'];

  #internalValue = '';
  #focusValue = '';
  #observer: MutationObserver | null = null;

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    if (!this.id) {
      generatedTabsId += 1;
      this.id = `vf-tabs-${generatedTabsId}`;
    }
    if (!this.#internalValue) this.#internalValue = this.getAttribute('default-value') ?? this.getAttribute('value') ?? '';
    this.#focusValue = this.selectedValue;
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'data-vf-value'],
    });
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return;
    if (name === 'value') this.#focusValue = newValue ?? this.#internalValue;
    if (name === 'default-value' && !this.hasAttribute('value') && !this.#internalValue) this.#internalValue = newValue ?? '';
    this.#sync();
  }

  get value(): string {
    return this.selectedValue;
  }

  set value(value: string) {
    this.setAttribute('value', value);
  }

  get defaultValue(): string {
    return this.getAttribute('default-value') ?? '';
  }

  set defaultValue(value: string) {
    this.setAttribute('default-value', value);
  }

  get orientation(): TabsOrientation {
    return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
  }

  set orientation(value: TabsOrientation) {
    this.setAttribute('orientation', value);
  }

  get activation(): TabsActivation {
    return this.getAttribute('activation') === 'manual' ? 'manual' : 'automatic';
  }

  set activation(value: TabsActivation) {
    this.setAttribute('activation', value);
  }

  private get selectedValue(): string {
    return this.getAttribute('value') ?? this.#internalValue;
  }

  private get controlled(): boolean {
    return this.hasAttribute('value');
  }

  #tabs(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>('[data-vf-tabs-tab]')].filter((element) => belongsToRoot(this, element));
  }

  #panels(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>('[data-vf-tabs-panel]')].filter((element) => belongsToRoot(this, element));
  }

  #list(): HTMLElement | null {
    return [...this.querySelectorAll<HTMLElement>('[data-vf-tabs-list]')].find((element) => belongsToRoot(this, element)) ?? null;
  }

  #effectiveDirection(): 'ltr' | 'rtl' {
    return getComputedStyle(this).direction === 'rtl' ? 'rtl' : 'ltr';
  }

  #select(value: string): void {
    const candidate = this.#tabs().find((tab) => tabValue(tab) === value);
    if (!candidate || tabDisabled(candidate) || value === this.selectedValue) return;
    this.#focusValue = value;
    if (!this.controlled) this.#internalValue = value;
    this.#sync();
    this.dispatchEvent(new CustomEvent<TabsValueChangeDetail>('vf-value-change', {
      detail: { value },
      bubbles: true,
      composed: true,
    }));
  }

  #sync(): void {
    if (typeof HTMLElement === 'undefined') return;
    const orientation = this.orientation;
    const activation = this.activation;
    const selectedValue = this.selectedValue;
    const rootId = this.id;

    this.setAttribute('data-vf-tabs-root', '');
    this.setAttribute('data-vf-orientation', orientation);
    this.setAttribute('data-vf-activation', activation);

    const list = this.#list();
    if (list) {
      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-orientation', orientation);
      list.setAttribute('data-vf-orientation', orientation);
    }

    const tabs = this.#tabs();
    for (const tab of tabs) {
      const value = tabValue(tab);
      const disabled = tabDisabled(tab);
      const selected = value !== '' && value === selectedValue;
      const focusable = activation === 'manual' ? value === this.#focusValue : selected;
      const token = valueToken(value);
      if (tab instanceof HTMLButtonElement && !tab.hasAttribute('type')) tab.type = 'button';
      tab.id = `${rootId}-tab-${token}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('aria-controls', `${rootId}-panel-${token}`);
      tab.tabIndex = !disabled && focusable ? 0 : -1;
      if (disabled) tab.setAttribute('aria-disabled', 'true');
      else tab.removeAttribute('aria-disabled');
    }

    for (const panel of this.#panels()) {
      const value = panel.dataset.vfValue ?? '';
      const selected = value !== '' && value === selectedValue;
      const token = valueToken(value);
      panel.id = `${rootId}-panel-${token}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `${rootId}-tab-${token}`);
      panel.tabIndex = 0;
      panel.hidden = !selected;
    }
  }

  #handleClick = (event: Event): void => {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest<HTMLElement>('[data-vf-tabs-tab]');
    if (!tab || !belongsToRoot(this, tab)) return;
    if (tabDisabled(tab)) {
      event.preventDefault();
      return;
    }
    const value = tabValue(tab);
    if (!value) return;
    this.#focusValue = value;
    this.#select(value);
  };

  #handleKeyDown = (event: KeyboardEvent): void => {
    if (!(event.target instanceof Element)) return;
    const current = event.target.closest<HTMLElement>('[data-vf-tabs-tab]');
    if (!current || !belongsToRoot(this, current) || tabDisabled(current)) return;

    let intent: CollectionNavigationIntent | null = null;
    if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    else if (this.orientation === 'vertical' && event.key === 'ArrowDown') intent = 'next';
    else if (this.orientation === 'vertical' && event.key === 'ArrowUp') intent = 'previous';
    else if (this.orientation === 'horizontal' && event.key === 'ArrowRight') intent = this.#effectiveDirection() === 'rtl' ? 'previous' : 'next';
    else if (this.orientation === 'horizontal' && event.key === 'ArrowLeft') intent = this.#effectiveDirection() === 'rtl' ? 'next' : 'previous';

    if (intent) {
      const tabs = this.#tabs();
      const currentIndex = tabs.indexOf(current);
      const nextIndex = resolveEnabledIndex(tabs.map((tab) => ({ disabled: tabDisabled(tab) })), currentIndex, intent);
      if (nextIndex === null) return;
      const next = tabs[nextIndex];
      const value = next ? tabValue(next) : '';
      if (!next || !value) return;
      event.preventDefault();
      this.#focusValue = value;
      this.#sync();
      next.focus();
      if (this.activation === 'automatic') this.#select(value);
      return;
    }

    if (this.activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
      const value = tabValue(current);
      if (!value) return;
      event.preventDefault();
      this.#focusValue = value;
      this.#select(value);
    }
  };
}

export function defineTabsElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Tabs registration requires a CustomElementRegistry.');
  if (!registry.get('vf-tabs')) registry.define('vf-tabs', VfTabsElement);
}
