import { Directive, ElementRef, computed, inject, input, output, signal } from '@angular/core';
@Directive({ selector: '[vfRatingRoot]', standalone: true, host: { role: 'radiogroup', 'data-vf-rating-root': '' } })
export class VfRatingRootDirective {
  readonly value = input<number | undefined>(undefined);
  readonly defaultValue = input(0);
  readonly name = input.required<string>();
  readonly valueChange = output<number>();
  private iv = signal<number | undefined>(undefined);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly selected = computed(() => this.value() ?? this.iv() ?? this.defaultValue());
  set(v: number) {
    if (v === this.selected()) return;
    if (this.value() === undefined) this.iv.set(v);
    this.valueChange.emit(v);
    const root = this.element.nativeElement;
    for (const item of root.querySelectorAll<HTMLInputElement>('input[type="radio"][data-vf-rating-item]')) {
      if (item.closest('[data-vf-rating-root]') === root) item.checked = Number(item.value) === this.selected();
    }
  }
}
@Directive({
  selector: 'input[type=radio][vfRatingItem]',
  standalone: true,
  host: {
    'data-vf-rating-item': '',
    '[attr.name]': 'root.name()',
    '[attr.value]': 'value()',
    '[checked]': 'root.selected() === value()',
    '(change)': 'root.set(value())',
  },
})
export class VfRatingItemDirective {
  readonly value = input.required<number>({ alias: 'vfRatingItem' });
  constructor(readonly root: VfRatingRootDirective) {}
}
