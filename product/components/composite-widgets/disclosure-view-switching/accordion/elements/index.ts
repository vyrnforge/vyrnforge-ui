import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;
export type AccordionType = 'single' | 'multiple';
export interface AccordionValueChangeDetail {
  value: string | string[];
}
export class VfAccordionElement extends HTMLElementBase {
  static readonly observedAttributes = ['value', 'type', 'collapsible'];
  #observer: MutationObserver | null = null;
  #forcedDisabled = new WeakSet<HTMLButtonElement>();
  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeyDown);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'data-vf-value'],
    });
    this.#sync();
  }
  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKeyDown);
    this.#observer?.disconnect();
    this.#observer = null;
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.#sync();
  }
  get type(): AccordionType {
    return this.getAttribute('type') === 'multiple' ? 'multiple' : 'single';
  }
  get values(): string[] {
    const raw = this.getAttribute('value') ?? '';
    if (this.type === 'single') return raw ? [raw] : [];
    if (raw.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed))
          return [...new Set(parsed.filter((value): value is string => typeof value === 'string' && Boolean(value)))];
      } catch {
        return [];
      }
    }
    return [...new Set(raw.split(',').filter(Boolean))];
  }
  set values(values: string[]) {
    this.setAttribute(
      'value',
      this.type === 'multiple' ? JSON.stringify([...new Set(values.filter(Boolean))]) : (values[0] ?? ''),
    );
  }
  #items(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>('[data-vf-accordion-item]')].filter(
      (item) => item.closest('vf-accordion') === this,
    );
  }
  #part<T extends HTMLElement>(item: HTMLElement, selector: string): T | undefined {
    return Array.from(item.querySelectorAll<T>(selector)).find(
      (part) => part.closest('vf-accordion') === this && part.closest('[data-vf-accordion-item]') === item,
    );
  }
  #sync(): void {
    if (!this.id) this.id = `vf-accordion-${Math.random().toString(36).slice(2)}`;
    this.setAttribute('data-vf-accordion-root', '');
    this.setAttribute('data-vf-type', this.type);
    const open = this.values;
    for (const item of this.#items()) {
      const value = item.dataset.vfValue ?? '';
      const trigger = this.#part<HTMLButtonElement>(item, 'button[data-vf-accordion-trigger]');
      const panel = this.#part<HTMLElement>(item, '[data-vf-accordion-panel]');
      const token = encodeURIComponent(value).replaceAll('_', '_5F').replaceAll('%', '_');
      const expanded = open.includes(value);
      item.toggleAttribute('data-vf-open', expanded);
      const disabled = item.hasAttribute('disabled');
      item.toggleAttribute('data-vf-disabled', disabled);
      if (trigger) {
        if (!trigger.hasAttribute('type')) trigger.type = 'button';
        if (disabled && !trigger.disabled) {
          this.#forcedDisabled.add(trigger);
          trigger.disabled = true;
        } else if (!disabled && this.#forcedDisabled.has(trigger)) {
          this.#forcedDisabled.delete(trigger);
          trigger.disabled = false;
        }
        if (expanded && this.type === 'single' && !this.hasAttribute('collapsible'))
          trigger.setAttribute('aria-disabled', 'true');
        else trigger.removeAttribute('aria-disabled');
        trigger.id = `${this.id}-trigger-${token}`;
        trigger.setAttribute('aria-expanded', String(expanded));
        trigger.setAttribute('aria-controls', `${this.id}-panel-${token}`);
      }
      if (panel) {
        panel.id = `${this.id}-panel-${token}`;
        if (panel.getAttribute('role') === 'region' && trigger) panel.setAttribute('aria-labelledby', trigger.id);
        else panel.removeAttribute('aria-labelledby');
        panel.hidden = !expanded;
        panel.toggleAttribute('data-vf-open', expanded);
      }
    }
  }
  #toggle(value: string): void {
    const current = this.values;
    const isOpen = current.includes(value);
    let next: string[];
    if (this.type === 'single') next = isOpen ? (this.hasAttribute('collapsible') ? [] : current) : [value];
    else next = isOpen ? current.filter((candidate) => candidate !== value) : [...current, value];
    if (next.length === current.length && next.every((value, index) => value === current[index])) return;
    this.values = next;
    this.#sync();
    this.dispatchEvent(
      new CustomEvent<AccordionValueChangeDetail>('vf-value-change', {
        detail: { value: this.type === 'single' ? (next[0] ?? '') : next },
        bubbles: true,
        composed: true,
      }),
    );
  }
  #onClick = (event: Event): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>('[data-vf-accordion-trigger]');
    if (!trigger || trigger.disabled || trigger.closest('vf-accordion') !== this) return;
    const item = trigger.closest<HTMLElement>('[data-vf-accordion-item]');
    const value = item?.dataset.vfValue;
    if (value) this.#toggle(value);
  };
  #onKeyDown = (event: KeyboardEvent): void => {
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLButtonElement) ||
      !event.target.matches('[data-vf-accordion-trigger]') ||
      event.target.closest('vf-accordion') !== this
    )
      return;
    let intent: CollectionNavigationIntent | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    if (!intent) return;
    const triggers = this.#items()
      .map((item) => item.querySelector<HTMLButtonElement>('[data-vf-accordion-trigger]'))
      .filter((value): value is HTMLButtonElement => Boolean(value));
    const index = triggers.indexOf(event.target);
    const next = resolveNavigationIndex(
      triggers.map((trigger) => ({ eligible: !trigger.disabled })),
      index,
      intent,
    );
    if (next === null) return;
    event.preventDefault();
    triggers[next]?.focus();
  };
}
export function defineAccordionElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Accordion registration requires a CustomElementRegistry.');
  if (!registry.get('vf-accordion')) registry.define('vf-accordion', VfAccordionElement);
}
