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
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private initial: string = '';
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
          Array.from(
            root.querySelectorAll<HTMLInputElement>('input[type="radio"][data-vf-segmented-control-radio]'),
          ).filter((radio) => radio.closest('[data-vf-segmented-control-root]') === root);
        const onReset = (event: Event) => {
          const group = radios();
          if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented) return;
            const group = radios();
            if (!group.length || !group.every((radio) => radio.form === event.target)) return;
            const next = this.value() ?? this.initial;
            if (this.value() === undefined) this.iv.set(next);
            for (const radio of group) radio.checked = radio.value === next;
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
