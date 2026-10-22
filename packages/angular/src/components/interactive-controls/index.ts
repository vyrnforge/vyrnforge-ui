import { Directive, ElementRef, HostListener, effect, inject, input, model } from '@angular/core';
import type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

export type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

@Directive({ selector: 'a[vfLink]', standalone: true, host: { 'data-vf-link': '' } })
export class VfLinkDirective {}

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
  private readonly element = inject(ElementRef<HTMLButtonElement>);

  @HostListener('click')
  handleClick() {
    if (this.element.nativeElement.disabled) return;
    this.pressed.set(!this.pressed());
  }
}

@Directive({ selector: 'input[vfNumberInput]', standalone: true, host: { 'data-vf-number-input': '', type: 'number' } })
export class VfNumberInputDirective {}

@Directive({ selector: 'input[vfCheckbox]', standalone: true, host: { 'data-vf-checkbox': '', type: 'checkbox', '[attr.data-vf-indeterminate]': 'indeterminate() ? "" : null' } })
export class VfCheckboxDirective {
  readonly indeterminate = input(false);
  private readonly element = inject(ElementRef<HTMLInputElement>);
  constructor() {
    effect(() => { this.element.nativeElement.indeterminate = this.indeterminate(); });
  }
}

@Directive({ selector: 'input[vfRadio]', standalone: true, host: { 'data-vf-radio': '', type: 'radio' } })
export class VfRadioDirective {}

@Directive({ selector: 'input[vfSwitch]', standalone: true, host: { 'data-vf-switch': '', type: 'checkbox', role: 'switch' } })
export class VfSwitchDirective {}

@Directive({ selector: 'select[vfNativeSelect]', standalone: true, host: { 'data-vf-native-select': '' } })
export class VfNativeSelectDirective {}

@Directive({ selector: 'input[vfSlider]', standalone: true, host: { 'data-vf-slider': '', type: 'range' } })
export class VfSliderDirective {}

@Directive({ selector: 'input[vfFileInput]', standalone: true, host: { 'data-vf-file-input': '', type: 'file' } })
export class VfFileInputDirective {}

@Directive({ selector: 'input[vfColorInput]', standalone: true, host: { 'data-vf-color-input': '', type: 'color' } })
export class VfColorInputDirective {}

@Directive({ selector: 'input[vfTemporalInput]', standalone: true, host: { 'data-vf-temporal-input': '', '[attr.type]': 'type()' } })
export class VfTemporalInputDirective {
  readonly type = input<TemporalInputType>('date');
}
