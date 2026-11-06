import { Directive, ElementRef, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type AccordionType = 'single' | 'multiple';
export type AccordionValue = string | readonly string[];
function normalize(value: AccordionValue | undefined, type: AccordionType): string[] { if (value === undefined) return []; if (typeof value === 'string') return value ? [value] : []; return type === 'single' ? value.slice(0, 1) : [...value]; }
function token(value: string): string { return encodeURIComponent(value).replaceAll('%', '_'); }

@Directive({ selector: '[vfAccordionRoot]', standalone: true, host: { '[attr.id]': 'id()', 'data-vf-accordion-root': '', '[attr.data-vf-type]': 'type()' } })
export class VfAccordionRootDirective {
  readonly id = input.required<string>();
  readonly type = input<AccordionType>('single');
  readonly value = input<AccordionValue | undefined>(undefined);
  readonly defaultValue = input<AccordionValue | undefined>(undefined);
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly valueChange = output<AccordionValue>();
  private readonly internal = signal<string[]>([]);
  private initialized = false;
  readonly values = computed(() => this.value() === undefined ? (this.initialized ? this.internal() : normalize(this.defaultValue(), this.type())) : normalize(this.value(), this.type()));

  toggle(itemValue: string): void {
    const current = this.values(); const isOpen = current.includes(itemValue); let next: string[];
    if (this.type() === 'single') next = isOpen ? (this.collapsible() ? [] : [...current]) : [itemValue];
    else next = isOpen ? current.filter((candidate) => candidate !== itemValue) : [...current, itemValue];
    if (next.length === current.length && next.every((candidate, index) => candidate === current[index])) return;
    this.initialized = true; if (this.value() === undefined) this.internal.set(next);
    this.valueChange.emit(this.type() === 'single' ? (next[0] ?? '') : next);
  }
}

@Directive({ selector: '[vfAccordionItem]', standalone: true, host: { 'data-vf-accordion-item': '', '[attr.data-vf-open]': 'open() ? "" : null', '[attr.data-vf-disabled]': 'disabled() ? "" : null' } })
export class VfAccordionItemDirective {
  readonly value = input.required<string>({ alias: 'vfAccordionItem' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly open = computed(() => this.root.values().includes(this.value()));
  constructor(readonly root: VfAccordionRootDirective) {}
  triggerId(): string { return `${this.root.id()}-trigger-${token(this.value())}`; }
  panelId(): string { return `${this.root.id()}-panel-${token(this.value())}`; }
}

@Directive({ selector: '[vfAccordionHeader]', standalone: true, host: { 'data-vf-accordion-header': '' } })
export class VfAccordionHeaderDirective { constructor(readonly item: VfAccordionItemDirective) {} }

@Directive({ selector: 'button[vfAccordionTrigger]', standalone: true, host: { type: 'button', 'data-vf-accordion-trigger': '', '[attr.id]': 'item.triggerId()', '[attr.aria-expanded]': 'item.open()', '[attr.aria-controls]': 'item.panelId()', '[disabled]': 'item.disabled()', '(click)': 'toggle()', '(keydown)': 'onKeydown($event)' } })
export class VfAccordionTriggerDirective {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  constructor(readonly item: VfAccordionItemDirective) {}
  toggle(): void { if (!this.item.disabled()) this.item.root.toggle(this.item.value()); }
  onKeydown(event: KeyboardEvent): void {
    let intent: CollectionNavigationIntent | null = null; if (event.key === 'ArrowDown') intent = 'next'; else if (event.key === 'ArrowUp') intent = 'previous'; else if (event.key === 'Home') intent = 'first'; else if (event.key === 'End') intent = 'last'; if (!intent) return;
    const root = this.element.nativeElement.closest<HTMLElement>('[data-vf-accordion-root]'); if (!root) return;
    const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-vf-accordion-trigger]')); const current = triggers.indexOf(this.element.nativeElement); const next = resolveEnabledIndex(triggers.map((candidate) => ({ disabled: candidate.disabled })), current, intent); if (next === null) return; event.preventDefault(); triggers[next]?.focus();
  }
}

@Directive({ selector: '[vfAccordionPanel]', standalone: true, host: { role: 'region', 'data-vf-accordion-panel': '', '[attr.id]': 'item.panelId()', '[attr.aria-labelledby]': 'item.triggerId()', '[attr.data-vf-open]': 'item.open() ? "" : null', '[hidden]': '!item.open()' } })
export class VfAccordionPanelDirective { constructor(readonly item: VfAccordionItemDirective) {} }
