import { Component } from '@angular/core';
import { VfTextareaDirective } from '@vyrnforge/angular/textarea';
import '@vyrnforge/web/styles/textarea.css';

@Component({
  selector: 'vf-textarea-example',
  standalone: true,
  imports: [VfTextareaDirective],
  template: `
    <label for="notes">Notes</label>
    <textarea vfTextarea id="notes" name="notes" rows="4" required></textarea>
  `,
})
export class TextareaExample {}
