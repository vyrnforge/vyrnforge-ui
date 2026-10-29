const HTMLElementBase: typeof HTMLElement =
  globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

export class VfOtpFieldElement extends HTMLElementBase {
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    this.setAttribute('data-vf-otp-field-root', '');
    this.configureCells();
    this.addEventListener('input', this.onInput);
    this.addEventListener('paste', this.onPaste);
    this.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('input', this.onInput);
    this.removeEventListener('paste', this.onPaste);
    this.removeEventListener('keydown', this.onKeyDown);
  }

  get value() {
    return this.cells
      .map((cell) => cell.value || ' ')
      .join('')
      .trimEnd();
  }

  set value(value: string) {
    const characters = Array.from(value);
    this.cells.forEach((cell, index) => {
      cell.value = characters[index] ?? '';
    });
  }

  private get cells() {
    return Array.from(
      this.querySelectorAll<HTMLInputElement>('[data-vf-otp-field-input]'),
    );
  }

  private configureCells() {
    const cells = this.cells;
    cells.forEach((cell, index) => {
      if (!cell.hasAttribute('inputmode')) cell.inputMode = 'numeric';
      if (!cell.hasAttribute('autocomplete')) {
        cell.autocomplete = index === 0 ? 'one-time-code' : 'off';
      }
      if (!cell.hasAttribute('maxlength')) {
        cell.maxLength = index === 0 ? cells.length : 1;
      }
    });
  }

  private setFrom(index: number, raw: string) {
    const cells = this.cells;
    const inserted = Array.from(raw.replace(/\s/g, '')).slice(
      0,
      Math.max(0, cells.length - index),
    );

    if (inserted.length === 0) {
      const cell = cells[index];
      if (cell) cell.value = '';
    } else {
      inserted.forEach((character, offset) => {
        const cell = cells[index + offset];
        if (cell) cell.value = character;
      });
    }

    this.dispatchEvent(
      new CustomEvent('valuechange', {
        detail: { value: this.value },
        bubbles: true,
      }),
    );
    return inserted.length;
  }

  private cellIndex(target: EventTarget | null) {
    if (!(target instanceof HTMLInputElement)) return -1;
    return this.cells.indexOf(target);
  }

  private focusCell(index: number) {
    this.cells[index]?.focus();
  }

  private onInput = (event: Event) => {
    const index = this.cellIndex(event.target);
    if (index < 0) return;
    const input = event.target as HTMLInputElement;
    const inserted = this.setFrom(index, input.value);
    if (inserted > 0) this.focusCell(Math.min(index + inserted, this.cells.length - 1));
  };

  private onPaste = (event: Event) => {
    if (!(event instanceof ClipboardEvent)) return;
    const index = this.cellIndex(event.target);
    if (index < 0) return;
    const text = event.clipboardData?.getData('text') ?? '';
    if (!text.replace(/\s/g, '')) return;
    event.preventDefault();
    const inserted = this.setFrom(index, text);
    this.focusCell(Math.min(index + inserted, this.cells.length - 1));
  };

  private onKeyDown = (event: Event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Backspace') return;
    const index = this.cellIndex(event.target);
    if (index <= 0) return;
    const input = event.target as HTMLInputElement;
    if (!input.value) this.focusCell(index - 1);
  };
}

export function defineOtpFieldElement(
  tag = 'vf-otp-field',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) {
    throw new Error('VyrnForge OtpField registration requires a CustomElementRegistry.');
  }
  if (!registry.get(tag)) registry.define(tag, VfOtpFieldElement);
}
