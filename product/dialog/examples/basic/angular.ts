import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  VfDialogBodyDirective,
  VfDialogCloseDirective,
  VfDialogDescriptionDirective,
  VfDialogRootDirective,
  VfDialogTitleDirective,
} from '@vyrnforge/angular/dialog';
import '@vyrnforge/web/styles/dialog.css';

@Component({
  selector: 'vf-dialog-example',
  standalone: true,
  imports: [
    VfDialogRootDirective,
    VfDialogTitleDirective,
    VfDialogDescriptionDirective,
    VfDialogBodyDirective,
    VfDialogCloseDirective,
  ],
  template: `
    <button type="button" (click)="open.set(true)">Open dialog</button>
    <dialog
      vfDialogRoot
      id="example-dialog"
      [open]="open()"
      (openChange)="open.set($event)"
      backdropDismiss
      descriptionId="example-dialog-description"
    >
      <h2 vfDialogTitle>Edit profile</h2>
      <p vfDialogDescription id="example-dialog-description">Update the fields you want to change.</p>
      <div vfDialogBody>Profile form content</div>
      <button vfDialogClose>Close</button>
    </dialog>
  `,
})
class DialogExample {
  readonly open = signal(false);
}

bootstrapApplication(DialogExample, { providers: [provideZonelessChangeDetection()] });
