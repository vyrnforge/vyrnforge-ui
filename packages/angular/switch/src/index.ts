import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfSwitch]', standalone: true, host: { 'data-vf-switch': '', type: 'checkbox', role: 'switch' } })
export class VfSwitchDirective {}
