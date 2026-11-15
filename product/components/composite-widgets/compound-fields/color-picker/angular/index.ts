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

function hex(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}
function requiredHex(value: string): string {
  const normalized = hex(value);
  if (normalized === null) throw new RangeError('ColorPicker value must be a six-digit hex color.');
  return normalized;
}
@Directive({ selector: '[vfColorPickerRoot]', standalone: true, host: { 'data-vf-color-picker-root': '' } })
export class VfColorPickerRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('#000000');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
  private readonly internal = signal<string | undefined>(undefined);
  private initial = '#000000';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  readonly current = computed(() => requiredHex(this.value() ?? this.internal() ?? this.defaultValue()));
  ngOnInit() {
    this.initial = requiredHex(this.defaultValue());
    this.internal.set(this.initial);
    afterNextRender(
      () => {
        const root = this.element.nativeElement;
        const document = root.ownerDocument;
        let active = true;
        const inputs = () =>
          Array.from(
            root.querySelectorAll<HTMLInputElement>(
              'input[data-vf-color-picker-input], input[data-vf-color-picker-text]',
            ),
          ).filter((input) => input.closest('[data-vf-color-picker-root]') === root);
        const onReset = (event: Event) => {
          const group = inputs();
          if (!group.length || !group.every((input) => input.form && input.form === event.target)) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented) return;
            const group = inputs();
            if (!group.length || !group.every((input) => input.form === event.target)) return;
            const next = requiredHex(this.value() ?? this.initial);
            if (this.value() === undefined) this.internal.set(next);
            for (const input of group) input.value = next;
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
  set(v: string) {
    const next = hex(v);
    if (this.disabled() || next === null || next === this.current()) return;
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(next);
  }
}
@Directive({
  selector: 'input[vfColorPickerInput]',
  standalone: true,
  host: {
    type: 'color',
    'data-vf-color-picker-input': '',
    '[value]': 'root.current()',
    '[disabled]': 'root.disabled() || disabled()',
    '(input)': 'change($event)',
  },
})
export class VfColorPickerInputDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly root: VfColorPickerRootDirective) {}
  change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!event.defaultPrevented && !input.matches(':disabled')) this.root.set(input.value);
    input.value = this.root.current();
  }
}
@Directive({
  selector: 'input[vfColorPickerText]',
  standalone: true,
  host: {
    type: 'text',
    pattern: '#[0-9a-fA-F]{6}',
    'data-vf-color-picker-text': '',
    '[value]': 'root.current()',
    '[disabled]': 'root.disabled() || disabled()',
    '[readOnly]': 'readOnly()',
    '(input)': 'change($event)',
  },
})
export class VfColorPickerTextDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute, alias: 'readonly' });
  constructor(readonly root: VfColorPickerRootDirective) {}
  change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (event.defaultPrevented || input.matches(':disabled') || input.readOnly) {
      input.value = this.root.current();
      return;
    }
    const next = hex(input.value);
    if (next === null) return;
    this.root.set(next);
    input.value = this.root.current();
  }
}
@Directive({
  selector: '[vfColorPickerSwatch]',
  standalone: true,
  host: {
    'aria-hidden': 'true',
    'data-vf-color-picker-swatch': '',
    '[style.backgroundColor]': 'root.current()',
  },
})
export class VfColorPickerSwatchDirective {
  constructor(readonly root: VfColorPickerRootDirective) {}
}
