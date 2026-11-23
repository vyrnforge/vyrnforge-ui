import { Directive, ElementRef, HostListener, inject, input, model } from '@angular/core';
import type { ButtonSize } from '../../button/angular/index.js';

@Directive({
  selector: 'button[vfToggleButton]',
  standalone: true,
  host: {
    'data-vf-button': '',
    'data-vf-toggle-button': '',
    '[attr.data-vf-size]': 'size()',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.type]': 'type()',
  },
})
export class VfToggleButtonDirective {
  readonly pressed = model(false);
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (event.defaultPrevented || this.element.nativeElement.disabled) return;
    this.pressed.set(!this.pressed());
  }
}
