import { Directive, ElementRef, HostListener, Renderer2, afterRenderEffect, booleanAttribute, inject, input } from '@angular/core';

@Directive({
  selector: 'input[vfCheckbox]',
  standalone: true,
  host: {
    'data-vf-checkbox': '',
    '[attr.data-vf-size]': 'size()',
    type: 'checkbox',
  },
})
export class VfCheckboxDirective {
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    afterRenderEffect({
      write: () => this.renderer.setProperty(this.element.nativeElement, 'indeterminate', this.indeterminate()),
    });
  }

  @HostListener('click')
  private reconcileIndeterminateAfterActivation(): void {
    this.renderer.setProperty(this.element.nativeElement, 'indeterminate', this.indeterminate());
  }
}
