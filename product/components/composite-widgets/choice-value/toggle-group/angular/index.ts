import { Directive, booleanAttribute, computed, input, output, signal } from '@angular/core';

export type ToggleGroupType = 'single' | 'multiple';

function normalize(value: string | string[] | undefined, type: ToggleGroupType): string[] {
  const values = Array.from(new Set((typeof value === 'string' ? [value] : (value ?? [])).filter(Boolean)));
  return type === 'single' ? values.slice(0, 1) : values;
}

function toggled(values: string[], value: string, type: ToggleGroupType): string[] {
  if (type === 'single') return values[0] === value ? [] : [value];
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}

@Directive({
  selector: '[vfToggleGroupRoot]',
  standalone: true,
  host: { role: 'group', 'data-vf-toggle-group-root': '' },
})
export class VfToggleGroupRootDirective {
  readonly type = input<ToggleGroupType>('single');
  readonly value = input<string | string[] | undefined>(undefined);
  readonly defaultValue = input<string | string[] | undefined>(undefined);
  readonly valueChange = output<string | string[]>();
  private internal = signal<string[] | undefined>(undefined);
  readonly values = computed(() => normalize(this.value() ?? this.internal() ?? this.defaultValue(), this.type()));
  toggle(value: string) {
    if (!value) return;
    const next = toggled(this.values(), value, this.type());
    if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(this.type() === 'single' ? (next[0] ?? '') : next);
  }
}

@Directive({
  selector: 'button[vfToggleGroupItem]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-toggle-group-item': '',
    '[attr.data-vf-value]': 'value()',
    '[attr.aria-pressed]': 'root.values().includes(value())',
    '[attr.data-vf-state]': 'root.values().includes(value()) ? "on" : "off"',
    '[disabled]': 'disabled()',
    '(click)': 'toggle($event)',
  },
})
export class VfToggleGroupItemDirective {
  readonly value = input.required<string>({ alias: 'vfToggleGroupItem' });
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly root: VfToggleGroupRootDirective) {}
  toggle(event?: MouseEvent) {
    if (event?.defaultPrevented || this.disabled()) return;
    const button = event?.currentTarget as HTMLButtonElement | undefined;
    if (button?.getAttribute('aria-disabled') === 'true') return;
    this.root.toggle(this.value());
  }
}
