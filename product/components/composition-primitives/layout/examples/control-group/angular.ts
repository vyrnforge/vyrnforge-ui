import { Component } from '@angular/core';
import { VfButtonDirective } from '@vyrnforge/angular/button';
import { VfControlGroupDirective } from '@vyrnforge/angular/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';

@Component({
  selector: 'vf-alignment-actions-example',
  standalone: true,
  imports: [VfButtonDirective, VfControlGroupDirective],
  template: `
    <div vfControlGroup role="group" aria-label="Text alignment">
      <button vfButton variant="secondary" type="button">Left</button>
      <button vfButton variant="secondary" type="button">Center</button>
      <button vfButton variant="secondary" type="button">Right</button>
    </div>
  `,
})
export class AlignmentActionsExample {}
