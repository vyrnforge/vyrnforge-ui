import {
  APP_ID,
  Directive,
  ElementRef,
  InjectionToken,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

const TABS_ID_GENERATOR = new InjectionToken<() => string>('VyrnForge Tabs ID generator', {
  providedIn: 'root',
  factory: () => {
    const appId = inject(APP_ID);
    let nextId = 0;
    return () => `vf-tabs-${appId}-${nextId++}`;
  },
});

function valueToken(value: string): string {
  return encodeURIComponent(value).replaceAll('_', '_5F').replaceAll('%', '_');
}

@Directive({
  selector: '[vfTabsRoot]',
  standalone: true,
  host: {
    '[attr.id]': 'rootId()',
    '[attr.dir]': 'dir()',
    'data-vf-tabs-root': '',
    '[attr.data-vf-orientation]': 'orientation()',
    '[attr.data-vf-activation]': 'activation()',
  },
})
export class VfTabsRootDirective {
  readonly id = input<string | undefined>(undefined);
  readonly value = input<string | undefined>(undefined);
  readonly defaultValue = input('');
  readonly orientation = input<TabsOrientation>('horizontal');
  readonly activation = input<TabsActivation>('automatic');
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly valueChange = output<string>();

  private readonly generatedId = inject(TABS_ID_GENERATOR)();
  private readonly internalValue = signal<string | undefined>(undefined);
  readonly rootId = computed(() => this.id() ?? this.generatedId);
  readonly focusValue = signal('');
  readonly selectedValue = computed(() => this.value() ?? this.internalValue() ?? this.defaultValue());

  constructor() {
    effect(() => {
      this.focusValue.set(this.selectedValue());
    });
  }

  select(value: string): void {
    if (value === this.selectedValue()) return;
    if (this.value() === undefined) this.internalValue.set(value);
    this.valueChange.emit(value);
  }

  tabId(value: string): string {
    return `${this.rootId()}-tab-${valueToken(value)}`;
  }

  panelId(value: string): string {
    return `${this.rootId()}-panel-${valueToken(value)}`;
  }
}

@Directive({
  selector: '[vfTabsList]',
  standalone: true,
  host: {
    role: 'tablist',
    'data-vf-tabs-list': '',
    '[attr.aria-orientation]': 'root.orientation()',
    '[attr.data-vf-orientation]': 'root.orientation()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VfTabsListDirective {
  readonly root = inject(VfTabsRootDirective);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || !(event.target instanceof HTMLElement)) return;
    const target = event.target.closest<HTMLElement>('[data-vf-tabs-tab]');
    if (!target || target.closest('[data-vf-tabs-list]') !== this.element.nativeElement) return;

    let intent: CollectionNavigationIntent | null = null;
    if (event.key === 'Home') intent = 'first';
    if (event.key === 'End') intent = 'last';
    if (this.root.orientation() === 'horizontal') {
      if (event.key === 'ArrowRight') intent = this.root.dir() === 'rtl' ? 'previous' : 'next';
      if (event.key === 'ArrowLeft') intent = this.root.dir() === 'rtl' ? 'next' : 'previous';
    } else {
      if (event.key === 'ArrowDown') intent = 'next';
      if (event.key === 'ArrowUp') intent = 'previous';
    }
    if (!intent) return;

    const tabs = Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('[data-vf-tabs-tab]')).filter(
      (tab) => tab.closest('[data-vf-tabs-list]') === this.element.nativeElement,
    );
    const currentIndex = tabs.indexOf(target);
    const items = tabs.map((tab) => ({
      eligible: !(tab.getAttribute('aria-disabled') === 'true' || (tab as HTMLButtonElement).disabled),
    }));
    const nextIndex = resolveNavigationIndex(items, currentIndex, intent);
    if (nextIndex === null) return;
    const nextTab = tabs[nextIndex];
    const nextValue = nextTab?.dataset.vfValue;
    if (!nextTab || nextValue === undefined) return;

    event.preventDefault();
    this.root.focusValue.set(nextValue);
    nextTab.focus();
    if (this.root.activation() === 'automatic') this.root.select(nextValue);
  }
}

@Directive({
  selector: 'button[vfTabsTab]',
  standalone: true,
  host: {
    '[attr.id]': 'root.tabId(value())',
    type: 'button',
    role: 'tab',
    'data-vf-tabs-tab': '',
    '[attr.data-vf-value]': 'value()',
    '[attr.aria-selected]': 'selected() ? "true" : "false"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'root.panelId(value())',
    '[attr.tabindex]': 'tabIndex()',
    '[disabled]': 'disabled()',
    '(focus)': 'onFocus()',
    '(click)': 'onClick($event)',
  },
})
export class VfTabsTabDirective {
  readonly root = inject(VfTabsRootDirective);
  readonly value = input.required<string>({ alias: 'vfTabsTab' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly selected = computed(() => this.root.selectedValue() === this.value());

  tabIndex(): number {
    const focusable = this.root.activation() === 'manual' ? this.root.focusValue() === this.value() : this.selected();
    return !this.disabled() && focusable ? 0 : -1;
  }

  onFocus(): void {
    if (!this.disabled()) this.root.focusValue.set(this.value());
  }

  onClick(event?: MouseEvent): void {
    if (!event?.defaultPrevented && !this.disabled()) this.root.select(this.value());
  }
}

@Directive({
  selector: '[vfTabsPanel]',
  standalone: true,
  host: {
    '[attr.id]': 'root.panelId(value())',
    role: 'tabpanel',
    tabindex: '0',
    'data-vf-tabs-panel': '',
    '[attr.aria-labelledby]': 'root.tabId(value())',
    '[hidden]': '!selected()',
  },
})
export class VfTabsPanelDirective {
  readonly root = inject(VfTabsRootDirective);
  readonly value = input.required<string>({ alias: 'vfTabsPanel' });
  readonly selected = computed(() => this.root.selectedValue() === this.value());
}
