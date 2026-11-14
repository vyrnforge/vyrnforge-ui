import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type InjectionKey,
  type Ref,
  type VNode,
} from 'vue';

interface CarouselContext {
  index: Readonly<Ref<number>>;
  count: Readonly<Ref<number>>;
  explicit: Readonly<Ref<boolean>>;
  set(index: number): void;
}

const RootKey: InjectionKey<CarouselContext> = Symbol('VyrnForgeCarousel');
const PositionKey: InjectionKey<Readonly<Ref<number | null>>> = Symbol('VyrnForgeCarouselPosition');
const OffsetKey: InjectionKey<Readonly<Ref<number | null>>> = Symbol('VyrnForgeCarouselOffset');

function useCarousel() {
  const context = inject(RootKey);
  if (!context) throw new Error('Carousel parts must be inside root.');
  return context;
}

function parts(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children) ? parts(node.children as VNode[]) : [node],
  );
}

function bounded(index: number, count: number): number {
  return Math.max(0, Math.min(Number.isFinite(index) ? Math.trunc(index) : 0, Math.max(0, count - 1)));
}

const Collection = defineComponent({
  props: {
    count: { type: Number, required: true },
    index: { type: Number, required: true },
    explicit: Boolean,
  },
  emits: ['select'],
  setup(props, { slots, emit }) {
    provide(RootKey, {
      index: computed(() => props.index),
      count: computed(() => props.count),
      explicit: computed(() => props.explicit),
      set(value) {
        const next = bounded(value, props.count);
        if (props.count === 0 || next === props.index) return;
        emit('select', next);
      },
    });
    provide(
      PositionKey,
      computed(() => null),
    );
    provide(
      OffsetKey,
      computed(() => null),
    );
    return () => slots.default?.();
  },
});

const ViewportOffset = defineComponent({
  props: { offset: { type: Number, required: true } },
  setup(props, { slots }) {
    provide(
      OffsetKey,
      computed(() => props.offset),
    );
    return () => slots.default?.();
  },
});

const SlidePosition = defineComponent({
  props: { position: { type: Number, required: true } },
  setup(props, { slots }) {
    provide(
      PositionKey,
      computed(() => props.position),
    );
    return () => slots.default?.();
  },
});

export const CarouselRoot = defineComponent({
  name: 'CarouselRoot',
  inheritAttrs: false,
  props: { index: Number, defaultIndex: { type: Number, default: 0 }, slideCount: Number },
  emits: ['update:index'],
  setup(props, { attrs, slots, emit }) {
    const internalIndex = ref(props.defaultIndex);
    return () => {
      const explicit = props.slideCount !== undefined;
      if (explicit && (!Number.isInteger(props.slideCount) || (props.slideCount ?? 0) < 0)) {
        throw new Error('Carousel slideCount must be a non-negative integer.');
      }
      const children = parts(slots.default?.() ?? []);
      let inferredCount = 0;
      const content = explicit
        ? children
        : children.map((node, index) => {
            if (node.type !== CarouselViewport) return node;
            const viewportSlots = node.children as { default?: () => VNode[] } | null;
            const slides = parts(viewportSlots?.default?.() ?? []);
            const offset = inferredCount;
            inferredCount += slides.filter((slide) => slide.type === CarouselSlide).length;
            return h(
              ViewportOffset,
              { key: node.key ?? index, offset },
              {
                default: () => h(CarouselViewport, node.props, { default: () => slides }),
              },
            );
          });
      const count = props.slideCount ?? inferredCount;
      const index = bounded(props.index ?? internalIndex.value, count);
      return h(
        Collection,
        {
          count,
          index,
          explicit,
          onSelect(value: number) {
            if (props.index === undefined) internalIndex.value = value;
            emit('update:index', value);
          },
        },
        {
          default: () =>
            h(
              'section',
              {
                ...attrs,
                role: 'region',
                'aria-roledescription': attrs['aria-roledescription'] ?? 'carousel',
                'data-vf-carousel-root': '',
              },
              content,
            ),
        },
      );
    };
  },
});

export const CarouselViewport = defineComponent({
  name: 'CarouselViewport',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = useCarousel();
    const offset = inject(OffsetKey, null);
    return () => {
      if (!context.explicit.value && offset?.value == null) {
        throw new Error('Wrapped Carousel viewports require root slideCount and explicit slide positions.');
      }
      let position = offset?.value ?? 0;
      const children = slots.default?.() ?? [];
      return h(
        'div',
        { ...attrs, 'data-vf-carousel-viewport': '' },
        context.explicit.value
          ? children
          : parts(children).map((node) =>
              node.type === CarouselSlide
                ? h(SlidePosition, { key: node.key ?? position, position: position++ }, { default: () => node })
                : node,
            ),
      );
    };
  },
});

export const CarouselSlide = defineComponent({
  name: 'CarouselSlide',
  inheritAttrs: false,
  props: { position: Number },
  setup(props, { attrs, slots }) {
    const context = useCarousel();
    const inferredPosition = inject(PositionKey, null);
    return () => {
      const position = context.explicit.value ? props.position : inferredPosition?.value;
      if (
        position === null ||
        position === undefined ||
        !Number.isInteger(position) ||
        position < 0 ||
        position >= context.count.value
      ) {
        throw new Error(
          'Carousel slides require a valid position in the root collection; use slideCount and position for wrapped slides.',
        );
      }
      if (!context.explicit.value && props.position !== undefined) {
        throw new Error('Carousel slide position requires root slideCount.');
      }
      return h(
        'div',
        {
          ...attrs,
          role: 'group',
          'aria-roledescription': attrs['aria-roledescription'] ?? 'slide',
          'data-vf-carousel-slide': '',
          hidden: position !== context.index.value,
        },
        slots.default?.(),
      );
    };
  },
});

function callHandler(handler: unknown, event: MouseEvent) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler))
    for (const candidate of handler) if (typeof candidate === 'function') candidate(event);
}

export const CarouselPrevious = defineComponent({
  name: 'CarouselPrevious',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(props, { attrs, slots }) {
    const context = useCarousel();
    return () => {
      const unavailable =
        context.index.value === 0 || attrs['aria-disabled'] === true || attrs['aria-disabled'] === 'true';
      return h(
        'button',
        {
          ...attrs,
          type: attrs.type ?? 'button',
          disabled: props.disabled,
          'data-vf-carousel-previous': '',
          'aria-disabled': unavailable || props.disabled ? 'true' : undefined,
          onClick(event: MouseEvent) {
            callHandler(attrs.onClick, event);
            if (!event.defaultPrevented && !props.disabled && !unavailable) context.set(context.index.value - 1);
          },
        },
        slots.default?.(),
      );
    };
  },
});

export const CarouselNext = defineComponent({
  name: 'CarouselNext',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(props, { attrs, slots }) {
    const context = useCarousel();
    return () => {
      const unavailable =
        context.index.value >= context.count.value - 1 ||
        attrs['aria-disabled'] === true ||
        attrs['aria-disabled'] === 'true';
      return h(
        'button',
        {
          ...attrs,
          type: attrs.type ?? 'button',
          disabled: props.disabled,
          'data-vf-carousel-next': '',
          'aria-disabled': unavailable || props.disabled ? 'true' : undefined,
          onClick(event: MouseEvent) {
            callHandler(attrs.onClick, event);
            if (!event.defaultPrevented && !props.disabled && !unavailable) context.set(context.index.value + 1);
          },
        },
        slots.default?.(),
      );
    };
  },
});
