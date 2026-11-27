import {
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { IconDefinition, IconSize } from '@vyrnforge/web/icon';
import { ratingStar, ratingMaximum, ratingValue, reconcileRating, connectRatingReset } from '@vyrnforge/web/rating';
import { VfIconComponent } from '@vyrnforge/angular/icon';

function createRatingState(options: {
  value: () => number | undefined;
  defaultValue: () => number;
  emit: (value: number) => void;
  root: () => HTMLElement | null;
  normalize?: (value: number) => number;
}) {
  const iv = signal<number | undefined>(undefined);
  let initial = 0;
  const normalize = options.normalize ?? ((v: number) => v);
  const selected = computed(() => normalize(options.value() ?? iv() ?? options.defaultValue()));
  let disconnect: (() => void) | undefined;
  afterNextRender(() => {
    disconnect = connectRatingReset(options.root, () => {
      const next = normalize(options.value() ?? initial);
      if (options.value() === undefined) iv.set(next);
      return next;
    });
  });
  inject(DestroyRef).onDestroy(() => disconnect?.());
  return {
    selected,
    initialize() {
      initial = options.defaultValue();
      iv.set(initial);
    },
    set(value: number) {
      if (value === selected()) return;
      if (options.value() === undefined) iv.set(value);
      options.emit(value);
      reconcileRating(options.root(), selected());
    },
  };
}

@Directive({ selector: '[vfRatingRoot]', standalone: true, host: { role: 'radiogroup', 'data-vf-rating-root': '' } })
export class VfRatingRootDirective {
  readonly value = input<number | undefined>(undefined);
  readonly defaultValue = input(0);
  readonly name = input.required<string>();
  readonly valueChange = output<number>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = createRatingState({
    value: this.value,
    defaultValue: this.defaultValue,
    emit: (v) => this.valueChange.emit(v),
    root: () => this.element.nativeElement,
  });
  readonly selected = this.state.selected;
  ngOnInit() {
    this.state.initialize();
  }
  set(v: number) {
    this.state.set(v);
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

/** Native generated choice group. Name is required for interactive SSR-stable groups. */
@Component({
  selector: 'vf-rating',
  standalone: true,
  imports: [VfIconComponent],
  template: `
    <div [attr.data-vf-rating-with-clear]="canClear() ? '' : null">
      <div
        data-vf-rating-root
        data-vf-rating-enhanced
        [attr.role]="readOnly() ? 'img' : 'radiogroup'"
        [attr.aria-label]="label() ?? null"
        [attr.aria-labelledby]="labelledBy() ?? null"
        [attr.aria-describedby]="describedBy() ?? null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-required]="!readOnly() && required() ? 'true' : null"
        [attr.aria-disabled]="!readOnly() && disabled() ? 'true' : null"
        [attr.data-vf-size]="size()"
        [attr.data-vf-precision]="step()"
        [attr.data-vf-readonly]="readOnly() ? '' : null"
        [attr.data-vf-disabled]="disabled() ? '' : null"
      >
        @for (star of stars(); track star) {
          <span data-vf-rating-star>
            <span
              data-vf-rating-artwork
              aria-hidden="true"
              [style.--_vf-rating-fill]="readOnly() ? fraction(star) : null"
            >
              <vf-icon [icon]="icon()" [size]="size()" variant="outlined" />
              <span data-vf-rating-fill><vf-icon [icon]="icon()" [size]="size()" variant="filled" /></span>
            </span>
            @if (!readOnly()) {
              <span data-vf-rating-choices>
                @for (part of parts(); track part) {
                  <label data-vf-rating-option>
                    <input
                      type="radio"
                      data-vf-rating-choice
                      [attr.name]="groupName()"
                      [value]="star + part"
                      [checked]="selected() === star + part"
                      [disabled]="disabled()"
                      [required]="required()"
                      [attr.aria-label]="itemLabel(star + part)"
                      [attr.aria-invalid]="invalid() ? 'true' : null"
                      [attr.aria-describedby]="describedBy() ?? null"
                      (change)="choose(star + part)"
                    />
                  </label>
                }
              </span>
            }
          </span>
        }
      </div>
      @if (canClear()) {
        <button
          type="button"
          data-vf-rating-clear
          [disabled]="disabled()"
          [attr.aria-disabled]="selected() === 0 ? 'true' : null"
          (click)="clear()"
        >
          {{ clearText() }}
        </button>
      }
    </div>
  `,
})
export class VfRatingComponent {
  readonly value = input<number | undefined>(undefined);
  readonly defaultValue = input(0);
  readonly name = input('');
  readonly max = input(5);
  readonly precision = input<1 | 0.5>(1);
  readonly size = input<IconSize>('md');
  readonly icon = input<IconDefinition>(ratingStar);
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly clearLabel = input<string | undefined>(undefined);
  readonly getItemLabel = input<((value: number) => string) | undefined>(undefined);
  readonly label = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly labelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly describedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  readonly invalid = input(false, { alias: 'aria-invalid', transform: booleanAttribute });
  readonly valueChange = output<number>();
  readonly count = computed(() => ratingMaximum(this.max()));
  readonly step = computed(() => (this.precision() === 0.5 ? 0.5 : 1));
  readonly stars = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  readonly parts = computed(() => (this.step() === 0.5 ? [0.5, 1] : [1]));
  readonly canClear = computed(() => this.clearable() && !this.required() && !this.readOnly());
  readonly groupName = computed(() => {
    if (!this.readOnly() && !this.name().trim()) throw new Error('Interactive Angular Rating requires a name.');
    return this.name();
  });
  readonly clearText = computed(() => {
    const label = this.clearLabel();
    if (this.canClear() && !label?.trim()) throw new Error('Rating clearable requires a localized clearLabel.');
    return label;
  });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = createRatingState({
    value: this.value,
    defaultValue: this.defaultValue,
    emit: (v) => this.valueChange.emit(v),
    root: () => this.element.nativeElement.querySelector<HTMLElement>('[data-vf-rating-root]'),
    normalize: (v) => ratingValue(v, this.count(), this.step(), this.readOnly()),
  });
  readonly selected = this.state.selected;
  ngOnInit() {
    this.state.initialize();
  }
  itemLabel(value: number) {
    return this.getItemLabel()?.(value) ?? String(value);
  }
  fraction(star: number) {
    return Math.round(Math.max(0, Math.min(1, this.selected() - star)) * 1000000) / 10000 + '%';
  }
  choose(value: number) {
    if (!this.readOnly() && !this.disabled()) this.state.set(value);
  }
  clear() {
    if (this.canClear() && !this.disabled()) this.state.set(0);
  }
}
