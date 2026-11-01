import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfButtonDirective } from '@vyrnforge/angular/button';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfButtonDirective],
  template: `
    <div class="vf-example-stack">
      <button vfButton type="button">Ready</button>
      <button vfButton variant="secondary" disabled type="button">Disabled</button>
      <button vfButton loading type="button">Loading</button>
      <button vfButton loading disabled type="button">Loading and disabled</button>
    </div>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
