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

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export type DrawerDismissReason = 'escape' | 'backdrop' | 'close-control';
export interface DrawerDismissRequest {
  readonly reason: DrawerDismissReason;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

function createDismissRequest(reason: DrawerDismissReason): DrawerDismissRequest {
  let prevented = false;
  return {
    reason,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.hasAttribute('disabled') && !element.closest('[inert]'));
}

function isBackdropHit(event: MouseEvent | PointerEvent): boolean {
  if (event.target !== event.currentTarget || event.button !== 0) return false;
  const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

@Directive({
  selector: 'dialog[vfDrawerRoot]',
  standalone: true,
  host: {
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'resolvedTitleId()',
    '[attr.aria-describedby]': 'descriptionId() ?? null',
    'data-vf-drawer-root': '',
    'data-vf-dialog-root': '',
    '[attr.data-vf-placement]': 'placement()',
    '[attr.data-vf-open]': 'desiredOpen() ? "" : null',
    '(cancel)': 'onCancel($event)',
    '(close)': 'onClose()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointercancel)': 'onPointerCancel()',
    '(click)': 'onClick($event)',
  },
})
export class VfDrawerRootDirective {
  readonly id = input.required<string>();
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly backdropDismiss = input(false, { transform: booleanAttribute });
  readonly titleId = input<string | undefined>(undefined);
  readonly descriptionId = input<string | undefined>(undefined);
  readonly initialFocus = input<HTMLElement | undefined>(undefined);
  readonly placement = input<DrawerPlacement>('end');
  readonly openChange = output<boolean>();
  readonly dismissRequest = output<DrawerDismissRequest>();

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
      if (typeof document === 'undefined') return;
      const dialog = this.element.nativeElement;
      queueMicrotask(() => this.syncDialog(dialog, this.desiredOpen(), true));
    });
  }

  private syncDialog(dialog: HTMLDialogElement, desiredOpen: boolean, captureRestoreTarget: boolean): void {
    if (!dialog.isConnected) return;
    if (desiredOpen && !dialog.open) {
      if (captureRestoreTarget)
        this.restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      this.initialFocus()?.focus();
    } else if (!desiredOpen && dialog.open) {
      dialog.close();
    }
  }

  private restoreFocus(): void {
    const target = this.restoreTarget;
    this.restoreTarget = null;
    const dialog = this.element.nativeElement;
    const focused = dialog.ownerDocument.activeElement;
    if (canRestoreFocus(target) && (!focused || focused === dialog.ownerDocument.body || dialog.contains(focused))) target.focus();
  }

  requestDismiss(reason: DrawerDismissReason): void {
    const request = createDismissRequest(reason);
    this.dismissRequest.emit(request);
    if (request.defaultPrevented) return;
    if (this.open() === undefined) this.internalOpen.set(false);
    this.openChange.emit(false);
  }

  onCancel(event: Event): void {
    if (event.defaultPrevented) return;
    event.preventDefault();
    this.requestDismiss('escape');
  }

  onClose(): void {
    if (this.element.nativeElement.open) return;
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

  onPointerDown(event: PointerEvent): void {
    this.backdropPointerDown = !event.defaultPrevented && isBackdropHit(event);
  }

  onPointerCancel(): void { this.backdropPointerDown = false; }

  onClick(event: MouseEvent): void {
    const isBackdrop = this.backdropPointerDown && isBackdropHit(event);
    this.backdropPointerDown = false;
    if (!event.defaultPrevented && this.backdropDismiss() && isBackdrop) this.requestDismiss('backdrop');
  }
}

@Directive({
  selector: '[vfDrawerTitle]',
  standalone: true,
  host: { '[attr.id]': 'id() ?? root.resolvedTitleId()', 'data-vf-drawer-title': '', 'data-vf-dialog-title': '' },
})
export class VfDrawerTitleDirective {
  readonly root = inject(VfDrawerRootDirective);
  readonly id = input<string | undefined>(undefined);
}

@Directive({
  selector: '[vfDrawerDescription]',
  standalone: true,
  host: {
    '[attr.id]': 'id() ?? root.descriptionId() ?? (root.id() + "-description")',
    'data-vf-drawer-description': '', 'data-vf-dialog-description': '',
  },
})
export class VfDrawerDescriptionDirective {
  readonly root = inject(VfDrawerRootDirective);
  readonly id = input<string | undefined>(undefined);
}

@Directive({ selector: '[vfDrawerBody]', standalone: true, host: { 'data-vf-drawer-body': '', 'data-vf-dialog-body': '' } })
export class VfDrawerBodyDirective {
  readonly root = inject(VfDrawerRootDirective);
}

@Directive({
  selector: 'button[vfDrawerClose]',
  standalone: true,
  host: { type: 'button', 'data-vf-drawer-close': '', 'data-vf-dialog-close': '', '(click)': '$event.defaultPrevented ? null : root.requestDismiss("close-control")' },
})
export class VfDrawerCloseDirective {
  readonly root = inject(VfDrawerRootDirective);
}
