import {
  DestroyRef,
  ElementRef,
  Directive,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

function normalizeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

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
    'data-vf-toast-root': '',
    '[hidden]': '!desiredOpen()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class VfToastRootDirective {
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(true, { transform: booleanAttribute });
  readonly duration = input(5000, { transform: numberAttribute });
  readonly openChange = output<boolean>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly internalOpen = signal(true);
  private initialized = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private deadline = 0;
  private remaining = 5000;
  private readonly pauseReasons = new Set<'pointer' | 'focus'>();
  private timeoutRequested = false;
  private previousOpen = false;
  private previousDuration = -1;

  readonly desiredOpen = computed(() => this.open() ?? (this.initialized ? this.internalOpen() : this.defaultOpen()));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
    effect(() => {
      const controlledOpen = this.open();
      const defaultOpen = this.defaultOpen();
      if (!this.initialized) {
        this.initialized = true;
        if (controlledOpen === undefined) this.internalOpen.set(defaultOpen);
      }

      const desiredOpen = controlledOpen ?? this.internalOpen();
      const duration = normalizeDuration(this.duration());
      if (typeof window === 'undefined') return;
      this.syncTimer(desiredOpen, duration);
    });
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.deadline = 0;
  }

  private armTimer(delay: number): void {
    this.clearTimer();
    if (delay <= 0 || this.timeoutRequested || this.pauseReasons.size > 0) return;
    this.remaining = delay;
    this.deadline = Date.now() + delay;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.deadline = 0;
      this.remaining = 0;
      this.timeoutRequested = true;
      this.requestClose();
    }, delay);
  }

  private syncTimer(open: boolean, duration: number): void {
    const opening = open && !this.previousOpen;
    const durationChanged = duration !== this.previousDuration;
    this.previousOpen = open;
    this.previousDuration = duration;

    if (!open) {
      this.clearTimer();
      this.remaining = duration;
      this.timeoutRequested = false;
      this.pauseReasons.clear();
      return;
    }

    if (opening) this.timeoutRequested = false;
    if (opening || durationChanged) {
      this.clearTimer();
      this.remaining = duration;
      if (!this.timeoutRequested && this.pauseReasons.size === 0) this.armTimer(duration);
    }
  }

  private pauseTimer(reason: 'pointer' | 'focus'): void {
    if (!this.desiredOpen() || this.timeoutRequested || this.pauseReasons.has(reason)) return;
    const wasActive = this.pauseReasons.size === 0;
    this.pauseReasons.add(reason);
    if (wasActive && this.timer !== null) {
      this.remaining = Math.max(0, this.deadline - Date.now());
      this.clearTimer();
    }
  }

  private resumeTimer(reason: 'pointer' | 'focus'): void {
    this.pauseReasons.delete(reason);
    if (this.pauseReasons.size > 0 || !this.desiredOpen() || this.timeoutRequested) return;
    if (this.remaining <= 0) {
      this.timeoutRequested = true;
      this.requestClose();
      return;
    }
    this.armTimer(this.remaining);
  }

  requestClose(): void {
    if (this.open() === undefined) this.internalOpen.set(false);
    this.openChange.emit(false);
  }

  onPointerEnter(): void {
    this.pauseTimer('pointer');
  }

  onPointerLeave(): void {
    this.resumeTimer('pointer');
  }

  onFocusIn(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.pauseTimer('focus');
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.resumeTimer('focus');
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
    if (!event.defaultPrevented) this.root.requestClose();
  }
}
