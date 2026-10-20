import { Component } from '@angular/core';
import { VfIconComponent } from '@vyrnforge/angular/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

@Component({ selector: 'vf-example', standalone: true, imports: [VfIconComponent], template: '<vf-icon [icon]="bookmark" variant="outlined" shape="rounded" label="Bookmark" />' })
export class ExampleComponent { readonly bookmark = bookmarkIcon; }
