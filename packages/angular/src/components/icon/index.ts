import { Component, computed, input } from '@angular/core';
import {
  resolveIconGlyph,
  type IconDefinition,
  type IconShape,
  type IconSize,
  type IconVariant,
} from '@vyrnforge/web/icon';

export type { IconDefinition, IconShape, IconSize, IconVariant } from '@vyrnforge/web/icon';

@Component({
  selector: 'vf-icon',
  standalone: true,
  host: { 'data-vf-icon-host': '' },
  template: `
    <svg
      data-vf-icon
      [attr.data-vf-icon-name]="icon().name"
      [attr.data-vf-variant]="variant()"
      [attr.data-vf-shape]="shape()"
      [attr.data-vf-size]="size()"
      [attr.viewBox]="icon().viewBox"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() ?? null"
      [attr.aria-hidden]="label() ? null : 'true'"
      focusable="false"
    >
      @for (path of glyph().paths; track $index) {
        <path
          [attr.d]="path.d"
          [attr.fill]="path.fill ?? null"
          [attr.stroke]="path.stroke ?? null"
          [attr.stroke-width]="path.strokeWidth ?? null"
          [attr.stroke-linecap]="path.strokeLinecap ?? null"
          [attr.stroke-linejoin]="path.strokeLinejoin ?? null"
        />
      }
    </svg>
  `,
})
export class VfIconComponent {
  readonly icon = input.required<IconDefinition>();
  readonly variant = input<IconVariant>('outlined');
  readonly shape = input<IconShape>('rounded');
  readonly size = input<IconSize>('md');
  readonly label = input<string | undefined>(undefined);
  readonly glyph = computed(() => resolveIconGlyph(this.icon(), this.variant(), this.shape()));
}
