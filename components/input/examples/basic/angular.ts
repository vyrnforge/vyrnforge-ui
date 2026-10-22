import { Component } from '@angular/core';
import { VfInputDirective } from '@vyrnforge/angular/input';
import '@vyrnforge/web/styles/input.css';

@Component({
  selector: 'vf-input-example',
  standalone: true,
  imports: [VfInputDirective],
  template: `
    <label for="email">Email</label>
    <input vfInput id="email" type="email" name="email" autocomplete="email" required>
  `,
})
export class InputExample {}
