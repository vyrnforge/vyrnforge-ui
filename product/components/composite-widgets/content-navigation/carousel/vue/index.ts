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
  set(index: number): void;
}

const RootKey: InjectionKey<CarouselContext> = Symbol('VyrnForgeCarousel');
const PositionKey: InjectionKey<Readonly<Ref<number>>> = Symbol('VyrnForgeCarouselPosition');

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
  props: { index: Number, defaultIndex: { type: Number, default: 0 } },
  emits: ['update:index'],
  setup(props, { attrs, slots, emit }) {
    const internalIndex = ref(props.defaultIndex);
    const count = ref(0);
    const index = computed(() => bounded(props.index ?? internalIndex.value, count.value));
    provide(RootKey, {
      index,
      count,
      set(value) {
        const next = bounded(value, count.value);
        if (count.value === 0 || next === index.value) return;
        if (props.index === undefined) internalIndex.value = next;
        emit('update:index', next);
      },
    });

    return () => {
      const children = parts(slots.default?.() ?? []);
      let slideCount = 0;
      const content = children.map((node) => {
        if (node.type !== CarouselViewport) return node;
        const viewportSlots = node.children as { default?: () => VNode[] } | null;
        const slides = parts(viewportSlots?.default?.() ?? []);
        slideCount += slides.filter((slide) => slide.type === CarouselSlide).length;
        return h(CarouselViewport, node.props, { default: () => slides });
      });
      count.value = slideCount;
      return h(
        'section',
        {
          ...attrs,
          role: 'region',
          'aria-roledescription': attrs['aria-roledescription'] ?? 'carousel',
          'data-vf-carousel-root': '',
        },
        content,
      );
    };
  },
});

export const CarouselViewport = defineComponent({
  name: 'CarouselViewport',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      let position = 0;
      return h(
        'div',
        { ...attrs, 'data-vf-carousel-viewport': '' },
        parts(slots.default?.() ?? []).map((node) =>
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
  setup(_, { attrs, slots }) {
    const context = useCarousel();
    const position = inject(PositionKey, null);
    return () =>
      h(
        'div',
        {
          ...attrs,
          role: 'group',
          'aria-roledescription': attrs['aria-roledescription'] ?? 'slide',
          'data-vf-carousel-slide': '',
          hidden: position?.value !== context.index.value,
        },
        slots.default?.(),
      );
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
