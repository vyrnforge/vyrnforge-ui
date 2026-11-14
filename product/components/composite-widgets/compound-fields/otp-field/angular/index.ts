import { Directive, input, output, signal } from '@angular/core';

function focusCell(inputElement: HTMLInputElement, index: number) {
  const root = inputElement.closest('[data-vf-otp-field-root]');
  const cells = root?.querySelectorAll<HTMLInputElement>('[data-vf-otp-field-input]');
  cells?.item(index).focus();
}

@Directive({
  selector: '[vfOtpFieldRoot]',
  standalone: true,
  host: {
    role: 'group',
    'data-vf-otp-field-root': '',
  },
})
export class VfOtpFieldRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly length = input(6);
  readonly valueChange = output<string>();
  private readonly internalValue = signal<string | undefined>(undefined);

  current() {
    return (this.value() ?? this.internalValue() ?? this.defaultValue())
      .slice(0, this.length())
      .padEnd(this.length(), ' ');
  }

  charAt(index: number) {
    return this.current()[index]?.trim() ?? '';
  }

  setFrom(index: number, raw: string) {
    const inserted = Array.from(raw.replace(/\s/g, '')).slice(
      0,
      Math.max(0, this.length() - index),
    );
    const next = Array.from(this.current());

    if (inserted.length === 0) {
      next[index] = ' ';
    } else {
      inserted.forEach((character, offset) => {
        next[index + offset] = character;
      });
    }

    const nextValue = next.join('').trimEnd();
    if (this.value() === undefined) this.internalValue.set(nextValue);
    this.valueChange.emit(nextValue);
    return inserted.length;
  }
}

@Directive({
  selector: 'input[vfOtpFieldInput]',
  standalone: true,
  host: {
    inputmode: 'numeric',
    'data-vf-otp-field-input': '',
    '[attr.autocomplete]': 'index() === 0 ? "one-time-code" : "off"',
    '[attr.maxlength]': 'index() === 0 ? root.length() : 1',
    '[value]': 'root.charAt(index())',
    '(input)': 'onInput($event)',
    '(paste)': 'onPaste($event)',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class VfOtpFieldInputDirective {
  readonly index = input.required<number>({ alias: 'vfOtpFieldInput' });

  constructor(readonly root: VfOtpFieldRootDirective) {}

  onInput(event: Event) {
    const inputElement = event.currentTarget as HTMLInputElement;
    const inserted = this.root.setFrom(this.index(), inputElement.value);
    inputElement.value = this.root.charAt(this.index());
    if (inserted > 0) {
      focusCell(
        inputElement,
        Math.min(this.index() + inserted, this.root.length() - 1),
      );
    }
  }

  onPaste(event: ClipboardEvent) {
    const inputElement = event.currentTarget as HTMLInputElement;
    const text = event.clipboardData?.getData('text') ?? '';
    if (!text.replace(/\s/g, '')) return;
    event.preventDefault();
    const inserted = this.root.setFrom(this.index(), text);
    focusCell(
      inputElement,
      Math.min(this.index() + inserted, this.root.length() - 1),
    );
  }

  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.currentTarget as HTMLInputElement;
    if (event.key === 'Backspace' && !inputElement.value && this.index() > 0) {
      focusCell(inputElement, this.index() - 1);
    }
  }
}
