import { Directive, input } from '@angular/core';

@Directive({
  selector: 'input[vfSlider]', standalone: true,
  host: { 'data-vf-slider': '', type: 'range', '[attr.data-vf-size]': 'size()', '[attr.data-vf-orientation]': 'orientation()', '[attr.aria-orientation]': 'orientation() === "vertical" ? "vertical" : null' },
})
export class VfSliderDirective {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
