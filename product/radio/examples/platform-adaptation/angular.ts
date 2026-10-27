import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfButtonDirective } from '@vyrnforge/angular/button';
import { VfRadioDirective } from '@vyrnforge/angular/radio';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfButtonDirective, VfRadioDirective],
  template: `
    <form (submit)="confirm($event)">
      <fieldset>
        <legend>Delivery speed</legend>
        <label><input vfRadio name="deliverySpeed" value="standard" [checked]="selected() === 'standard'" (change)="selected.set('standard')"> Standard</label>
        <label><input vfRadio name="deliverySpeed" value="express" [checked]="selected() === 'express'" (change)="selected.set('express')"> Express</label>
        <label><input vfRadio name="deliverySpeed" value="same-day" disabled> Same day — unavailable</label>
      </fieldset>
      <button vfButton type="submit">Confirm delivery speed</button>
      <p role="status">{{ confirmed() ? 'Confirmed: ' + confirmed() + '.' : 'Not confirmed.' }}</p>
    </form>
  `
})
class ExampleApp {
  readonly selected = signal('standard');
  readonly confirmed = signal<string | null>(null);

  confirm(event: Event) {
    event.preventDefault();
    this.confirmed.set(this.selected());
  }
}

bootstrapApplication(ExampleApp, { providers: [provideZonelessChangeDetection()] });
