import { Directive, computed, input, signal } from '@angular/core';

@Directive({
  selector: '[vfPasswordFieldRoot]',
  standalone: true,
  exportAs: 'vfPasswordFieldRoot',
  host: {
    'data-vf-password-field-root': '',
  },
})
export class VfPasswordFieldRootDirective {
  readonly visible = signal(false);

  toggle() {
    this.visible.update((value) => !value);
  }
}

@Directive({
  selector: 'input[vfPasswordFieldInput]',
  standalone: true,
  host: {
    'data-vf-password-field-input': '',
    '[attr.type]': 'root.visible() ? "text" : "password"',
  },
})
export class VfPasswordFieldInputDirective {
  constructor(readonly root: VfPasswordFieldRootDirective) {}
}

@Directive({
  selector: 'button[vfPasswordFieldToggle]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-password-field-toggle': '',
    '[attr.aria-label]': 'stateLabel()',
    '[attr.aria-pressed]': 'root.visible()',
    '(click)': 'root.toggle()',
  },
})
export class VfPasswordFieldToggleDirective {
  readonly showLabel = input.required<string>();
  readonly hideLabel = input.required<string>();

  readonly stateLabel = computed(() =>
    this.root.visible() ? this.hideLabel() : this.showLabel(),
  );

  constructor(readonly root: VfPasswordFieldRootDirective) {}
}
