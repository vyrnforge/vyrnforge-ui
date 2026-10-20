import type { DialogDismissReason, DialogDismissRequest } from '@vyrnforge/angular/dialog';
import {
  VfDialogBodyDirective,
  VfDialogCloseDirective,
  VfDialogDescriptionDirective,
  VfDialogRootDirective,
  VfDialogTitleDirective,
} from '@vyrnforge/angular/dialog';

const reasons: DialogDismissReason[] = ['escape', 'backdrop', 'close-control'];
const accept = (request: DialogDismissRequest) => request.defaultPrevented;
const directives = [
  VfDialogRootDirective,
  VfDialogTitleDirective,
  VfDialogDescriptionDirective,
  VfDialogBodyDirective,
  VfDialogCloseDirective,
];
// @ts-expect-error Unsupported dismissal reasons are not public API.
const invalidReason: DialogDismissReason = 'outside-click';
void [reasons, accept, directives, invalidReason];
