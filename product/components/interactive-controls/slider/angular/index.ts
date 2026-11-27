import { Directive, input, inject, ElementRef, DestroyRef, afterEveryRender } from '@angular/core';
import { connectSlider } from '@vyrnforge/web/slider';
import type { SliderConnection } from '@vyrnforge/web/slider';

@Directive({
  selector: 'input[vfSlider]', standalone: true,
  host: { 'data-vf-slider': '', type: 'range', '[attr.data-vf-size]': 'size()', '[attr.data-vf-orientation]': 'orientation()', '[attr.aria-orientation]': 'orientation() === "vertical" ? "vertical" : null' },
})
export class VfSliderDirective {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly marks = input<boolean | readonly { value: number; label?: string }[]>(false);
  readonly valueLabelDisplay = input<'off' | 'auto' | 'always'>('off');
  readonly formatValue = input<((value: number) => string) | undefined>(undefined);

  constructor() {
    const native = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    let connection: SliderConnection | undefined;
    afterEveryRender(() => {
      const options = { marks: this.marks(), valueLabelDisplay: this.valueLabelDisplay(), formatValue: this.formatValue() };
      if (!connection) connection = connectSlider(native, options);
      else connection.refresh(options);
    });
    inject(DestroyRef).onDestroy(() => connection?.disconnect());
  }
}
