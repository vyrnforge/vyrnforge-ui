import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfButtonDirective } from '@vyrnforge/angular/button';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfButtonDirective],
  template: `
    <div data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="md" data-vf-flow-align="center">
      <button vfButton size="sm" type="button">Small</button>
      <button vfButton size="md" type="button">Medium</button>
      <button vfButton size="lg" type="button">Large</button>
    </div>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
