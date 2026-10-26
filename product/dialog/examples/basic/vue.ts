import { createApp, h, ref } from 'vue';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle } from '@vyrnforge/vue/dialog';
import '@vyrnforge/web/styles/dialog.css';

createApp({
  setup() {
    const open = ref(false);
    return () => h('div', {}, [
      h('button', { type: 'button', onClick: () => { open.value = true; } }, 'Open dialog'),
      h(DialogRoot, {
        id: 'example-dialog',
        modelValue: open.value,
        'onUpdate:modelValue': (value: boolean) => { open.value = value; },
        backdropDismiss: true,
        descriptionId: 'example-dialog-description',
      }, () => [
        h(DialogTitle, {}, () => 'Edit profile'),
        h(DialogDescription, { id: 'example-dialog-description' }, () => 'Update the fields you want to change.'),
        h(DialogBody, {}, () => 'Profile form content'),
        h(DialogClose, {}, () => 'Close'),
      ]),
    ]);
  },
}).mount('#root');
