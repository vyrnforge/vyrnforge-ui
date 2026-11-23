import { Directive, ElementRef, HostListener, booleanAttribute, inject, input, model } from '@angular/core';

@Directive({
  selector: 'button[vfToggleButton]',
  standalone: true,
  host: {
    'data-vf-button': '',
    'data-vf-toggle-button': '',
    '[attr.data-vf-size]': 'size()',
    '[attr.data-vf-icon-only]': 'iconOnly() ? "" : null',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.type]': 'type()',
  },
})
export class VfToggleButtonDirective {
  readonly pressed = model(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly iconOnly = input(false, { transform: booleanAttribute });
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (event.defaultPrevented || this.element.nativeElement.disabled) return;
    this.pressed.set(!this.pressed());
  }
}
