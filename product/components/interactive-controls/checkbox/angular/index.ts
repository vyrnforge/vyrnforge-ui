import { Directive, ElementRef, Renderer2, afterRenderEffect, booleanAttribute, inject, input } from '@angular/core';

@Directive({
  selector: 'input[vfCheckbox]',
  standalone: true,
  host: {
    'data-vf-checkbox': '',
    type: 'checkbox',
    '[attr.data-vf-indeterminate]': 'indeterminate() ? "" : null',
  },
})
export class VfCheckboxDirective {
  readonly indeterminate = input(false, { transform: booleanAttribute });
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    afterRenderEffect({
      write: () => this.renderer.setProperty(this.element.nativeElement, 'indeterminate', this.indeterminate()),
    });
  }
}
