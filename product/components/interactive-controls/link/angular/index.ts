import { Directive } from '@angular/core';

@Directive({ selector: 'a[vfLink]', standalone: true, host: { 'data-vf-link': '' } })
export class VfLinkDirective {}
