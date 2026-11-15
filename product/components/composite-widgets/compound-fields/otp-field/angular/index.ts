import { Directive, booleanAttribute, computed, input, output, signal } from '@angular/core';

@Directive({
  selector: '[vfOtpFieldRoot]',
  standalone: true,
  host: { 'data-vf-otp-field-root': '' },
})
export class VfOtpFieldRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly length = input(6);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
  private readonly internalValue = signal<string | undefined>(undefined);
  readonly current = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());
  readonly maxLength = computed(() => {
    const length = this.length();
    if (!Number.isInteger(length) || length < 1) throw new RangeError('OTPField length must be a positive integer.');
    return length;
  });
  ngOnInit() {
    this.internalValue.set(this.defaultValue());
  }
  set(next: string) {
    if (this.disabled() || next === this.current()) return;
    if (this.value() === undefined) this.internalValue.set(next);
    this.valueChange.emit(next);
  }
}
@Directive({
  selector: 'input[vfOtpFieldInput]',
  standalone: true,
  host: {
    type: 'text',
    'data-vf-input': '',
    'data-vf-otp-field-input': '',
    '[attr.inputmode]': 'inputMode()',
    '[attr.autocomplete]': 'autoComplete()',
    '[attr.maxlength]': 'root.maxLength()',
    '[value]': 'root.current()',
    '[disabled]': 'root.disabled() || disabled()',
    '(input)': 'onInput($event)',
  },
})
export class VfOtpFieldInputDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputMode = input('numeric', { alias: 'inputmode' });
  readonly autoComplete = input('one-time-code', { alias: 'autocomplete' });
  constructor(readonly root: VfOtpFieldRootDirective) {}
  onInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (!event.defaultPrevented && !input.matches(':disabled') && !input.readOnly) this.root.set(input.value);
    input.value = this.root.current();
  }
}
