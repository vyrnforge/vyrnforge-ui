import { Directive, ElementRef, afterNextRender, computed, inject, input, output, signal, type OnDestroy } from '@angular/core';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { toggleSelection } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

export type ListboxSelectionMode = 'single' | 'multiple';
export type ListboxValue = string | string[];

const optionSelector = '[data-vf-listbox-option]';
function normalize(value: ListboxValue | undefined): string[] { return value === undefined ? [] : typeof value === 'string' ? (value ? [value] : []) : value; }
function optionsFor(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)); }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true'; }
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const element = target instanceof HTMLElement ? target.closest<HTMLElement>(optionSelector) : null; return element && root.contains(element) ? element : null; }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null) {
  const options = optionsFor(root);
  const states = options.map((option) => ({ disabled: disabled(option) }));
  let activeIndex = preferred ? options.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) {
    const focused = typeof document === 'undefined' ? null : optionFromTarget(root, document.activeElement);
    activeIndex = focused ? options.indexOf(focused) : -1;
  }
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
  if (activeIndex < 0) activeIndex = states.findIndex((option) => !option.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  options.forEach((option, index) => { option.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}

@Directive({
  selector: '[vfListboxRoot]',
  standalone: true,
  host: {
    role: 'listbox',
    'data-vf-listbox-root': '',
    '[attr.tabindex]': 'null',
    '[attr.aria-multiselectable]': 'selectionMode()==="multiple"?true:null',
    '(focusin)': 'onFocusIn($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfListboxRootDirective implements OnDestroy {
  readonly selectionMode = input<ListboxSelectionMode>('single');
  readonly value = input<ListboxValue | undefined>(undefined);
  readonly defaultValue = input<ListboxValue | undefined>(undefined);
  readonly valueChange = output<ListboxValue>();
  private readonly internal = signal<string[]>([]);
  private readonly interacted = signal(false);
  readonly values = computed(() => this.value() !== undefined ? normalize(this.value()) : this.interacted() ? this.internal() : normalize(this.defaultValue()));
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private observer: MutationObserver | null = null;
  private readonly renderRef = afterNextRender(() => {
    const root = this.element.nativeElement;
    syncTabStops(root);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => syncTabStops(root));
      this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-disabled', 'aria-selected', 'data-vf-listbox-option'] });
    }
  });

  ngOnDestroy() { this.renderRef.destroy(); this.observer?.disconnect(); if (this.timer) clearTimeout(this.timer); }

  select(candidate: string) {
    const next = this.selectionMode() === 'single' ? [candidate] : toggleSelection(this.values(), candidate);
    if (this.value() === undefined) { this.interacted.set(true); this.internal.set(next); }
    this.valueChange.emit(this.selectionMode() === 'single' ? (next[0] ?? '') : next);
  }

  onFocusIn(event: FocusEvent) {
    const root = this.element.nativeElement;
    const option = optionFromTarget(root, event.target);
    if (option && !disabled(option)) syncTabStops(root, option);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const root = this.element.nativeElement;
    const options = optionsFor(root);
    const currentOption = optionFromTarget(root, event.target);
    const current = currentOption ? options.indexOf(currentOption) : -1;
    let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
    if (event.key === 'ArrowDown') intent = 'next';
    else if (event.key === 'ArrowUp') intent = 'previous';
    else if (event.key === 'Home') intent = 'first';
    else if (event.key === 'End') intent = 'last';
    let next: number | null = null;
    if (intent) next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), current, intent);
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.query = ''; }, 500);
      next = findTypeaheadMatch(options.map((option) => ({ textValue: option.textContent ?? '', disabled: disabled(option) })), this.query, { startIndex: current });
    }
    if (next == null) return;
    const target = options[next];
    if (!target) return;
    event.preventDefault();
    syncTabStops(root, target);
    target.focus();
  }
}

@Directive({
  selector: '[vfListboxOption]',
  standalone: true,
  host: {
    role: 'option',
    tabindex: '0',
    'data-vf-listbox-option': '',
    '[attr.aria-selected]': 'root.values().includes(value())',
    '[attr.aria-disabled]': 'disabled()||null',
    '(click)': 'selectFromPointer($event)',
    '(keydown.enter)': 'selectFromKeyboard($event)',
    '(keydown.space)': 'selectFromKeyboard($event)',
  },
})
export class VfListboxOptionDirective {
  readonly value = input.required<string>({ alias: 'vfListboxOption' });
  readonly disabled = input(false);
  constructor(readonly root: VfListboxRootDirective, private readonly element: ElementRef<HTMLElement>) {}
  selectFromPointer(event: MouseEvent) { if (!this.disabled() && !event.defaultPrevented) { this.element.nativeElement.focus(); this.root.select(this.value()); } }
  selectFromKeyboard(event: KeyboardEvent) { if (!this.disabled() && !event.defaultPrevented) { event.preventDefault(); this.root.select(this.value()); } }
}
