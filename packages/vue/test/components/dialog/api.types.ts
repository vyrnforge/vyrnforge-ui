import type { DialogDismissReason, DialogDismissRequest, DialogRootProps } from '@vyrnforge/vue/dialog';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle } from '@vyrnforge/vue/dialog';

const root: DialogRootProps = {
  defaultOpen: false,
  backdropDismiss: true,
  descriptionId: 'dialog-description',
  initialFocus: () => null,
};
const reasons: DialogDismissReason[] = ['escape', 'backdrop', 'close-control'];
const accept = (request: DialogDismissRequest) => request.defaultPrevented;
const components = [DialogRoot, DialogTitle, DialogDescription, DialogBody, DialogClose];
// @ts-expect-error Unsupported dismissal reasons are not public API.
const invalidReason: DialogDismissReason = 'outside-click';
void [root, reasons, accept, components, invalidReason];
