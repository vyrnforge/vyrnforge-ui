import { defineDialogElement, type VfDialogElement } from '@vyrnforge/elements/dialog';
import '@vyrnforge/web/styles/dialog.css';

defineDialogElement();

document.querySelector('#root')!.innerHTML = `
  <button type="button" id="dialog-trigger">Open dialog</button>
  <vf-dialog id="example-dialog" backdrop-dismiss>
    <dialog>
      <h2 data-vf-dialog-title>Edit profile</h2>
      <p data-vf-dialog-description>Update the fields you want to change.</p>
      <div data-vf-dialog-body>Profile form content</div>
      <button type="button" data-vf-dialog-close>Close</button>
    </dialog>
  </vf-dialog>
`;

const trigger = document.querySelector<HTMLButtonElement>('#dialog-trigger')!;
const dialog = document.querySelector<VfDialogElement>('#example-dialog')!;
trigger.addEventListener('click', () => {
  dialog.open = true;
});
