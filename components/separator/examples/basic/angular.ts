import { Component } from '@angular/core';
import { VfSeparatorDirective } from '@vyrnforge/angular/separator';

@Component({
  standalone: true,
  imports: [VfSeparatorDirective],
  template: '<p>Account</p><hr vfSeparator><p>Security</p>',
})
export class Example {}
