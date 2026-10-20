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

export type DialogDismissReason = 'escape' | 'backdrop' | 'close-control';

export interface DialogDismissRequest {
  readonly reason: DialogDismissReason;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

function createDismissRequest(reason: DialogDismissReason): DialogDismissRequest {
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
  selector: 'dialog[vfDialogRoot]',
  standalone: true,
  host: {
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'resolvedTitleId()',
    '[attr.aria-describedby]': 'descriptionId() ?? null',
    'data-vf-dialog-root': '',
    '[attr.data-vf-open]': 'desiredOpen() ? "" : null',
    '[attr.data-vf-backdrop-dismiss]': 'backdropDismiss() ? "" : null',
    '(cancel)': 'onCancel($event)',
    '(close)': 'onClose()',
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
  },
})
export class VfDialogRootDirective {
  readonly id = input.required<string>();
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly backdropDismiss = input(false, { transform: booleanAttribute });
  readonly titleId = input<string | undefined>(undefined);
  readonly descriptionId = input<string | undefined>(undefined);
  readonly initialFocus = input<HTMLElement | undefined>(undefined);
  readonly openChange = output<boolean>();
  readonly dismissRequest = output<DialogDismissRequest>();

  private readonly element = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  private readonly internalOpen = signal(false);
  private initialized = false;
  private restoreTarget: HTMLElement | null = null;
  private backdropPointerDown = false;

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
      if (captureRestoreTarget) {
        this.restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      dialog.showModal();
      this.initialFocus()?.focus();
    } else if (!desiredOpen && dialog.open) {
      dialog.close();
    }
  }

  private restoreFocus(): void {
    const restoreTarget = this.restoreTarget;
    this.restoreTarget = null;
    if (canRestoreFocus(restoreTarget)) restoreTarget.focus();
  }

  requestDismiss(reason: DialogDismissReason): void {
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
        const desiredOpen = this.desiredOpen();
        if (desiredOpen) this.syncDialog(dialog, true, false);
        else this.restoreFocus();
      });
      return;
    }
    this.restoreFocus();
  }

  onPointerDown(event: PointerEvent): void {
    this.backdropPointerDown = event.target === event.currentTarget;
  }

  onClick(event: MouseEvent): void {
    const isBackdrop = this.backdropPointerDown && event.target === event.currentTarget;
    this.backdropPointerDown = false;
    if (this.backdropDismiss() && isBackdrop) this.requestDismiss('backdrop');
  }
}

@Directive({
  selector: '[vfDialogTitle]',
  standalone: true,
  host: {
    '[attr.id]': 'id() ?? root.resolvedTitleId()',
    'data-vf-dialog-title': '',
  },
})
export class VfDialogTitleDirective {
  readonly root = inject(VfDialogRootDirective);
  readonly id = input<string | undefined>(undefined);
}

@Directive({
  selector: '[vfDialogDescription]',
  standalone: true,
  host: {
    '[attr.id]': 'id() ?? root.descriptionId() ?? (root.id() + "-description")',
    'data-vf-dialog-description': '',
  },
})
export class VfDialogDescriptionDirective {
  readonly root = inject(VfDialogRootDirective);
  readonly id = input<string | undefined>(undefined);
}

@Directive({
  selector: '[vfDialogBody]',
  standalone: true,
  host: { 'data-vf-dialog-body': '' },
})
export class VfDialogBodyDirective {
  readonly root = inject(VfDialogRootDirective);
}

@Directive({
  selector: 'button[vfDialogClose]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-dialog-close': '',
    '(click)': 'onClick()',
  },
})
export class VfDialogCloseDirective {
  readonly root = inject(VfDialogRootDirective);

  onClick(): void {
    this.root.requestDismiss('close-control');
  }
}
