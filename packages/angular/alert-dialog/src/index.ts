import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type AlertDialogDismissReason = 'escape' | 'close-control';
export interface AlertDialogDismissRequest {
  readonly reason: AlertDialogDismissReason;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

function createDismissRequest(reason: AlertDialogDismissReason): AlertDialogDismissRequest {
  let prevented = false;
  return {
    reason,
    get defaultPrevented() { return prevented; },
    preventDefault() { prevented = true; },
  };
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]'));
}

@Directive({
  selector: 'dialog[vfAlertDialogRoot]',
  standalone: true,
  host: {
    role: 'alertdialog',
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'resolvedTitleId()',
    '[attr.aria-describedby]': 'descriptionId() ?? null',
    'data-vf-alert-dialog-root': '',
    '[attr.data-vf-open]': 'desiredOpen() ? "" : null',
    '(cancel)': 'onCancel($event)',
    '(close)': 'onClose()',
  },
})
export class VfAlertDialogRootDirective {
  readonly id = input.required<string>();
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly titleId = input<string | undefined>(undefined);
  readonly descriptionId = input<string | undefined>(undefined);
  readonly initialFocus = input<HTMLElement | undefined>(undefined);
  readonly openChange = output<boolean>();
  readonly dismissRequest = output<AlertDialogDismissRequest>();

  private readonly element = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  private readonly internalOpen = signal(false);
  private initialized = false;
  private restoreTarget: HTMLElement | null = null;

  readonly desiredOpen = computed(() => this.open() ?? (this.initialized ? this.internalOpen() : this.defaultOpen()));
  readonly resolvedTitleId = computed(() => this.titleId() ?? `${this.id()}-title`);

  constructor() {
    effect(() => {
      const controlledOpen = this.open();
      const defaultOpen = this.defaultOpen();
      if (!this.initialized) {
        this.initialized = true;
        if (controlledOpen === undefined) this.internalOpen.set(defaultOpen);
      }
      const desiredOpen = controlledOpen ?? this.internalOpen();
      if (typeof document === 'undefined') return;
      const dialog = this.element.nativeElement;
      queueMicrotask(() => this.syncDialog(dialog, desiredOpen, true));
    });
  }

  private syncDialog(dialog: HTMLDialogElement, desiredOpen: boolean, captureRestoreTarget: boolean): void {
    if (desiredOpen && !dialog.open) {
      if (captureRestoreTarget) this.restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      this.initialFocus()?.focus();
    } else if (!desiredOpen && dialog.open) {
      dialog.close();
    }
  }

  private restoreFocus(): void {
    const target = this.restoreTarget;
    this.restoreTarget = null;
    if (canRestoreFocus(target)) target.focus();
  }

  requestDismiss(reason: AlertDialogDismissReason): void {
    const request = createDismissRequest(reason);
    this.dismissRequest.emit(request);
    if (request.defaultPrevented) return;
    if (this.open() === undefined) this.internalOpen.set(false);
    this.openChange.emit(false);
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.requestDismiss('escape');
  }

  onClose(): void {
    if (this.desiredOpen()) {
      if (this.open() === undefined) {
        this.internalOpen.set(false);
        this.openChange.emit(false);
        this.restoreFocus();
        return;
      }
      this.openChange.emit(false);
      const dialog = this.element.nativeElement;
      queueMicrotask(() => {
        if (this.desiredOpen()) this.syncDialog(dialog, true, false);
        else this.restoreFocus();
      });
      return;
    }
    this.restoreFocus();
  }
}

@Directive({ selector: '[vfAlertDialogTitle]', standalone: true, host: { '[attr.id]': 'id() ?? root.resolvedTitleId()', 'data-vf-alert-dialog-title': '' } })
export class VfAlertDialogTitleDirective { readonly root = inject(VfAlertDialogRootDirective); readonly id = input<string | undefined>(undefined); }

@Directive({ selector: '[vfAlertDialogDescription]', standalone: true, host: { '[attr.id]': 'id() ?? root.descriptionId() ?? (root.id() + "-description")', 'data-vf-alert-dialog-description': '' } })
export class VfAlertDialogDescriptionDirective { readonly root = inject(VfAlertDialogRootDirective); readonly id = input<string | undefined>(undefined); }

@Directive({ selector: '[vfAlertDialogBody]', standalone: true, host: { 'data-vf-alert-dialog-body': '' } })
export class VfAlertDialogBodyDirective { readonly root = inject(VfAlertDialogRootDirective); }

@Directive({ selector: 'button[vfAlertDialogCancel]', standalone: true, host: { type: 'button', 'data-vf-alert-dialog-cancel': '', '(click)': 'root.requestDismiss("close-control")' } })
export class VfAlertDialogCancelDirective { readonly root = inject(VfAlertDialogRootDirective); }

@Directive({ selector: 'button[vfAlertDialogAction]', standalone: true, host: { type: 'button', 'data-vf-alert-dialog-action': '', '(click)': 'root.requestDismiss("close-control")' } })
export class VfAlertDialogActionDirective { readonly root = inject(VfAlertDialogRootDirective); }
