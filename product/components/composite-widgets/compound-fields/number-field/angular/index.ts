import {
  Directive,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

function syncValue(input: HTMLInputElement, value: number | null) {
  if (input.validity.badInput || (value === null ? input.value !== '' : input.valueAsNumber !== value)) {
    input.value = value === null ? '' : String(value);
  }
}
function stepInput(button: HTMLButtonElement, direction: 1 | -1) {
  const root = button.closest('[data-vf-number-field-root]');
  const input = Array.from(root?.querySelectorAll<HTMLInputElement>('input[data-vf-number-field-input]') ?? []).find(
    (candidate) => candidate.closest('[data-vf-number-field-root]') === root,
  );
  if (!input || button.matches(':disabled') || input.matches(':disabled') || input.readOnly || input.step === 'any')
    return;
  const before = input.value;
  if (direction === 1) input.stepUp();
  else input.stepDown();
  if (input.value !== before) input.dispatchEvent(new Event('input', { bubbles: true }));
}
@Directive({ selector: '[vfNumberFieldRoot]', standalone: true, host: { 'data-vf-number-field-root': '' } })
export class VfNumberFieldRootDirective {
  readonly value = input<number | null | undefined>(undefined);
  readonly defaultValue = input<number | null>(0);
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input<number | 'any'>(1);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly valueChange = output<number | null>();
  private readonly initial = signal<number | null | undefined>(undefined);
  private resetDefault: number | null = 0;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  readonly current = computed(() => {
    const value = this.value();
    if (value !== undefined) return value;
    const internal = this.initial();
    return internal !== undefined ? internal : this.defaultValue();
  });
  ngOnInit() {
    this.resetDefault = this.defaultValue();
    this.initial.set(this.resetDefault);
    afterNextRender(
      () => {
        const root = this.element.nativeElement;
        const document = root.ownerDocument;
        let active = true;
        const onReset = (event: Event) => {
          const input = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-vf-number-field-input]')).find(
            (candidate) => candidate.closest('[data-vf-number-field-root]') === root,
          );
          if (!input?.form || input.form !== event.target) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented || input.form !== event.target) return;
            const value = this.value();
            if (value === undefined) this.initial.set(this.resetDefault);
            syncValue(input, value === undefined ? this.resetDefault : value);
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
  set(next: number | null) {
    if (this.disabled() || this.readOnly() || (next !== null && !Number.isFinite(next)) || next === this.current())
      return;
    if (this.value() === undefined) this.initial.set(next);
    this.valueChange.emit(next);
  }
}
@Directive({
  selector: 'input[vfNumberFieldInput]',
  standalone: true,
  host: {
    type: 'number',
    'data-vf-number-field-input': '',
    '[value]': 'root.current() ?? ""',
    '[attr.min]': 'root.min() ?? null',
    '[attr.max]': 'root.max() ?? null',
    '[attr.step]': 'root.step()',
    '[disabled]': 'root.disabled() || disabled()',
    '[readOnly]': 'root.readOnly() || readOnly()',
    '(input)': 'change($event)',
  },
})
export class VfNumberFieldInputDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute, alias: 'readonly' });
  constructor(readonly root: VfNumberFieldRootDirective) {}
  change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (event.defaultPrevented || input.matches(':disabled') || input.readOnly) {
      syncValue(input, this.root.current());
      return;
    }
    if (input.validity.badInput) return;
    const next = input.value === '' ? null : input.valueAsNumber;
    if (next !== null && !Number.isFinite(next)) return;
    this.root.set(next);
    if (this.root.value() !== undefined) syncValue(input, this.root.current());
  }
}
@Directive({
  selector: 'button[vfNumberFieldIncrement]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-number-field-increment': '',
    '[disabled]': 'root.disabled() || root.readOnly() || root.step() === "any" || disabled()',
    '(click)': 'activate($event)',
  },
})
export class VfNumberFieldIncrementDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly root: VfNumberFieldRootDirective) {}
  activate(event: MouseEvent) {
    if (!event.defaultPrevented) stepInput(event.currentTarget as HTMLButtonElement, 1);
  }
}
@Directive({
  selector: 'button[vfNumberFieldDecrement]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-number-field-decrement': '',
    '[disabled]': 'root.disabled() || root.readOnly() || root.step() === "any" || disabled()',
    '(click)': 'activate($event)',
  },
})
export class VfNumberFieldDecrementDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly root: VfNumberFieldRootDirective) {}
  activate(event: MouseEvent) {
    if (!event.defaultPrevented) stepInput(event.currentTarget as HTMLButtonElement, -1);
  }
}
