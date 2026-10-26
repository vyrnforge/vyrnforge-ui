import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfIconComponent } from '@vyrnforge/angular/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

@Component({
  selector: 'vf-example-root',
  standalone: true,
  imports: [VfIconComponent],
  template: '<vf-icon [icon]="bookmark" variant="outlined" shape="rounded" label="Bookmark" />'
})
class ExampleApp {
  readonly bookmark = bookmarkIcon;
}

bootstrapApplication(ExampleApp, {
  providers: [provideZonelessChangeDetection()]
});
