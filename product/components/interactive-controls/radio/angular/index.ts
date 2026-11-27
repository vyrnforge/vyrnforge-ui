import { Directive, input } from '@angular/core';

@Directive({
  selector: 'input[vfRadio]',
  standalone: true,
  host: { 'data-vf-radio': '', '[attr.data-vf-size]': 'size()', type: 'radio' },
})
export class VfRadioDirective {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
