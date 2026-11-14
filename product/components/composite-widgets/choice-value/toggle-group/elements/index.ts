const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

export type ToggleGroupType = 'single' | 'multiple';

function normalize(value: string | string[] | undefined, type: ToggleGroupType): string[] {
  const values = Array.from(new Set((typeof value === 'string' ? [value] : (value ?? [])).filter(Boolean)));
  return type === 'single' ? values.slice(0, 1) : values;
}

function toggled(values: string[], value: string, type: ToggleGroupType): string[] {
  if (type === 'single') return values[0] === value ? [] : [value];
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}

function readValue(value: string | null, type: ToggleGroupType): string[] | undefined {
  if (value === null) return undefined;
  if (type === 'single') return normalize(value, type);
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) return normalize(parsed, type);
  } catch {
    // A legacy authored single string represents one item in multiple mode.
  }
  return normalize(value, type);
}

export class VfToggleGroupElement extends H {
  static readonly observedAttributes = ['type', 'value', 'default-value'];
  private internal: string[] | undefined;
  private observer: MutationObserver | null = null;

  connectedCallback() {
    this.setAttribute('role', 'group');
    this.setAttribute('data-vf-toggle-group-root', '');
    this.addEventListener('click', this.onClick);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-vf-value', 'data-vf-toggle-group-root'],
    });
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.sync();
  }

  private type(): ToggleGroupType {
    return this.getAttribute('type') === 'multiple' ? 'multiple' : 'single';
  }

  private items(): HTMLButtonElement[] {
    return Array.from(this.querySelectorAll<HTMLButtonElement>('button[data-vf-toggle-group-item]')).filter(
      (item) => item.closest('[data-vf-toggle-group-root]') === this,
    );
  }

  private itemValue(item: HTMLButtonElement): string {
    return item.dataset.vfValue ?? item.value;
  }

  private values(): string[] {
    return normalize(readValue(this.getAttribute('value'), this.type()) ?? this.internal, this.type());
  }

  get value(): string | string[] {
    const values = this.values();
    return this.type() === 'single' ? (values[0] ?? '') : values;
  }

  set value(value: string | string[]) {
    const normalized = normalize(value, this.type());
    this.setAttribute('value', this.type() === 'single' ? (normalized[0] ?? '') : JSON.stringify(normalized));
  }

  private sync() {
    const items = this.items();
    if (!this.internal) {
      this.internal = readValue(this.getAttribute('default-value'), this.type()) ??
        items.filter((item) => item.getAttribute('aria-pressed') === 'true').map((item) => this.itemValue(item));
    }
    const values = this.values();
    for (const item of items) {
      const pressed = values.includes(this.itemValue(item));
      item.type = 'button';
      item.setAttribute('aria-pressed', String(pressed));
      item.setAttribute('data-vf-state', pressed ? 'on' : 'off');
    }
  }

  private onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const item = event.target.closest<HTMLButtonElement>('button[data-vf-toggle-group-item]');
    if (!item || item.closest('[data-vf-toggle-group-root]') !== this || item.disabled ||
        item.getAttribute('aria-disabled') === 'true') return;
    const value = this.itemValue(item);
    if (!value) return;
    const next = toggled(this.values(), value, this.type());
    if (!this.hasAttribute('value')) this.internal = next;
    this.sync();
    this.dispatchEvent(new CustomEvent('vf-value-change', {
      detail: { value: this.type() === 'single' ? (next[0] ?? '') : next },
      bubbles: true,
      composed: true,
    }));
  };
}

export function defineToggleGroupElement(
  tag = 'vf-toggle-group',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge ToggleGroup registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfToggleGroupElement);
}
