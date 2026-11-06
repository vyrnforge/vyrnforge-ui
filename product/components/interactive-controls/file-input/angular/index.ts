import { Directive } from '@angular/core';

@Directive({ selector: 'input[vfFileInput]', standalone: true, host: { 'data-vf-file-input': '', type: 'file' } })
export class VfFileInputDirective {}
