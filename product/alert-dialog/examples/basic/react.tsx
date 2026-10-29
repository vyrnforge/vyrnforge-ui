import {
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@vyrnforge/react/alert-dialog';

export default function SharedCollectionDeletionExample() {
  return (
    <AlertDialogRoot defaultOpen>
      <AlertDialogTitle>Delete “Q4 Roadmap”?</AlertDialogTitle>
      <AlertDialogDescription>
        This shared collection is used by 18 collaborators. Your application reports that it has no restore path after deletion.
      </AlertDialogDescription>
      <AlertDialogBody>
        Delete the collection only after the application has confirmed the target, scope, and recovery policy. A delayed or rejected commit must remain application-owned and must not be reported as success merely because this action was activated.
      </AlertDialogBody>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete collection</AlertDialogAction>
    </AlertDialogRoot>
  );
}
