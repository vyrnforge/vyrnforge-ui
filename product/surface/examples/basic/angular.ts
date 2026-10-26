import { Component } from '@angular/core';
import { VfSurfaceDirective } from '@vyrnforge/angular/surface';
import '@vyrnforge/web/styles/surface.css';

@Component({
  selector: 'vf-surface-example',
  standalone: true,
  imports: [VfSurfaceDirective],
  template: `
    <article vfSurface>
      <h2>Release summary</h2>
      <p>Surface supplies the visual boundary; application CSS owns spacing and layout.</p>
    </article>
  `,
})
export class SurfaceExample {}
