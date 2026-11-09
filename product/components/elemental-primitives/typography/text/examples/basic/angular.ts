import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfTextDirective } from '@vyrnforge/angular/text';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfTextDirective],
  template: `
    <div class="vf-example-stack">
      <h2 vfText variant="heading-md">Typography foundation</h2>
      <p vfText variant="body-md">Native elements keep their semantics while VyrnForge supplies the visual typography contract.</p>
      <blockquote vfText variant="body-lg">Semantic quotation with an independent visual role.</blockquote>
      <mark vfText variant="body-md">Important annotation</mark>
      <time vfText variant="caption" datetime="2026-11-10">November 10, 2026</time>
    </div>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
