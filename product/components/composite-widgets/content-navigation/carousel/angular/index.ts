import { Directive, booleanAttribute, contentChildren, forwardRef, inject, input, output, signal } from '@angular/core';

@Directive({
  selector: '[vfCarouselRoot]',
  standalone: true,
  host: { role: 'region', 'aria-roledescription': 'carousel', 'data-vf-carousel-root': '' },
})
export class VfCarouselRootDirective {
  readonly index = input<number | undefined>(undefined);
  readonly defaultIndex = input(0);
  readonly indexChange = output<number>();
  private readonly internalIndex = signal<number | undefined>(undefined);
  private readonly slides = contentChildren<VfCarouselSlideDirective>(
    forwardRef(() => VfCarouselSlideDirective),
    {
      descendants: true,
    },
  );

  private ownedSlides() {
    return this.slides().filter((slide) => slide.root === this);
  }

  count() {
    return this.ownedSlides().length;
  }

  position(slide: VfCarouselSlideDirective) {
    return this.ownedSlides().indexOf(slide);
  }

  private bounded(value: number) {
    return Math.max(0, Math.min(Number.isFinite(value) ? Math.trunc(value) : 0, Math.max(0, this.count() - 1)));
  }

  current() {
    return this.bounded(this.index() ?? this.internalIndex() ?? this.defaultIndex());
  }

  set(value: number) {
    const next = this.bounded(value);
    if (this.count() === 0 || next === this.current()) return;
    if (this.index() === undefined) this.internalIndex.set(next);
    this.indexChange.emit(next);
  }
}

@Directive({ selector: '[vfCarouselViewport]', standalone: true, host: { 'data-vf-carousel-viewport': '' } })
export class VfCarouselViewportDirective {}

@Directive({
  selector: '[vfCarouselSlide]',
  standalone: true,
  host: {
    role: 'group',
    'aria-roledescription': 'slide',
    'data-vf-carousel-slide': '',
    '[hidden]': 'root.position(this) !== root.current()',
  },
})
export class VfCarouselSlideDirective {
  readonly root = inject(VfCarouselRootDirective);
}

@Directive({
  selector: 'button[vfCarouselPrevious]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-carousel-previous': '',
    '[disabled]': 'disabled()',
    '[attr.aria-disabled]': 'unavailable() ? "true" : null',
    '(click)': 'activate($event)',
  },
})
export class VfCarouselPreviousDirective {
  readonly root = inject(VfCarouselRootDirective);
  readonly disabled = input(false, { transform: booleanAttribute });

  unavailable() {
    return this.disabled() || this.root.current() === 0;
  }

  activate(event: MouseEvent) {
    if (!event.defaultPrevented && !this.unavailable()) this.root.set(this.root.current() - 1);
  }
}

@Directive({
  selector: 'button[vfCarouselNext]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-carousel-next': '',
    '[disabled]': 'disabled()',
    '[attr.aria-disabled]': 'unavailable() ? "true" : null',
    '(click)': 'activate($event)',
  },
})
export class VfCarouselNextDirective {
  readonly root = inject(VfCarouselRootDirective);
  readonly disabled = input(false, { transform: booleanAttribute });

  unavailable() {
    return this.disabled() || this.root.current() >= this.root.count() - 1;
  }

  activate(event: MouseEvent) {
    if (!event.defaultPrevented && !this.unavailable()) this.root.set(this.root.current() + 1);
  }
}
