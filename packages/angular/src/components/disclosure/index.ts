import { Directive, booleanAttribute, computed, input, output, signal } from '@angular/core';

@Directive({
  selector: '[vfDisclosureRoot]',
  standalone: true,
  host: {
    '[attr.id]': 'id()',
    'data-vf-disclosure-root': '',
    '[attr.data-vf-open]': 'expanded() ? "" : null',
    '[attr.data-vf-disabled]': 'disabled() ? "" : null',
  },
})
export class VfDisclosureRootDirective {
  readonly id = input.required<string>();
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  private readonly internalOpen = signal(false);
  private initialized = false;
  readonly expanded = computed(() => this.open() ?? (this.initialized ? this.internalOpen() : this.defaultOpen()));

  setOpen(next: boolean): void {
    if (this.disabled() || next === this.expanded()) return;
    this.initialized = true;
    if (this.open() === undefined) this.internalOpen.set(next);
    this.openChange.emit(next);
  }
}

@Directive({
  selector: 'button[vfDisclosureTrigger]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-disclosure-trigger': '',
    '[attr.aria-expanded]': 'root.expanded()',
    '[attr.aria-controls]': 'root.id() + "-panel"',
    '[disabled]': 'root.disabled()',
    '(click)': 'toggle()',
  },
})
export class VfDisclosureTriggerDirective {
  constructor(readonly root: VfDisclosureRootDirective) {}
  toggle(): void { this.root.setOpen(!this.root.expanded()); }
}

@Directive({
  selector: '[vfDisclosurePanel]',
  standalone: true,
  host: {
    'data-vf-disclosure-panel': '',
    '[attr.id]': 'id() ?? (root.id() + "-panel")',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
    '[hidden]': '!root.expanded()',
  },
})
export class VfDisclosurePanelDirective {
  readonly id = input<string | undefined>(undefined);
  constructor(readonly root: VfDisclosureRootDirective) {}
}
