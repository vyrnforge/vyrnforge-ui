import { Component } from '@angular/core';
import { VfVisuallyHiddenDirective } from '@vyrnforge/angular/visually-hidden';

@Component({
  standalone: true,
  imports: [VfVisuallyHiddenDirective],
  template: '<span vfVisuallyHidden>Notifications</span>',
})
export class Example {}
