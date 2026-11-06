import { Directive } from '@angular/core';

@Directive({ selector: 'select[vfNativeSelect]', standalone: true, host: { 'data-vf-native-select': '' } })
export class VfNativeSelectDirective {}
