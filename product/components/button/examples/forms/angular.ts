import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfButtonDirective } from '@vyrnforge/angular/button';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfButtonDirective],
  template: `
    <form class="vf-example-stack" (submit)="$event.preventDefault()">
      <label for="vf-button-form-value">Example value</label>
      <input id="vf-button-form-value" name="example" value="Original">
      <button vfButton type="submit" variant="primary">Submit form</button>
      <button vfButton type="reset" variant="secondary">Reset form</button>
      <button vfButton type="button" variant="ghost">Other action</button>
    </form>
  `
})
class ExampleApp {}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
