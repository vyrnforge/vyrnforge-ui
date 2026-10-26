import type { DialogDismissReason as ReactDismissReason } from '@vyrnforge/react/dialog';
import type { DialogDismissReason as AngularDismissReason } from '@vyrnforge/angular/dialog';
import type { DialogDismissReason as VueDismissReason } from '@vyrnforge/vue/dialog';

const reasons: [ReactDismissReason, AngularDismissReason, VueDismissReason] = ['escape', 'backdrop', 'close-control'];
void reasons;
