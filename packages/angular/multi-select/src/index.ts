import { DestroyRef, Directive, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { toggleSelection } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionSelector = '[data-vf-multi-select-option]';
type FocusRequest = 'first' | 'last' | 'next' | 'previous';
interface MultiSelectDomState {
  anchor: HTMLButtonElement | null;
  surface: HTMLElement | null;
  focusRequests: FocusRequest[];
  focusScheduled: boolean;
}
const multiSelectDom = new WeakMap<VfMultiSelectRootDirective, MultiSelectDomState>();

function domFor(root: VfMultiSelectRootDirective): MultiSelectDomState {
  let state = multiSelectDom.get(root);
  if (!state) {
    state = { anchor: null, surface: null, focusRequests: [], focusScheduled: false };
    multiSelectDom.set(root, state);
  }
  return state;
}
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector));
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && root.contains(option) ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.disabled || option.getAttribute('aria-disabled') === 'true';
}
function flushFocusRequests(root: VfMultiSelectRootDirective): void {
  const state = domFor(root);
  state.focusScheduled = false;
  const surface = state.surface;
  if (!surface) {
    state.focusRequests.length = 0;
    return;
  }
  const options = optionsFor(surface);
  const optionStates = options.map((option) => ({ disabled: optionDisabled(option) }));
  const selected = options.findIndex(
    (option, index) => !optionStates[index]?.disabled && option.getAttribute('aria-selected') === 'true',
  );

  for (const request of state.focusRequests.splice(0)) {
    const activeOption = optionFromTarget(surface, surface.ownerDocument.activeElement);
    const current = activeOption ? options.indexOf(activeOption) : -1;
    let index: number | null;
    if (request === 'first' || request === 'last') {
      index = selected >= 0
        ? selected
        : resolveEnabledIndex(optionStates, request === 'first' ? -1 : options.length, request);
    } else {
      const base = current >= 0
        ? current
        : selected >= 0
          ? selected
          : request === 'next' ? -1 : options.length;
      index = resolveEnabledIndex(optionStates, base, request);
    }
    if (index != null) options[index]?.focus();
  }
}
function requestFocus(root: VfMultiSelectRootDirective, request: FocusRequest, injector: Injector): void {
  const state = domFor(root);
  state.focusRequests.push(request);
  if (state.focusScheduled) return;
  state.focusScheduled = true;
  const flush = () => flushFocusRequests(root);
  if (state.surface && !state.surface.hidden) queueMicrotask(flush);
  else afterNextRender(flush, { injector });
}

@Directive({ selector: '[vfMultiSelectRoot]', standalone: true })
export class VfMultiSelectRootDirective {
  readonly value = input<string[] | undefined>(undefined);
  readonly defaultValue = input<string[]>([]);
  readonly valueChange = output<string[]>();
  private readonly internalValue = signal<string[] | undefined>(undefined);
  readonly values = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());
  readonly open = signal(false);

  toggle(candidate: string): void {
    const next = toggleSelection(this.values(), candidate);
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
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    domFor(root).anchor = element;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (root.open()) root.open.set(false);
      else {
        root.open.set(true);
        requestFocus(root, 'first', injector);
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const wasOpen = root.open();
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
        requestFocus(root, wasOpen ? 'previous' : 'last', injector);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
        requestFocus(root, wasOpen ? 'next' : 'first', injector);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!wasOpen) root.open.set(true);
        requestFocus(root, 'first', injector);
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
    tabindex: '-1',
    'aria-multiselectable': 'true',
    'data-vf-multi-select-content': '',
    '[hidden]': '!root.open()',
  },
})
export class VfMultiSelectContentDirective {
  constructor(readonly root: VfMultiSelectRootDirective) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    domFor(root).surface = element;
    let query = '';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        root.open.set(false);
        domFor(root).anchor?.focus();
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
      const states = options.map((option) => ({ disabled: optionDisabled(option) }));
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveEnabledIndex(states, current, intent);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query += event.key;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { query = ''; }, 500);
        next = findTypeaheadMatch(options.map((option) => ({
          textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
          disabled: optionDisabled(option),
        })), query, { startIndex: current });
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
      state.focusScheduled = false;
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
    '(click)': 'toggle()',
  },
})
export class VfMultiSelectOptionDirective {
  readonly value = input.required<string>({ alias: 'vfMultiSelectOption' });
  readonly disabled = input(false);
  constructor(readonly root: VfMultiSelectRootDirective) {}
  toggle(): void {
    if (!this.disabled()) this.root.toggle(this.value());
  }
}
