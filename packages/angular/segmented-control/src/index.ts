import { Directive, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { navigationIntentForArrow, resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';

const itemSelector = '[data-vf-segmented-control-item]';

function itemsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(itemSelector));
}

function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}

function itemDisabled(item: HTMLButtonElement): boolean {
  return item.disabled || item.getAttribute('aria-disabled') === 'true';
}

function intentForKey(key: string, direction: 'ltr' | 'rtl') {
  const arrow = key === 'ArrowLeft' ? 'left'
    : key === 'ArrowRight' ? 'right'
      : key === 'ArrowUp' ? 'up'
        : key === 'ArrowDown' ? 'down'
          : null;
  if (!arrow) return null;
  return navigationIntentForArrow(
    arrow,
    arrow === 'left' || arrow === 'right' ? 'horizontal' : 'vertical',
    direction,
  );
}

@Directive({
  selector: '[vfSegmentedControlRoot]',
  standalone: true,
  host: {
    role: 'radiogroup',
    'data-vf-segmented-control-root': '',
  },
})
export class VfSegmentedControlRootDirective {
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly valueChange = output<string>();
  private iv = signal<string | undefined>(undefined);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly selected = computed(() => this.value() ?? this.iv() ?? this.defaultValue());

  set(v: string): void {
    if (this.value() === undefined) this.iv.set(v);
    this.valueChange.emit(v);
  }

  @HostListener('keydown', ['$event'])
  private onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const root = this.element.nativeElement;
    const currentItem = itemFromTarget(root, event.target);
    if (!currentItem) return;
    const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    const intent = intentForKey(event.key, direction);
    if (!intent) return;
    const items = itemsFor(root);
    const current = items.indexOf(currentItem);
    const next = resolveEnabledIndex(
      items.map((item) => ({ disabled: itemDisabled(item) })),
      current,
      intent,
    );
    if (next == null) return;
    event.preventDefault();
    const candidate = items[next];
    if (!candidate) return;
    candidate.focus();
    this.set(candidate.dataset.vfValue ?? '');
  }
}

@Directive({
  selector: 'button[vfSegmentedControlItem]',
  standalone: true,
  host: {
    type: 'button',
    role: 'radio',
    'data-vf-segmented-control-item': '',
    '[attr.data-vf-value]': 'value()',
    '[attr.aria-checked]': 'root.selected() === value()',
    '[attr.tabindex]': "disabled() ? -1 : root.selected() ? (root.selected() === value() ? 0 : -1) : null",
    '[disabled]': 'disabled()',
    '(click)': 'select()',
  },
})
export class VfSegmentedControlItemDirective {
  readonly value = input.required<string>({ alias: 'vfSegmentedControlItem' });
  readonly disabled = input(false);
  constructor(readonly root: VfSegmentedControlRootDirective) {}
  select(): void {
    if (!this.disabled()) this.root.set(this.value());
  }
}
