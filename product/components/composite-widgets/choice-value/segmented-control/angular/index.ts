import { Directive, ElementRef, computed, inject, input, output, signal, booleanAttribute } from '@angular/core';
@Directive({
  selector: '[vfSegmentedControlRoot]',
  standalone: true,
  host: { role: 'radiogroup', 'data-vf-segmented-control-root': '' },
})
export class VfSegmentedControlRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly name = input.required<string>();
  readonly valueChange = output<string>();
  private iv = signal<string | undefined>(undefined);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly selected = computed(() => this.value() ?? this.iv() ?? this.defaultValue());
  set(v: string): void {
    if (v === this.selected()) return;
    if (this.value() === undefined) this.iv.set(v);
    this.valueChange.emit(v);
    const root = this.element.nativeElement;
    for (const candidate of root.querySelectorAll<HTMLInputElement>(
      'input[type="radio"][data-vf-segmented-control-radio]',
    )) {
      if (candidate.closest('[data-vf-segmented-control-root]') === root)
        candidate.checked = candidate.value === this.selected();
    }
  }
}
@Directive({
  selector: 'input[type=radio][vfSegmentedControlItem]',
  standalone: true,
  host: {
    'data-vf-segmented-control-radio': '',
    '[attr.name]': 'root.name()',
    '[attr.value]': 'value()',
    '[checked]': 'root.selected() === value()',
    '[disabled]': 'disabled()',
    '(change)': 'select()',
  },
})
export class VfSegmentedControlItemDirective {
  readonly value = input.required<string>({ alias: 'vfSegmentedControlItem' });
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly root: VfSegmentedControlRootDirective) {}
  select(): void {
    if (!this.disabled()) this.root.set(this.value());
  }
}
