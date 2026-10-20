import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

export interface TabsRootProps {
  id?: string;
  modelValue?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
  activation?: TabsActivation;
  dir?: 'ltr' | 'rtl';
}

export interface TabsListProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface TabsTabProps {
  value: string;
  disabled?: boolean;
}

export interface TabsPanelProps {
  value: string;
}

interface TabsContextValue {
  rootId: string;
  selectedValue: Readonly<Ref<string>>;
  focusValue: Ref<string>;
  orientation: Readonly<Ref<TabsOrientation>>;
  activation: Readonly<Ref<TabsActivation>>;
  direction: Readonly<Ref<'ltr' | 'rtl'>>;
  select(value: string): void;
}

const TabsContextKey: InjectionKey<TabsContextValue> = Symbol('VyrnForgeTabs');

function useTabsContext(): TabsContextValue {
  const context = inject(TabsContextKey);
  if (!context) throw new Error('VyrnForge Tabs compound components must be rendered inside TabsRoot.');
  return context;
}

function valueToken(value: string): string {
  return encodeURIComponent(value).replaceAll('%', '_');
}

function tabId(rootId: string, value: string): string {
  return `${rootId}-tab-${valueToken(value)}`;
}

function panelId(rootId: string, value: string): string {
  return `${rootId}-panel-${valueToken(value)}`;
}

function callHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const candidate of handler) if (typeof candidate === 'function') candidate(event);
}

export const TabsRoot = defineComponent({
  name: 'VfTabsRoot',
  inheritAttrs: false,
  props: {
    id: String,
    modelValue: String,
    defaultValue: String,
    orientation: { type: String as PropType<TabsOrientation>, default: 'horizontal' },
    activation: { type: String as PropType<TabsActivation>, default: 'automatic' },
    dir: { type: String as PropType<'ltr' | 'rtl'>, default: 'ltr' },
  },
  emits: ['update:modelValue', 'valueChange'],
  setup(props, { attrs, slots, emit }) {
    const generatedId = useId().replaceAll(':', '');
    const rootId = props.id ?? `vf-tabs-${generatedId}`;
    const internalValue = ref(props.defaultValue ?? props.modelValue ?? '');
    const selectedValue = computed(() => props.modelValue ?? internalValue.value);
    const focusValue = ref(selectedValue.value);
    watch(selectedValue, (value) => { focusValue.value = value; });
    const orientation = computed(() => props.orientation);
    const activation = computed(() => props.activation);
    const direction = computed(() => props.dir);

    provide(TabsContextKey, {
      rootId,
      selectedValue,
      focusValue,
      orientation,
      activation,
      direction,
      select(value) {
        if (props.modelValue === undefined) internalValue.value = value;
        emit('update:modelValue', value);
        emit('valueChange', value);
      },
    });

    return () => h('div', {
      ...attrs,
      id: rootId,
      dir: props.dir,
      'data-vf-tabs-root': '',
      'data-vf-orientation': props.orientation,
      'data-vf-activation': props.activation,
    }, slots.default?.());
  },
});

export const TabsList = defineComponent({
  name: 'VfTabsList',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const context = useTabsContext();
    return () => h('div', {
      ...attrs,
      role: 'tablist',
      'aria-orientation': context.orientation.value,
      'data-vf-tabs-list': '',
      'data-vf-orientation': context.orientation.value,
      onKeydown(event: KeyboardEvent) {
        callHandler(attrs.onKeydown, event);
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement;
        if (target.getAttribute('role') !== 'tab') return;
        let intent: CollectionNavigationIntent | null = null;
        if (event.key === 'Home') intent = 'first';
        if (event.key === 'End') intent = 'last';
        if (context.orientation.value === 'horizontal') {
          if (event.key === 'ArrowRight') intent = context.direction.value === 'rtl' ? 'previous' : 'next';
          if (event.key === 'ArrowLeft') intent = context.direction.value === 'rtl' ? 'next' : 'previous';
        } else {
          if (event.key === 'ArrowDown') intent = 'next';
          if (event.key === 'ArrowUp') intent = 'previous';
        }
        if (!intent) return;
        const currentTarget = event.currentTarget as HTMLElement;
        const tabs = Array.from(currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
        const currentIndex = tabs.indexOf(target);
        const items = tabs.map((tab) => ({ disabled: tab.getAttribute('aria-disabled') === 'true' || (tab as HTMLButtonElement).disabled }));
        const nextIndex = resolveEnabledIndex(items, currentIndex, intent);
        if (nextIndex === null) return;
        const nextTab = tabs[nextIndex];
        const nextValue = nextTab?.dataset.vfValue;
        if (!nextTab || nextValue === undefined) return;
        event.preventDefault();
        context.focusValue.value = nextValue;
        nextTab.focus();
        if (context.activation.value === 'automatic') context.select(nextValue);
      },
    }, slots.default?.());
  },
});

export const TabsTab = defineComponent({
  name: 'VfTabsTab',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    const context = useTabsContext();
    return () => {
      const selected = context.selectedValue.value === props.value;
      const focusable = context.focusValue.value === props.value;
      return h('button', {
        ...attrs,
        id: tabId(context.rootId, props.value),
        type: attrs.type ?? 'button',
        role: 'tab',
        disabled: props.disabled,
        tabindex: props.disabled ? -1 : focusable ? 0 : -1,
        'aria-selected': selected ? 'true' : 'false',
        'aria-disabled': props.disabled ? 'true' : undefined,
        'aria-controls': panelId(context.rootId, props.value),
        'data-vf-tabs-tab': '',
        'data-vf-value': props.value,
        'data-vf-selected': selected ? '' : undefined,
        'data-vf-disabled': props.disabled ? '' : undefined,
        onFocus(event: FocusEvent) {
          callHandler(attrs.onFocus, event);
          if (!props.disabled) context.focusValue.value = props.value;
        },
        onClick(event: MouseEvent) {
          callHandler(attrs.onClick, event);
          if (!event.defaultPrevented && !props.disabled) context.select(props.value);
        },
        onKeydown(event: KeyboardEvent) {
          callHandler(attrs.onKeydown, event);
          if (event.defaultPrevented || props.disabled || context.activation.value !== 'manual') return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            context.select(props.value);
          }
        },
      }, slots.default?.());
    };
  },
});

export const TabsPanel = defineComponent({
  name: 'VfTabsPanel',
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    const context = useTabsContext();
    return () => {
      const selected = context.selectedValue.value === props.value;
      return h('div', {
        ...attrs,
        id: panelId(context.rootId, props.value),
        role: 'tabpanel',
        tabindex: 0,
        hidden: !selected,
        'aria-labelledby': tabId(context.rootId, props.value),
        'data-vf-tabs-panel': '',
        'data-vf-selected': selected ? '' : undefined,
      }, slots.default?.());
    };
  },
});
