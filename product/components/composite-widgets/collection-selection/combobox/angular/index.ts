import {
  APP_ID,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

const COMBOBOX_ID_GENERATOR = new InjectionToken<() => string>('VyrnForge Combobox ID generator', {
  providedIn: 'root',
  factory: () => {
    const appId = inject(APP_ID);
    let nextId = 0;
    return () => `vf-combobox-${appId}-${nextId++}`;
  },
});

const optionSelector = '[data-vf-combobox-option]';
function normalizeFilterText(value: string, locale?: string): string {
  return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase();
}
function visibleOptions(root: HTMLElement, query = '', locale?: string): HTMLElement[] {
  const normalizedQuery = normalizeFilterText(query, locale);
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => {
    if (option.closest('[data-vf-combobox-root]') !== root) return false;
    if (!normalizedQuery) return true;
    return normalizeFilterText(option.dataset.vfTextValue ?? option.textContent ?? '', locale).includes(
      normalizedQuery,
    );
  });
}
function inputUnavailable(input: HTMLInputElement | null): boolean {
  return !input || input.readOnly || input.matches(':disabled');
}
function disabled(option: HTMLElement): boolean {
  return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled');
}

@Directive({
  selector: '[vfComboboxRoot]',
  standalone: true,
  host: {
    '[attr.id]': 'rootId()',
    'data-vf-combobox-root': '',
  },
})
export class VfComboboxRootDirective {
  readonly id = input<string | undefined>(undefined);
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly locale = input<string | undefined>(undefined);
  readonly valueChange = output<string>();
  private readonly internalValue = signal<string | undefined>(undefined);
  private readonly generatedId = inject(COMBOBOX_ID_GENERATOR)();
  readonly rootId = computed(() => this.id() ?? this.generatedId);
  readonly inputId = computed(() => `${this.rootId()}-input`);
  readonly listboxId = computed(() => `${this.rootId()}-listbox`);
  readonly selected = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());
  readonly query = signal('');
  readonly open = signal(false);
  readonly activeId = signal<string | null>(null);
  private optionIndex = 0;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  nextOptionId() {
    return `${this.listboxId()}-option-${++this.optionIndex}`;
  }
  setOpen(value: boolean) {
    value = value && !inputUnavailable(this.ownedInput());
    this.open.set(value);
    if (!value) this.activeId.set(null);
  }
  setQuery(value: string) {
    if (inputUnavailable(this.ownedInput())) {
      this.setOpen(false);
      return;
    }
    this.query.set(value);
    this.activeId.set(null);
    this.setOpen(true);
  }
  setValue(value: string) {
    if (inputUnavailable(this.ownedInput())) {
      this.setOpen(false);
      return;
    }
    if (this.value() === undefined) this.internalValue.set(value);
    this.query.set(value);
    this.activeId.set(null);
    this.valueChange.emit(value);
    this.focusInput();
    this.open.set(false);
  }
  private ownedInput() {
    const root = this.element.nativeElement;
    return (
      Array.from(root.querySelectorAll<HTMLInputElement>('[data-vf-combobox-input]')).find(
        (input) => input.closest('[data-vf-combobox-root]') === root,
      ) ?? null
    );
  }
  focusInput() {
    this.ownedInput()?.focus();
  }
  moveActive(intent: Extract<CollectionNavigationIntent, 'next' | 'previous'>) {
    const options = visibleOptions(this.element.nativeElement, this.query(), this.locale());
    const current = options.findIndex((option) => option.id === this.activeId());
    const start = current >= 0 ? current : intent === 'previous' ? options.length : -1;
    const next = resolveNavigationIndex(
      options.map((option) => ({ eligible: !disabled(option) })),
      start,
      intent,
      { loop: false },
    );
    if (next == null) return;
    const target = options[next];
    if (!target?.id) return;
    this.activeId.set(target.id);
  }
  activateActive() {
    const id = this.activeId();
    if (!id) return false;
    const target = visibleOptions(this.element.nativeElement, this.query(), this.locale()).find(
      (option) => option.id === id && !disabled(option),
    );
    if (!target) return false;
    target.click();
    return true;
  }
}

@Directive({
  selector: 'input[vfComboboxInput]',
  standalone: true,
  host: {
    role: 'combobox',
    'aria-autocomplete': 'list',
    'data-vf-combobox-input': '',
    '[id]': 'root.inputId()',
    '[value]': 'root.query()',
    '[attr.aria-expanded]': 'root.open()',
    '[attr.aria-controls]': 'root.listboxId()',
    '[attr.aria-activedescendant]': 'root.activeId()',
    '(input)': 'onInput($event)',
    '(focus)': 'root.setOpen(true)',
    '(compositionstart)': 'onCompositionStart()',
    '(compositionend)': 'onCompositionEnd()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfComboboxInputDirective {
  private composing = false;
  constructor(readonly root: VfComboboxRootDirective) {
    const element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    const onBlur = (event: FocusEvent) => {
      if (
        !event.defaultPrevented &&
        !(
          event.relatedTarget instanceof Element &&
          event.relatedTarget.closest('[data-vf-combobox-content]')?.closest('[data-vf-combobox-root]') ===
            element.closest('[data-vf-combobox-root]')
        )
      )
        root.setOpen(false);
    };
    element.addEventListener('blur', onBlur);
    inject(DestroyRef).onDestroy(() => element.removeEventListener('blur', onBlur));
  }
  onInput(event: Event) {
    if (!event.defaultPrevented) this.root.setQuery((event.target as HTMLInputElement).value);
  }
  onCompositionStart() {
    this.composing = true;
  }
  onCompositionEnd() {
    this.composing = false;
  }
  onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (inputUnavailable(event.currentTarget as HTMLInputElement)) {
      this.root.setOpen(false);
      return;
    }
    if (this.composing || event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.root.setOpen(true);
      this.root.moveActive(event.key === 'ArrowDown' ? 'next' : 'previous');
      return;
    }
    if (event.key === 'Enter' && this.root.open()) {
      if (this.root.activateActive()) event.preventDefault();
      return;
    }
    if (event.key === 'Tab' && this.root.open()) this.root.setOpen(false);
    if (event.key === 'Escape' && this.root.open()) {
      event.preventDefault();
      this.root.setOpen(false);
    }
  }
}

@Directive({
  selector: '[vfComboboxContent]',
  standalone: true,
  host: {
    role: 'listbox',
    'data-vf-combobox-content': '',
    '[id]': 'root.listboxId()',
    '[attr.aria-labelledby]': 'root.inputId()',
    popover: 'auto',
    '[attr.data-vf-open]': 'root.open() ? "" : null',
  },
})
export class VfComboboxContentDirective {
  constructor(readonly root: VfComboboxRootDirective) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterRenderEffect(() => {
      const open = root.open();
      const activeId = root.activeId();
      const container = element.closest('[data-vf-combobox-root]');
      const input = Array.from(container?.querySelectorAll<HTMLElement>('[data-vf-combobox-input]') ?? []).find(
        (candidate) => candidate.closest('[data-vf-combobox-root]') === container,
      );
      if (!input) return;
      if (open && !element.matches(':popover-open')) element.showPopover({ source: input });
      if (!open && element.matches(':popover-open')) element.hidePopover();
      if (open && activeId)
        Array.from(element.querySelectorAll<HTMLElement>(optionSelector))
          .find((option) => option.id === activeId)
          ?.scrollIntoView({ block: 'nearest' });
    });
    const onToggle = (event: Event) => {
      if (event.target !== element) return;
      const actual = element.matches(':popover-open');
      if (actual !== root.open()) root.setOpen(actual);
    };
    element.addEventListener('toggle', onToggle);
    destroyRef.onDestroy(() => element.removeEventListener('toggle', onToggle));
  }
}

@Directive({
  selector: 'button[vfComboboxOption]',
  standalone: true,
  host: {
    type: 'button',
    role: 'option',
    tabindex: '-1',
    'data-vf-combobox-option': '',
    '[id]': 'optionId',
    '[disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-selected]': 'root.activeId() ? root.activeId() === optionId : root.selected() === value()',
    '[hidden]': 'hidden()',
    '[attr.data-vf-text-value]': 'textValue() || value()',
    '(click)': 'select($event)',
  },
})
export class VfComboboxOptionDirective {
  readonly value = input.required<string>({ alias: 'vfComboboxOption' });
  readonly textValue = input('');
  readonly disabled = input(false);
  readonly optionId: string;
  constructor(
    readonly root: VfComboboxRootDirective,
    element: ElementRef<HTMLElement>,
  ) {
    this.optionId = element.nativeElement.id || root.nextOptionId();
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) event.preventDefault();
    };
    element.nativeElement.addEventListener('mousedown', onMouseDown);
    inject(DestroyRef).onDestroy(() => element.nativeElement.removeEventListener('mousedown', onMouseDown));
  }
  readonly hidden = computed(
    () =>
      !!this.root.query() &&
      !normalizeFilterText(this.textValue() || this.value(), this.root.locale()).includes(
        normalizeFilterText(this.root.query(), this.root.locale()),
      ),
  );
  select(event: MouseEvent) {
    if (!event.defaultPrevented && !this.disabled() && !this.hidden()) this.root.setValue(this.value());
  }
}
