import {
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  type OnDestroy,
} from '@angular/core';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

type Activity = 'trigger' | 'content' | 'focus';

@Directive({
  selector: '[vfPreviewCardRoot]',
  standalone: true,
  host: { '(document:keydown)': 'dismiss($event)' },
})
export class VfPreviewCardRootDirective implements OnDestroy {
  readonly id = input.required<string>();
  readonly contentId = input<string | undefined>(undefined);
  readonly resolvedContentId = computed(() => this.contentId() ?? `${this.id()}-content`);
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly placement = input<FloatingPlacement>('bottom-start');
  readonly openDelay = input(0);
  readonly closeDelay = input(100);
  readonly openChange = output<boolean>();
  private readonly internal = signal<boolean | undefined>(undefined);
  readonly expanded = computed(() => this.open() ?? this.internal() ?? this.defaultOpen());
  anchor: HTMLElement | null = null;
  content: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly sources = { trigger: false, content: false, focus: false, dismissed: false };

  setOpen(next: boolean): void {
    if (next === this.expanded()) return;
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }

  private cancel(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  activity(source: Activity, active: boolean, delay: number): void {
    this.sources[source] = active;
    this.cancel();
    const present = this.sources.trigger || this.sources.content || this.sources.focus;
    if (!present) this.sources.dismissed = false;
    const next = present && !this.sources.dismissed;
    if (next === this.expanded()) return;
    this.timer = setTimeout(
      () => {
        this.timer = null;
        this.setOpen(next);
      },
      Math.max(0, delay),
    );
  }

  dismiss(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented || !this.expanded()) return;
    this.sources.dismissed = true;
    this.sources.content = false;
    this.cancel();
    this.setOpen(false);
    event.preventDefault();
  }

  ngOnDestroy(): void {
    this.cancel();
  }
}

@Directive({
  selector: '[vfPreviewCardTrigger]',
  standalone: true,
  host: {
    'data-vf-preview-card-trigger': '',
    '[attr.aria-controls]': 'root.resolvedContentId()',
    '[attr.aria-expanded]': 'root.expanded()',
    '(pointerenter)': 'pointer($event, true)',
    '(pointerleave)': 'pointer($event, false)',
    '(focusin)': 'root.activity("focus", true, 0)',
    '(focusout)': 'blur($event)',
  },
})
export class VfPreviewCardTriggerDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor(readonly root: VfPreviewCardRootDirective) {
    this.root.anchor = this.element.nativeElement;
  }
  pointer(event: PointerEvent, active: boolean): void {
    if (event.pointerType === 'touch' || (active && event.defaultPrevented)) return;
    this.root.activity('trigger', active, active ? this.root.openDelay() : this.root.closeDelay());
  }
  blur(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null) && !this.root.content?.contains(event.relatedTarget as Node | null)) {
      this.root.activity('focus', false, this.root.closeDelay());
    }
  }
  schedule(value: boolean, delay: number): void {
    this.root.activity('trigger', value, delay);
  }
  ngOnDestroy(): void {
    if (this.root.anchor === this.element.nativeElement) this.root.anchor = null;
  }
}

@Directive({
  selector: '[vfPreviewCardContent]',
  standalone: true,
  host: {
    popover: 'manual',
    'data-vf-preview-card-content': '',
    '[attr.id]': 'root.resolvedContentId()',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
    '[attr.data-vf-placement]': 'root.placement()',
    '(pointerenter)': 'pointer($event, true)',
    '(pointerleave)': 'pointer($event, false)',
    '(focusin)': 'root.activity("focus", true, 0)',
    '(focusout)': 'blur($event)',
  },
})
export class VfPreviewCardContentDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor(readonly root: VfPreviewCardRootDirective) {
    this.root.content = this.element.nativeElement;
    afterRenderEffect(() => {
      const open = this.root.expanded();
      const trigger = this.root.anchor;
      const surface = this.element.nativeElement;
      if (!trigger) return;
      if (open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      if (!open && surface.matches(':popover-open')) {
        if (surface.contains(surface.ownerDocument.activeElement)) trigger.focus();
        surface.hidePopover();
      }
    });
  }
  pointer(event: PointerEvent, active: boolean): void {
    if (event.pointerType === 'touch' || (active && event.defaultPrevented)) return;
    this.root.activity('content', active, active ? 0 : this.root.closeDelay());
  }
  blur(event: FocusEvent): void {
    const related = event.relatedTarget as Node | null;
    if (!this.element.nativeElement.contains(related) && !this.root.anchor?.contains(related)) {
      this.root.activity('focus', false, this.root.closeDelay());
    }
  }
  ngOnDestroy(): void {
    if (this.root.content === this.element.nativeElement) this.root.content = null;
  }
}
