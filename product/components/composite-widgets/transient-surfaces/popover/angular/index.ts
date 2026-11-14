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

@Directive({ selector: '[vfPopoverRoot]', standalone: true })
export class VfPopoverRootDirective {
  readonly id = input.required<string>();
  readonly contentId = input<string | undefined>(undefined);
  readonly contentRole = input<'dialog' | 'region'>('dialog');
  readonly resolvedContentId = computed(() => this.contentId() ?? `${this.id()}-content`);
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly placement = input<FloatingPlacement>('bottom-start');
  readonly openChange = output<boolean>();
  private readonly internal = signal<boolean | undefined>(undefined);
  readonly expanded = computed(() => this.open() ?? this.internal() ?? this.defaultOpen());
  anchor: HTMLElement | null = null;
  content: HTMLElement | null = null;
  setOpen(next: boolean): void {
    if (next === this.expanded()) return;
    if (this.open() === undefined) this.internal.set(next);
    this.openChange.emit(next);
  }
}

@Directive({
  selector: 'button[vfPopoverTrigger]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-popover-trigger': '',
    '[attr.popovertarget]': 'root.resolvedContentId()',
    '[attr.aria-haspopup]': 'root.contentRole() === "dialog" ? "dialog" : null',
    '[attr.aria-controls]': 'root.resolvedContentId()',
    '[attr.aria-expanded]': 'root.expanded()',
    '(click)': 'toggle($event)',
  },
})
export class VfPopoverTriggerDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  constructor(readonly root: VfPopoverRootDirective) {
    this.root.anchor = this.element.nativeElement;
  }
  toggle(event?: MouseEvent): void {
    if (event?.defaultPrevented || this.element.nativeElement.disabled) return;
    event?.preventDefault();
    this.root.setOpen(!this.root.expanded());
  }
  ngOnDestroy(): void {
    if (this.root.anchor === this.element.nativeElement) this.root.anchor = null;
  }
}

@Directive({
  selector: '[vfPopoverContent]',
  standalone: true,
  host: {
    popover: 'auto',
    'data-vf-popover-content': '',
    '[attr.id]': 'root.resolvedContentId()',
    '[attr.role]': 'root.contentRole()',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
    '[attr.data-vf-placement]': 'root.placement()',
    '(toggle)': 'onToggle($event)',
  },
})
export class VfPopoverContentDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly nativeRevision = signal(0);
  constructor(readonly root: VfPopoverRootDirective) {
    this.root.content = this.element.nativeElement;
    afterRenderEffect(() => {
      this.nativeRevision();
      const open = this.root.expanded();
      const surface = this.element.nativeElement;
      const trigger = this.root.anchor;
      if (!trigger) return;
      if (open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      if (!open && surface.matches(':popover-open')) surface.hidePopover();
    });
  }
  onToggle(event: Event): void {
    if (event.target !== this.element.nativeElement) return;
    const actual = this.element.nativeElement.matches(':popover-open');
    if (actual === this.root.expanded()) return;
    this.root.setOpen(actual);
    this.nativeRevision.update((revision) => revision + 1);
  }
  ngOnDestroy(): void {
    if (this.root.content === this.element.nativeElement) this.root.content = null;
  }
}
