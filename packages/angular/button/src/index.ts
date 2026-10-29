import { Directive, booleanAttribute, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'button[vfButton]',
  standalone: true,
  host: {
    'data-vf-button': '',
    '[attr.data-vf-variant]': 'variant()',
    '[attr.data-vf-size]': 'size()',
    '[attr.data-vf-loading]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[disabled]': 'disabled()'
  }
})
export class VfButtonDirective {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
}
