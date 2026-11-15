import {
  Directive,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
@Directive({
  selector: '[vfSearchFieldRoot]',
  standalone: true,
  host: { role: 'search', 'data-vf-search-field-root': '' },
})
export class VfSearchFieldRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly valueChange = output<string>();
  private iv = signal<string | undefined>(undefined);
  private inputElement = signal<HTMLInputElement | null>(null);
  private initial = '';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  readonly current = computed(() => this.value() ?? this.iv() ?? this.defaultValue());
  ngOnInit() {
    this.initial = this.defaultValue();
    this.iv.set(this.initial);
    afterRenderEffect(
      {
        write: () => {
          const input = this.inputElement();
          const value = this.value();
          if (input) input.defaultValue = value ?? this.initial;
        },
      },
      { injector: this.injector },
    );
    afterNextRender(
      () => {
        const document = this.element.nativeElement.ownerDocument;
        let active = true;
        const onReset = (event: Event) => {
          const input = this.inputElement();
          if (!input?.form || input.form !== event.target) return;
          setTimeout(() => {
            if (!active || event.defaultPrevented || input.form !== event.target || this.inputElement() !== input)
              return;
            const next = this.value() ?? this.initial;
            if (this.value() === undefined) this.iv.set(next);
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
  set(v: string) {
    if (v === this.current()) return;
    if (this.value() === undefined) this.iv.set(v);
    this.valueChange.emit(v);
  }
  registerInput(inputElement: HTMLInputElement) {
    this.inputElement.set(inputElement);
    return () => {
      if (this.inputElement() === inputElement) this.inputElement.set(null);
    };
  }
  clear() {
    const inputElement = this.inputElement();
    if (!inputElement || inputElement.readOnly || inputElement.matches(':disabled') || !inputElement.value) return;
    this.set('');
    inputElement.focus();
  }
}
@Directive({
  selector: 'input[vfSearchFieldInput]',
  standalone: true,
  host: {
    type: 'search',
    'data-vf-search-field-input': '',
    '[value]': 'root.current()',
    '(input)': 'onInput($event)',
  },
})
export class VfSearchFieldInputDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  constructor(readonly root: VfSearchFieldRootDirective) {
    inject(DestroyRef).onDestroy(root.registerInput(this.elementRef.nativeElement));
  }
  onInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (!event.defaultPrevented && !input.readOnly && !input.matches(':disabled')) this.root.set(input.value);
    if (input.value !== this.root.current()) input.value = this.root.current();
  }
}
@Directive({
  selector: 'button[vfSearchFieldClear]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-search-field-clear': '',
    '[disabled]': '!root.current()',
    '(click)': '!$event.defaultPrevented && root.clear()',
  },
})
export class VfSearchFieldClearDirective {
  constructor(readonly root: VfSearchFieldRootDirective) {}
}
