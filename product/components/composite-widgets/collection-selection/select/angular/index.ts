import {
  APP_ID,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  afterRenderEffect,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  type WritableSignal,
  viewChild,
} from '@angular/core';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const SELECT_ID_GENERATOR = new InjectionToken<() => string>('VyrnForge Select ID generator', {
  providedIn: 'root',
  factory: () => {
    const appId = inject(APP_ID);
    let nextId = 0;
    return () => `vf-select-${appId}-${nextId++}`;
  },
});

const optionSelector = '[data-vf-select-option]';
type FocusRequest = 'first' | 'last' | 'next' | 'previous';
interface SelectDomState {
  anchor: HTMLButtonElement | null;
  surface: HTMLElement | null;
  focusRequests: FocusRequest[];
  focusRevision: WritableSignal<number>;
}
const selectDom = new WeakMap<VfSelectRootDirective, SelectDomState>();

function domFor(root: VfSelectRootDirective): SelectDomState {
  let state = selectDom.get(root);
  if (!state) {
    state = { anchor: null, surface: null, focusRequests: [], focusRevision: signal(0) };
    selectDom.set(root, state);
  }
  return state;
}
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector)).filter(
    (option) => option.closest('[data-vf-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && option.closest('[data-vf-select-content]') === root ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.matches(':disabled,[aria-disabled="true"]');
}
function flushFocusRequests(root: VfSelectRootDirective): void {
  const state = domFor(root);
  const surface = state.surface;
  if (!root.expanded() || !surface?.matches(':popover-open')) {
    state.focusRequests.length = 0;
    return;
  }
  const options = optionsFor(surface);
  const optionStates = options.map((option) => ({ eligible: !optionDisabled(option) }));
  const selected = options.findIndex(
    (option, index) => optionStates[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
  );

  for (const request of state.focusRequests.splice(0)) {
    const activeOption = optionFromTarget(surface, surface.ownerDocument.activeElement);
    const current = activeOption ? options.indexOf(activeOption) : -1;
    let index: number | null;
    if (request === 'first' || request === 'last') {
      index =
        selected >= 0
          ? selected
          : resolveNavigationIndex(optionStates, request === 'first' ? -1 : options.length, request);
    } else {
      const base = current >= 0 ? current : selected >= 0 ? selected : request === 'next' ? -1 : options.length;
      index = resolveNavigationIndex(optionStates, base, request);
    }
    if (index != null) options[index]?.focus();
  }
}
function requestFocus(root: VfSelectRootDirective, request: FocusRequest): void {
  const state = domFor(root);
  state.focusRequests.push(request);
  state.focusRevision.update((revision) => revision + 1);
}

@Directive({
  selector: '[vfSelectRoot]',
  standalone: true,
  host: { '[attr.id]': 'rootId()' },
})
export class VfSelectRootDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly error = signal('');
  private initialValue = signal<string>('');
  readonly resetValue = computed(() => this.value() ?? this.initialValue());
  readonly id = input<string | undefined>(undefined);
  private readonly generatedId = inject(SELECT_ID_GENERATOR)();
  readonly rootId = computed(() => this.id() ?? this.generatedId);
  readonly triggerId = computed(() => `${this.rootId()}-trigger`);
  readonly listboxId = computed(() => `${this.rootId()}-listbox`);
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly open = input<boolean | undefined>(undefined);
  readonly defaultOpen = input(false);
  readonly valueChange = output<string>();
  readonly openChange = output<boolean>();
  private readonly internalValue = signal<string | undefined>(undefined);
  private readonly internalOpen = signal<boolean | undefined>(undefined);
  readonly selected = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());

  ngOnInit() {
    this.initialValue.set(this.defaultValue());
    this.internalValue.set(this.initialValue());
  }
  reset(): string {
    const next = this.value() ?? this.initialValue();
    if (this.value() === undefined) this.internalValue.set(next);
    this.error.set('');
    return next;
  }
  readonly expanded = computed(() => this.open() ?? this.internalOpen() ?? this.defaultOpen());

  setOpen(v: boolean): void {
    if (v && this.disabled()) return;
    if (v === this.expanded()) return;
    if (this.open() === undefined) this.internalOpen.set(v);
    this.openChange.emit(v);
  }

  setValue(v: string): void {
    if (this.disabled()) return;
    if (this.value() === undefined) this.internalValue.set(v);
    this.valueChange.emit(v);
    this.setOpen(false);
  }
}

@Directive({
  selector: 'button[vfSelectTrigger]',
  standalone: true,
  host: {
    type: 'button',
    '[id]': 'root.triggerId()',
    '[disabled]': 'disabled() || root.disabled()',
    '[attr.aria-invalid]': 'root.error() ? true : invalid()',
    '[attr.aria-describedby]': 'description() || null',
    '[attr.aria-controls]': 'root.listboxId()',
    'aria-haspopup': 'listbox',
    'data-vf-select-trigger': '',
    '[attr.aria-expanded]': 'root.expanded()',
  },
})
export class VfSelectTriggerDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input<string | boolean | undefined>(undefined, { alias: 'aria-invalid' });
  readonly describedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  readonly description = computed(() =>
    [this.describedBy(), this.root.error() ? `${this.root.listboxId()}-error` : undefined].filter(Boolean).join(' '),
  );
  constructor(readonly root: VfSelectRootDirective) {
    const element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    domFor(root).anchor = element;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || optionDisabled(element)) return;
      if (root.expanded()) root.setOpen(false);
      else {
        root.setOpen(true);
        requestFocus(root, 'first');
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || optionDisabled(element)) return;
      const wasOpen = root.expanded();
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!wasOpen) root.setOpen(true);
        requestFocus(root, wasOpen ? 'previous' : 'last');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!wasOpen) root.setOpen(true);
        requestFocus(root, wasOpen ? 'next' : 'first');
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!wasOpen) root.setOpen(true);
        requestFocus(root, 'first');
      }
    };

    element.addEventListener('click', onClick);
    element.addEventListener('keydown', onKeydown);
    destroyRef.onDestroy(() => {
      element.removeEventListener('click', onClick);
      element.removeEventListener('keydown', onKeydown);
      const state = domFor(root);
      if (state.anchor === element) state.anchor = null;
      state.focusRequests.length = 0;
    });
  }
}

@Directive({
  selector: '[vfSelectContent]',
  standalone: true,
  host: {
    '[id]': 'root.listboxId()',
    role: 'listbox',
    tabindex: '-1',
    'data-vf-select-content': '',
    popover: 'auto',
    '[attr.data-vf-open]': 'root.expanded() ? "" : null',
  },
})
export class VfSelectContentDirective {
  constructor(readonly root: VfSelectRootDirective) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    domFor(root).surface = element;
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let restoreFocus = false;
    const nativeRevision = signal(0);
    afterRenderEffect(() => {
      nativeRevision();
      const state = domFor(root);
      state.focusRevision();
      const open = root.expanded();
      if (state.anchor) {
        if (open && !element.matches(':popover-open')) element.showPopover({ source: state.anchor });
        if (!open && element.matches(':popover-open')) element.hidePopover();
      }
      if (!open) {
        if (timer !== null) clearTimeout(timer);
        timer = null;
        query = '';
      }
      flushFocusRequests(root);
    });
    const onBeforeToggle = (event: Event) => {
      if (event.target !== element) return;
      restoreFocus = element.matches(':popover-open') && element.contains(element.ownerDocument.activeElement);
    };
    const onToggle = (event: Event) => {
      if (event.target !== element) return;
      const actual = element.matches(':popover-open');
      if (!actual && restoreFocus) {
        restoreFocus = false;
        const active = element.ownerDocument.activeElement;
        if (!active || active === element.ownerDocument.body || element.contains(active)) domFor(root).anchor?.focus();
      }
      if (actual === root.expanded()) return;
      root.setOpen(actual);
      nativeRevision.update((revision) => revision + 1);
    };
    element.addEventListener('beforetoggle', onBeforeToggle);
    element.addEventListener('toggle', onToggle);

    const onKeydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        event.target.closest('[data-vf-select-content]') !== element
      )
        return;
      if (event.key === 'Escape') {
        event.preventDefault();
        root.setOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        root.setOpen(false);
        domFor(root).anchor?.focus();
        return;
      }
      const options = optionsFor(element);
      const currentOption = optionFromTarget(element, event.target);
      const current = currentOption ? options.indexOf(currentOption) : -1;
      const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveNavigationIndex(states, current, intent);
      else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query += event.key;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          query = '';
        }, 500);
        next = findTypeaheadMatch(
          options.map((option) => ({
            textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
            eligible: !optionDisabled(option),
          })),
          query,
          { startIndex: current },
        );
      }
      if (next == null) return;
      event.preventDefault();
      options[next]?.focus();
    };

    element.addEventListener('keydown', onKeydown);
    destroyRef.onDestroy(() => {
      element.removeEventListener('keydown', onKeydown);
      if (timer) clearTimeout(timer);
      const state = domFor(root);
      if (state.surface === element) state.surface = null;
      state.focusRequests.length = 0;
      element.removeEventListener('beforetoggle', onBeforeToggle);
      element.removeEventListener('toggle', onToggle);
    });
  }
}

@Directive({
  selector: 'button[vfSelectOption]',
  standalone: true,
  host: {
    type: 'button',
    role: 'option',
    tabindex: '-1',
    'data-vf-select-option': '',
    '[attr.data-vf-value]': 'value()',
    '[attr.aria-selected]': 'root.selected() === value()',
    '[attr.aria-disabled]': 'disabled() || root.disabled() ? true : null',
    '[disabled]': 'disabled() || root.disabled()',
    '(click)': 'select($event)',
  },
})
export class VfSelectOptionDirective {
  readonly value = input.required<string>({ alias: 'vfSelectOption' });
  readonly disabled = input(false);

  constructor(readonly root: VfSelectRootDirective) {}

  select(event?: MouseEvent): void {
    if (event?.defaultPrevented || this.disabled() || this.root.disabled()) return;
    if (event?.currentTarget instanceof HTMLButtonElement && optionDisabled(event.currentTarget)) return;
    this.root.setValue(this.value());
  }
}

@Component({
  selector: 'vf-select-form-control',
  standalone: true,
  host: { 'data-vf-select-form-control': '' },
  template: `<select
      #control
      hidden
      aria-hidden="true"
      tabindex="-1"
      [attr.name]="name() || null"
      [attr.form]="form() || null"
      [required]="required()"
      [disabled]="root.disabled()"
      (change)="reconcile()"
      (invalid)="invalid($event)"
    >
      @for (option of options(); track option.value) {
        <option
          [value]="option.value"
          [disabled]="option.disabled ?? false"
          [attr.selected]="root.selected() === option.value ? '' : null"
        >
          {{ option.label }}
        </option>
      }</select
    ><span [id]="root.listboxId() + '-error'" role="status">{{ root.error() }}</span>`,
})
export class VfSelectFormControlComponent {
  readonly root = inject(VfSelectRootDirective);
  readonly name = input<string | undefined>(undefined);
  readonly form = input<string | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly options = input.required<readonly { value: string; label: string; disabled?: boolean }[]>();
  private readonly control = viewChild.required<ElementRef<HTMLSelectElement>>('control');
  constructor() {
    const destroyRef = inject(DestroyRef);
    afterRenderEffect(() => this.reconcile());
    afterNextRender(() => {
      const element = this.control().nativeElement;
      const document = element.ownerDocument;
      let active = true;
      const onReset = (event: Event) => {
        if (!element.form || element.form !== event.target) return;
        setTimeout(() => {
          if (!active || event.defaultPrevented || element.form !== event.target) return;
          const next = this.root.reset();
          this.sync(element, next, next);
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      destroyRef.onDestroy(() => {
        active = false;
        document.removeEventListener('reset', onReset, true);
      });
    });
  }
  private sync(element: HTMLSelectElement, values: string, defaults: string) {
    for (const option of element.options) option.defaultSelected = defaults === option.value;
    element.value = values;
  }
  reconcile() {
    const element = this.control().nativeElement;
    this.options();
    this.required();
    this.root.disabled();
    this.sync(element, this.root.selected(), this.root.resetValue());
    if (this.root.error() && (element.validity.valid || element.matches(':disabled'))) this.root.error.set('');
  }
  invalid(event: Event) {
    event.preventDefault();
    this.root.error.set(this.control().nativeElement.validationMessage);
    domFor(this.root).anchor?.focus();
  }
}
