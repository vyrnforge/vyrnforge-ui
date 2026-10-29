import { Directive, ElementRef, booleanAttribute, computed, effect, inject, input, output, signal, type OnDestroy } from '@angular/core';
import { autoUpdateFloatingPosition, type FloatingPlacement } from '@vyrnforge/web/floating-positioning';
import { createDismissalCoordinator } from '@vyrnforge/web/dismissal-coordination';

@Directive({ selector: '[vfPopoverRoot]', standalone: true })
export class VfPopoverRootDirective {
  readonly open = input<boolean | undefined>(undefined); readonly defaultOpen = input(false, { transform: booleanAttribute }); readonly placement = input<FloatingPlacement>('bottom-start'); readonly openChange = output<boolean>();
  private readonly internal = signal(false); private initialized = false; readonly expanded = computed(() => this.open() ?? (this.initialized ? this.internal() : this.defaultOpen())); anchor: HTMLElement | null = null; content: HTMLElement | null = null;
  setOpen(next: boolean): void { if (next === this.expanded()) return; this.initialized = true; if (this.open() === undefined) this.internal.set(next); this.openChange.emit(next); }
}

@Directive({ selector: 'button[vfPopoverTrigger]', standalone: true, host: { type: 'button', 'data-vf-popover-trigger': '', '[attr.aria-expanded]': 'root.expanded()', '(click)': 'toggle()' } })
export class VfPopoverTriggerDirective {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  constructor(readonly root: VfPopoverRootDirective) { effect(() => { this.root.anchor = this.element.nativeElement; }); }
  toggle(): void { this.root.setOpen(!this.root.expanded()); }
}

@Directive({ selector: '[vfPopoverContent]', standalone: true, host: { role: 'dialog', tabindex: '-1', 'data-vf-popover-content': '', '[attr.data-vf-open]': 'root.expanded() ? "" : null', '[hidden]': '!root.expanded()' } })
export class VfPopoverContentDirective implements OnDestroy {
  private cleanup: (() => void) | null = null;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor(readonly root: VfPopoverRootDirective) { effect(() => { this.cleanup?.(); this.cleanup = null; if (!this.root.expanded()) return; const surface = this.element.nativeElement; this.root.content = surface; queueMicrotask(() => { if (!this.root.anchor || !this.root.expanded()) return; const stopPosition = autoUpdateFloatingPosition(this.root.anchor, surface, { placement: this.root.placement(), offset: 6 }); const coordinator = createDismissalCoordinator(surface.ownerDocument); const unregister = coordinator.register({ element: surface, branches: [this.root.anchor], onDismiss: () => this.root.setOpen(false) }); this.cleanup = () => { unregister(); coordinator.destroy(); stopPosition(); }; }); }); }
  ngOnDestroy(): void { this.cleanup?.(); }
}
