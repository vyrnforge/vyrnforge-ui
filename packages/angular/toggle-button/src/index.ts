import { Directive, ElementRef, HostListener, inject, input, model } from '@angular/core';

@Directive({
  selector: 'button[vfToggleButton]',
  standalone: true,
  host: {
    'data-vf-button': '',
    'data-vf-toggle-button': '',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.data-vf-pressed]': 'pressed() ? "" : null',
    '[attr.type]': 'type()',
  },
})
export class VfToggleButtonDirective {
  readonly pressed = model(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (event.defaultPrevented || this.element.nativeElement.disabled) return;
    this.pressed.set(!this.pressed());
  }
}
