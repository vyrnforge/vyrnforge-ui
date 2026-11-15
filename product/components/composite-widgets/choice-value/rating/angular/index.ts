import {
  Directive,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
@Directive({ selector: '[vfRatingRoot]', standalone: true, host: { role: 'radiogroup', 'data-vf-rating-root': '' } })
export class VfRatingRootDirective {
  readonly value = input<number | undefined>(undefined);
  readonly defaultValue = input(0);
  readonly name = input.required<string>();
  readonly valueChange = output<number>();
  private iv = signal<number | undefined>(undefined);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private initial: number = 0;
  readonly selected = computed(() => this.value() ?? this.iv() ?? this.defaultValue());

  ngOnInit() {
    this.initial = this.defaultValue();
    this.iv.set(this.initial);
    afterNextRender(
      () => {
        const root = this.element.nativeElement;
        const document = root.ownerDocument;
        let active = true;
        const radios = () =>
          Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"][data-vf-rating-item]')).filter(
            (radio) => radio.closest('[data-vf-rating-root]') === root,
          );
        const onReset = (event: Event) => {
          const group = radios();
          if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented) return;
            const group = radios();
            if (!group.length || !group.every((radio) => radio.form === event.target)) return;
            const next = this.value() ?? this.initial;
            if (this.value() === undefined) this.iv.set(next);
            for (const radio of group) radio.checked = Number(radio.value) === next;
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
