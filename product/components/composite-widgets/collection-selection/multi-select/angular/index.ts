import {
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  type WritableSignal,
} from '@angular/core';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionMultiSelector = '[data-vf-multi-select-option]';
type FocusRequest = 'first' | 'last' | 'next' | 'previous';
interface MultiSelectDomState {
  anchor: HTMLButtonElement | null;
  surface: HTMLElement | null;
  focusRequests: FocusRequest[];
  focusRevision: WritableSignal<number>;
}
const multiSelectDom = new WeakMap<VfMultiSelectRootDirective, MultiSelectDomState>();

function domFor(root: VfMultiSelectRootDirective): MultiSelectDomState {
  let state = multiSelectDom.get(root);
  if (!state) {
    state = { anchor: null, surface: null, focusRequests: [], focusRevision: signal(0) };
    multiSelectDom.set(root, state);
  }
  return state;
}
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionMultiSelector)).filter(
    (option) => option.closest('[data-vf-multi-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionMultiSelector) : null;
  return option && option.closest('[data-vf-multi-select-content]') === root ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.disabled || option.getAttribute('aria-disabled') === 'true';
}
function flushFocusRequests(root: VfMultiSelectRootDirective): void {
  const state = domFor(root);
  const surface = state.surface;
  if (!root.open() || !surface?.matches(':popover-open')) {
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
function requestFocus(root: VfMultiSelectRootDirective, request: FocusRequest): void {
  const state = domFor(root);
  state.focusRequests.push(request);
  state.focusRevision.update((revision) => revision + 1);
}

@Directive({ selector: '[vfMultiSelectRoot]', standalone: true })
export class VfMultiSelectRootDirective {
  readonly value = input<string[] | undefined>(undefined);
  readonly defaultValue = input<string[]>([]);
  readonly valueChange = output<string[]>();
  private readonly internalValue = signal<string[] | undefined>(undefined);
  readonly values = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());
  readonly open = signal(false);

  toggle(v: string): void {
    const next = this.values().includes(v) ? this.values().filter((value) => value !== v) : [...this.values(), v];
    if (this.value() === undefined) this.internalValue.set(next);
    this.valueChange.emit(next);
  }
}

@Directive({
  selector: 'button[vfMultiSelectTrigger]',
  standalone: true,
  host: {
    type: 'button',
    'aria-haspopup': 'listbox',
    'data-vf-multi-select-trigger': '',
    '[attr.aria-expanded]': 'root.open()',
  },
})
export class VfMultiSelectTriggerDirective {
  constructor(readonly root: VfMultiSelectRootDirective) {
    const element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    domFor(root).anchor = element;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (root.open()) root.open.set(false);
      else {
        root.open.set(true);
        requestFocus(root, 'first');
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const wasOpen = root.open();
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
        requestFocus(root, wasOpen ? 'previous' : 'last');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
        requestFocus(root, wasOpen ? 'next' : 'first');
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
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
  selector: '[vfMultiSelectContent]',
  standalone: true,
  host: {
    role: 'listbox',
    'aria-multiselectable': 'true',
    tabindex: '-1',
    'data-vf-multi-select-content': '',
    popover: 'auto',
    '[attr.data-vf-open]': 'root.open() ? "" : null',
  },
})
export class VfMultiSelectContentDirective {
  constructor(readonly root: VfMultiSelectRootDirective) {
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
      const open = root.open();
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
      if (actual === root.open()) return;
      root.open.set(actual);
      nativeRevision.update((revision) => revision + 1);
    };
    element.addEventListener('beforetoggle', onBeforeToggle);
    element.addEventListener('toggle', onToggle);

    const onKeydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        event.target.closest('[data-vf-multi-select-content]') !== element
      )
        return;
      if (event.key === 'Escape') {
        event.preventDefault();
        root.open.set(false);
        return;
      }
      if (event.key === 'Tab') {
        root.open.set(false);
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
  selector: 'button[vfMultiSelectOption]',
  standalone: true,
  host: {
    type: 'button',
    role: 'option',
    tabindex: '-1',
    'data-vf-multi-select-option': '',
    '[attr.data-vf-value]': 'value()',
    '[attr.aria-selected]': 'root.values().includes(value())',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '[disabled]': 'disabled()',
    '(click)': 'toggle($event)',
  },
})
export class VfMultiSelectOptionDirective {
  readonly value = input.required<string>({ alias: 'vfMultiSelectOption' });
  readonly disabled = input(false);

  constructor(readonly root: VfMultiSelectRootDirective) {}

  toggle(event?: MouseEvent): void {
    if (event?.defaultPrevented || this.disabled()) return;
    this.root.toggle(this.value());
  }
}
