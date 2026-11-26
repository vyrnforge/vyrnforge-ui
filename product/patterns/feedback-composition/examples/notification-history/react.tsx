import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { List, ListItem } from '@vyrnforge/react/list';
import { Text } from '@vyrnforge/react/text';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';

function Example() {
  const [records, setRecords] = useState<string[]>(['Monthly statement is available.']);
  const [open, setOpen] = useState(false);
  function completeExport() {
    setRecords((current) => [...current, 'Example export ' + current.length + ' is ready.']);
    setOpen(true);
  }
  return (
    <Flow gap="sm">
      <Button type="button" onClick={completeExport}>
        Complete example export
      </Button>
      <ToastViewport style={{ position: 'static', inlineSize: '100%' }}>
        <ToastRoot open={open} onOpenChange={setOpen} duration={0}>
          <ToastTitle>Export ready</ToastTitle>
          <ToastDescription>See notification history.</ToastDescription>
          <ToastClose aria-label="Dismiss notification">×</ToastClose>
        </ToastRoot>
      </ToastViewport>
      <Text as="h2" variant="heading-sm" id="notification-title">
        Notification history
      </Text>
      <List variant="divided" aria-labelledby="notification-title">
        {records.map((message, index) => (
          <ListItem key={index}>
            <Text>{message}</Text>
          </ListItem>
        ))}
      </List>
    </Flow>
  );
}

const host = document.querySelector('#root');
if (!host) throw new Error('Example mount is missing.');
createRoot(host).render(<Example />);
