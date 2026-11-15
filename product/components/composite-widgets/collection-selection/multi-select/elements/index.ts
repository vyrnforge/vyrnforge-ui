import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
const rootMultiSelector = '[data-vf-multi-select-root],vf-multi-select';
let nextMultiSelectId = 0;
const optionMultiSelector = '[data-vf-multi-select-option]';
function optionsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionMultiSelector)).filter(
    (option) => option.closest(rootMultiSelector) === root.closest(rootMultiSelector),
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const option = target instanceof Element ? target.closest<HTMLElement>(optionMultiSelector) : null;
  return option && root.contains(option) && option.closest(rootMultiSelector) === root.closest(rootMultiSelector)
    ? option
    : null;
}
function optionDisabled(option: HTMLElement): boolean {
  return option.matches(':disabled,[disabled],[aria-disabled="true"]');
}
function optionValue(option: HTMLElement): string {
  return option.dataset.vfValue ?? option.getAttribute('value') ?? '';
}

export class VfMultiSelectElement extends H {
  static observedAttributes = ['open', 'disabled'];
  private readonly generatedListboxId = `vf-multi-select-${++nextMultiSelectId}-listbox`;
  private formControl: HTMLSelectElement | null = null;
  private initialSelection: string[] | null = null;
  private formError = '';
  private generatedErrorId = `${this.generatedListboxId}-error`;
  private disabledTrigger: HTMLButtonElement | null = null;
  private priorTriggerDisabled = false;
  private priorInvalid: string | null | undefined;
  private surface: HTMLElement | null = null;
  private restoreFocus = false;
  private observer: MutationObserver | null = null;
  private query = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback(): void {
    this.setAttribute('data-vf-multi-select-root', '');
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    this.ownerDocument.addEventListener('reset', this.onReset, true);
    this.addEventListener('invalid', this.onInvalid, true);
    this.addEventListener('change', this.onFormChange);
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'id',
          'open',
          'disabled',
          'aria-disabled',
          'data-vf-multi-select-option',
          'data-vf-value',
          'value',
          'aria-selected',
        ],
      });
    }
    this.sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
    this.ownerDocument.removeEventListener('reset', this.onReset, true);
    this.removeEventListener('invalid', this.onInvalid, true);
    this.removeEventListener('change', this.onFormChange);
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.query = '';
    this.surface?.removeEventListener('toggle', this.onToggle);
    this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
    this.surface = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.sync();
  }

  private ownedPart(selector: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>(selector)).find(
        (node) => node.closest(rootMultiSelector) === this,
      ) ?? null
    );
  }

  private get trigger(): HTMLElement | null {
    return this.ownedPart('[data-vf-multi-select-trigger]');
  }

  private get content(): HTMLElement | null {
    return this.ownedPart('[data-vf-multi-select-content]');
  }

  private sync(): void {
    const open = this.hasAttribute('open') && !this.hasAttribute('disabled');
    if (!open) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.query = '';
    }
    const trigger = this.trigger;
    const content = this.content;
    if (content !== this.surface) {
      this.surface?.removeEventListener('toggle', this.onToggle);
      this.surface?.removeEventListener('beforetoggle', this.onBeforeToggle);
      if (this.surface?.matches(':popover-open')) this.surface.hidePopover();
      this.surface = content;
      content?.addEventListener('toggle', this.onToggle);
      content?.addEventListener('beforetoggle', this.onBeforeToggle);
    }
    trigger?.setAttribute('aria-haspopup', 'listbox');
    trigger?.setAttribute('aria-expanded', String(open));
    if (content) {
      content.id ||= this.id ? `${this.id}-listbox` : this.generatedListboxId;
      trigger?.setAttribute('aria-controls', content.id);
      content.setAttribute('role', 'listbox');
      content.setAttribute('aria-multiselectable', 'true');
      content.tabIndex = -1;
      content.setAttribute('popover', 'auto');
      content.removeAttribute('hidden');
      content.toggleAttribute('data-vf-open', open);
    } else trigger?.removeAttribute('aria-controls');
    for (const option of optionsFor(this)) {
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      if (!option.hasAttribute('aria-selected')) option.setAttribute('aria-selected', 'false');
    }
    this.syncFormControl();
    if (!content || !trigger) return;
    if (open && !content.matches(':popover-open')) content.showPopover({ source: trigger });
    if (!open && content.matches(':popover-open')) content.hidePopover();
  }

  private syncFormControl(): void {
    const trigger = this.trigger;
    if (this.disabledTrigger && (this.disabledTrigger !== trigger || !this.hasAttribute('disabled'))) {
      this.disabledTrigger.disabled = this.priorTriggerDisabled;
      this.disabledTrigger = null;
    }
    if (trigger instanceof HTMLButtonElement && this.hasAttribute('disabled') && !this.disabledTrigger) {
      this.disabledTrigger = trigger;
      this.priorTriggerDisabled = trigger.disabled;
      trigger.disabled = true;
    }
    const candidate = this.ownedPart('select[data-vf-multi-select-form-control]');
    const control = candidate instanceof HTMLSelectElement ? candidate : null;
    if (control !== this.formControl) {
      this.formControl = control;
      this.initialSelection = control ? this.selectedValues() : null;
      this.formError = '';
    }
    if (!control || this.initialSelection === null) return;
    control.hidden = true;
    control.tabIndex = -1;
    control.setAttribute('aria-hidden', 'true');
    control.multiple = true;
    const disabled = this.hasAttribute('disabled') || (trigger instanceof HTMLButtonElement && trigger.disabled);
    if (control.disabled !== disabled) control.disabled = disabled;
    const values = this.selectedValues();
    const defaults = this.initialSelection;
    for (const option of control.options) {
      const selected = defaults.includes(option.value);
      if (option.defaultSelected !== selected) option.defaultSelected = selected;
    }
    for (const option of control.options) option.selected = values.includes(option.value);
    if (control.validity.valid || control.matches(':disabled')) this.formError = '';
    this.syncFormError();
  }
  private syncFormError(): void {
    const trigger = this.trigger;
    const control = this.formControl;
    if (!trigger || !control) return;
    let error = this.ownedPart('[data-vf-multi-select-form-error]');
    if (!error) {
      error = this.ownerDocument.createElement('span');
      error.setAttribute('data-vf-multi-select-form-error', '');
      control.after(error);
    }
    error.id ||= this.generatedErrorId;
    error.setAttribute('role', 'status');
    if (error.textContent !== this.formError) error.textContent = this.formError;
    const descriptions = (trigger.getAttribute('aria-describedby') ?? '').split(/\\s+/).filter((id) => id && id !== error.id);
    if (this.formError) {
      if (this.priorInvalid === undefined) this.priorInvalid = trigger.getAttribute('aria-invalid');
      trigger.setAttribute('aria-invalid', 'true');
      descriptions.push(error.id);
    } else if (this.priorInvalid !== undefined) {
      if (this.priorInvalid === null) trigger.removeAttribute('aria-invalid');
      else trigger.setAttribute('aria-invalid', this.priorInvalid);
      this.priorInvalid = undefined;
    }
    if (descriptions.length) trigger.setAttribute('aria-describedby', descriptions.join(' '));
    else trigger.removeAttribute('aria-describedby');
  }
  private onFormChange = (event: Event): void => {
    if (event.target === this.formControl) this.syncFormControl();
  };
  private onInvalid = (event: Event): void => {
    if (event.target !== this.formControl || !this.formControl) return;
    event.preventDefault();
    this.formError = this.formControl.validationMessage;
    this.syncFormError();
    this.trigger?.focus();
  };
  private onReset = (event: Event): void => {
    const control = this.formControl;
    if (!control?.form || control.form !== event.target) return;
    setTimeout(() => {
      if (!this.isConnected || event.defaultPrevented || this.formControl !== control || control.form !== event.target || this.initialSelection === null) return;
      const defaults = this.initialSelection;
      for (const option of optionsFor(this)) {
        const selected = String(defaults.includes(optionValue(option)));
        if (option.getAttribute('aria-selected') !== selected) option.setAttribute('aria-selected', selected);
      }
      this.formError = '';
      this.sync();
    }, 0);
  };

  private onBeforeToggle = (event: Event): void => {
    const surface = this.surface;
    if (!surface || event.target !== surface) return;
    this.restoreFocus = surface.matches(':popover-open') && surface.contains(this.ownerDocument.activeElement);
  };

  private onToggle = (event: Event): void => {
    const surface = this.surface;
    if (!surface || event.target !== surface) return;
    const actual = surface.matches(':popover-open');
    if (!actual && this.restoreFocus) {
      this.restoreFocus = false;
      const active = this.ownerDocument.activeElement;
      if (!active || active === this.ownerDocument.body || surface.contains(active)) this.trigger?.focus();
    }
    if (actual !== this.hasAttribute('open')) this.setOpen(actual);
  };

  private setOpen(open: boolean): void {
    this.toggleAttribute('open', open && !this.hasAttribute('disabled'));
  }

  private focusOptions(edge: 'first' | 'last'): void {
    queueMicrotask(() => {
      const content = this.content;
      if (!this.isConnected || !content?.matches(':popover-open')) return;
      const options = optionsFor(content);
      const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
      const selected = options.findIndex(
        (option, index) => states[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
      );
      const index =
        selected >= 0 ? selected : resolveNavigationIndex(states, edge === 'first' ? -1 : options.length, edge);
      if (index != null) options[index]?.focus();
    });
  }

  private selectedValues(): string[] {
    return optionsFor(this)
      .filter((option) => option.getAttribute('aria-selected') === 'true')
      .map(optionValue)
      .filter(Boolean);
  }

  private toggleOption(option: HTMLElement): void {
    if (optionDisabled(option)) return;
    const value = optionValue(option);
    if (!value) return;
    const next = this.selectedValues().includes(value)
      ? this.selectedValues().filter((candidate) => candidate !== value)
      : [...this.selectedValues(), value];
    for (const candidate of optionsFor(this)) {
      const selected = String(next.includes(optionValue(candidate)));
      if (candidate.getAttribute('aria-selected') !== selected) candidate.setAttribute('aria-selected', selected);
    }
    this.syncFormControl();
  }

  private onClick = (event: Event): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootMultiSelector) !== this) return;
    const trigger = target.closest('[data-vf-multi-select-trigger]');
    if (trigger && trigger === this.trigger) {
      if (this.hasAttribute('disabled') || trigger.matches(':disabled,[aria-disabled="true"]')) return;
      if (this.hasAttribute('open')) this.setOpen(false);
      else {
        this.setOpen(true);
        this.focusOptions('first');
      }
      return;
    }
    const option = optionFromTarget(this, target);
    if (!option || !this.hasAttribute('open') || !this.content?.contains(option)) return;
    if (this.hasAttribute('disabled') || optionDisabled(option)) {
      event.preventDefault();
      return;
    }
    this.toggleOption(option);
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(rootMultiSelector) !== this) return;
    const trigger = target.closest('[data-vf-multi-select-trigger]');
    if (trigger && trigger === this.trigger) {
      if (this.hasAttribute('disabled') || trigger.matches(':disabled,[aria-disabled="true"]')) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.setOpen(true);
        this.focusOptions('last');
      } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.setOpen(true);
        this.focusOptions('first');
      }
      return;
    }

    const content = this.content;
    if (this.hasAttribute('disabled') || !this.hasAttribute('open') || !content || !content.contains(target)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      this.setOpen(false);
      this.trigger?.focus();
      return;
    }

    const options = optionsFor(content);
    const currentOption = optionFromTarget(content, event.target);
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
      this.query += event.key;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.query = '';
      }, 500);
      next = findTypeaheadMatch(
        options.map((option) => ({
          textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
          eligible: !optionDisabled(option),
        })),
        this.query,
        { startIndex: current },
      );
    }
    if (next == null) return;
    event.preventDefault();
    options[next]?.focus();
  };
}

export function defineMultiSelectElement(
  tag = 'vf-multi-select',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) throw new Error('VyrnForge MultiSelect registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfMultiSelectElement);
}
