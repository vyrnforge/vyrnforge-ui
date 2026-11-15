import {
  Directive,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

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
  private initial = '';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  readonly current = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());
  readonly maxLength = computed(() => {
    const length = this.length();
    if (!Number.isInteger(length) || length < 1) throw new RangeError('OTPField length must be a positive integer.');
    return length;
  });
  private ownedInput() {
    const root = this.element.nativeElement;
    return Array.from(root.querySelectorAll<HTMLInputElement>('input[data-vf-otp-field-input]')).find(
      (input) => input.closest('[data-vf-otp-field-root]') === root,
    );
  }
  ngOnInit() {
    this.initial = this.defaultValue();
    this.internalValue.set(this.initial);
    afterRenderEffect(
      {
        write: () => {
          const current = this.current();
          const input = this.ownedInput();
          if (input) input.defaultValue = this.value() === undefined ? this.initial : current;
        },
      },
      { injector: this.injector },
    );
    afterNextRender(
      () => {
        const document = this.element.nativeElement.ownerDocument;
        let active = true;
        const onReset = (event: Event) => {
          const input = this.ownedInput();
          if (!input?.form || input.form !== event.target) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented || input.form !== event.target) return;
            const next = this.value() ?? this.initial;
            if (this.value() === undefined) this.internalValue.set(next);
            input.value = next;
          }, 0);
        };
        document.addEventListener('reset', onReset, true);
        this.destroyRef.onDestroy(() => {
          active = false;
          document.removeEventListener('reset', onReset, true);
        });
      },
      { injector: this.injector },
    );
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
    if (input.value !== this.root.current()) input.value = this.root.current();
  }
}
