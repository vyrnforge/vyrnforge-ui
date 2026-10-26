import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  type OnDestroy,
} from '@angular/core';

const DEFAULT_DURATION = 5000;
type PauseReason = 'pointer' | 'focus';
function normalizedDuration(duration: number): number | null { return Number.isFinite(duration) && duration > 0 ? duration : null; }

@Directive({
  selector: '[vfToastViewport]',
  standalone: true,
  host: {
    'aria-live': 'polite',
    'aria-relevant': 'additions text',
    'data-vf-toast-viewport': '',
  },
})
export class VfToastViewportDirective {}

@Directive({
  selector: '[vfToastRoot]',
  standalone: true,
  host: {
    role: 'status',
    'data-vf-toast-root': '',
    '[attr.data-vf-open]': 'committedOpen() ? "" : null',
    '[hidden]': '!committedOpen()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class VfToastRootDirective implements OnDestroy {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(true, { transform: booleanAttribute });
  readonly duration = input(DEFAULT_DURATION, { transform: numberAttribute });
  readonly openChange = output<boolean>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly internalOpen = signal(true);
  private initialized = false;
  private destroyed = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private deadline = 0;
  private remaining = 0;
  private timeoutRequested = false;
  private wasOpen = false;
  private readonly pauseReasons = new Set<PauseReason>();

  readonly committedOpen = computed(() => this.open() ?? (this.initialized ? this.internalOpen() : this.defaultOpen()));

  constructor() {
    effect(() => {
      const controlledOpen = this.open();
      const defaultOpen = this.defaultOpen();
      if (!this.initialized) {
        this.initialized = true;
        if (controlledOpen === undefined) this.internalOpen.set(defaultOpen);
      }

      const open = controlledOpen ?? this.internalOpen();
      const duration = this.duration();
      if (typeof window === 'undefined') return;
      queueMicrotask(() => { if (!this.destroyed) this.syncTimer(open, duration); });
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearTimer();
  }

  requestClose(): void {
    if (this.open() === undefined) this.internalOpen.set(false);
    this.openChange.emit(false);
  }

  onPointerEnter(): void { this.pause('pointer'); }
  onPointerLeave(): void { this.resume('pointer'); }
  onFocusIn(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.pause('focus');
  }
  onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.resume('focus');
  }

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private expire(): void {
    this.clearTimer();
    this.remaining = 0;
    if (this.timeoutRequested) return;
    this.timeoutRequested = true;
    this.requestClose();
  }

  private syncTimer(open: boolean, duration: number): void {
    this.clearTimer();
    if (!open) {
      this.wasOpen = false;
      this.timeoutRequested = false;
      this.remaining = 0;
      this.pauseReasons.clear();
      return;
    }
    if (!this.wasOpen) {
      this.wasOpen = true;
      this.timeoutRequested = false;
      this.pauseReasons.clear();
    }
    if (this.timeoutRequested) return;
    const nextDuration = normalizedDuration(duration);
    this.remaining = nextDuration ?? 0;
    if (nextDuration !== null && this.pauseReasons.size === 0) this.armRemaining();
  }

  private armRemaining(): void {
    if (this.destroyed || !this.committedOpen() || this.timeoutRequested || this.pauseReasons.size > 0) return;
    if (this.remaining <= 0) { this.expire(); return; }
    this.clearTimer();
    this.deadline = Date.now() + this.remaining;
    this.timer = setTimeout(() => this.expire(), this.remaining);
  }

  private pause(reason: PauseReason): void {
    if (this.pauseReasons.has(reason)) return;
    const running = this.pauseReasons.size === 0 && this.timer !== undefined;
    this.pauseReasons.add(reason);
    if (!running) return;
    this.remaining = Math.max(0, this.deadline - Date.now());
    this.clearTimer();
  }

  private resume(reason: PauseReason): void {
    if (!this.pauseReasons.delete(reason) || this.pauseReasons.size > 0) return;
    this.armRemaining();
  }
}

@Directive({ selector: '[vfToastTitle]', standalone: true, host: { 'data-vf-toast-title': '' } })
export class VfToastTitleDirective {}

@Directive({ selector: '[vfToastDescription]', standalone: true, host: { 'data-vf-toast-description': '' } })
export class VfToastDescriptionDirective {}

@Directive({
  selector: 'button[vfToastClose]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-toast-close': '',
    '(click)': 'onClick($event)',
  },
})
export class VfToastCloseDirective {
  readonly root = inject(VfToastRootDirective);

  onClick(event: MouseEvent): void {
    queueMicrotask(() => {
      if (!event.defaultPrevented) this.root.requestClose();
    });
  }
}
