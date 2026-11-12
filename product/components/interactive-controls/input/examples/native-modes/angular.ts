import { Component } from '@angular/core';
import { VfInputDirective } from '@vyrnforge/angular/input';
import '@vyrnforge/web/styles/input.css';

@Component({
  selector: 'vf-input-native-modes-example',
  standalone: true,
  imports: [VfInputDirective],
  template: `
    <label for="quantity">Quantity</label>
    <input vfInput id="quantity" type="number" name="quantity" min="0" step="1">

    <label for="starts-on">Starts on</label>
    <input vfInput id="starts-on" type="date" name="startsOn">

    <label for="accent">Accent color</label>
    <input vfInput id="accent" type="color" name="accent" value="#245edb">
  `,
})
export class InputNativeModesExample {}
