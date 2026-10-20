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
      <h2 vfText="heading">Typography foundation</h2>
      <p vfText>Native elements keep their semantics while VyrnForge supplies the visual typography contract.</p>
      <p vfText="body-sm">Small body text remains readable without becoming a new semantic element.</p>
      <span vfText="label">Account name</span>
      <h3 vfText="title">Section title</h3>
    </div>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
