import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DrawerBody, DrawerClose, DrawerRoot, DrawerTitle } from '@vyrnforge/react/drawer';
import { Button } from '@vyrnforge/react/button';

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open settings
      </Button>
      <DrawerRoot open={open} onOpenChange={setOpen} placement="end">
        <DrawerTitle>Settings</DrawerTitle>
        <DrawerBody>Settings content</DrawerBody>
        <DrawerClose data-vf-button="" data-vf-variant="secondary">
          Close
        </DrawerClose>
      </DrawerRoot>
    </>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
