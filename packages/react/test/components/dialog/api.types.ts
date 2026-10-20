import type {
  DialogBodyProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogDismissReason,
  DialogDismissRequest,
  DialogRootProps,
  DialogTitleProps,
} from '@vyrnforge/react/dialog';

const root: DialogRootProps = {
  defaultOpen: false,
  backdropDismiss: true,
  descriptionId: 'example-description',
  onOpenChange: (open) => void open,
  onDismissRequest: (request) => request.preventDefault(),
};
const title: DialogTitleProps = { children: 'Title' };
const description: DialogDescriptionProps = { children: 'Description' };
const body: DialogBodyProps = { children: 'Body' };
const close: DialogCloseProps = { children: 'Close' };
const reasons: DialogDismissReason[] = ['escape', 'backdrop', 'close-control'];
const accept = (request: DialogDismissRequest) => request.defaultPrevented;
// @ts-expect-error Unsupported dismissal reasons are not public API.
const invalidReason: DialogDismissReason = 'outside-click';
void [root, title, description, body, close, reasons, accept, invalidReason];
