import { Component } from '@angular/core';
import { VfButtonDirective } from '@vyrnforge/angular/button';
import { VfInputDirective } from '@vyrnforge/angular/input';
import { VfControlGroupDirective } from '@vyrnforge/angular/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/layout.css';

@Component({
  selector: 'vf-search-controls-example',
  standalone: true,
  imports: [VfButtonDirective, VfInputDirective, VfControlGroupDirective],
  template: `
    <div vfControlGroup>
      <input vfInput type="search" aria-label="Search query">
      <button vfButton variant="secondary" type="button">Search</button>
    </div>
  `,
})
export class SearchControlsExample {}
