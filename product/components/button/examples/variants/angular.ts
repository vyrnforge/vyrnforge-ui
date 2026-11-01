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
      <button vfButton variant="primary" type="button">Primary</button>
      <button vfButton variant="secondary" type="button">Secondary</button>
      <button vfButton variant="ghost" type="button">Ghost</button>
    </div>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
