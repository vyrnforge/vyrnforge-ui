import {
  Children,
  Fragment,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

interface CarouselContext {
  index: number;
  count: number;
  set(index: number): void;
}

const RootContext = createContext<CarouselContext | null>(null);
const SlidePosition = createContext<number | null>(null);

function useCarousel() {
  const context = useContext(RootContext);
  if (!context) throw new Error('Carousel parts must be inside root.');
  return context;
}

function parts(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? parts(child.props.children) : [child],
  );
}

function bounded(index: number, count: number): number {
  return Math.max(0, Math.min(Number.isFinite(index) ? Math.trunc(index) : 0, Math.max(0, count - 1)));
}

export interface CarouselRootProps extends ComponentPropsWithoutRef<'section'> {
  index?: number;
  defaultIndex?: number;
  onIndexChange?(index: number): void;
  children?: ReactNode;
}

export const CarouselRoot = forwardRef<HTMLElement, CarouselRootProps>(function CarouselRoot(
  { index, defaultIndex = 0, onIndexChange, children, ...props },
  ref,
) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const count = parts(children).reduce<number>((total, child) => {
    if (!isValidElement<{ children?: ReactNode }>(child) || child.type !== CarouselViewport) return total;
    return (
      total + parts(child.props.children).filter((part) => isValidElement(part) && part.type === CarouselSlide).length
    );
  }, 0);
  const current = bounded(index ?? internalIndex, count);
  const context: CarouselContext = {
    index: current,
    count,
    set(value) {
      const next = bounded(value, count);
      if (count === 0 || next === current) return;
      if (index === undefined) setInternalIndex(next);
      onIndexChange?.(next);
    },
  };

  return createElement(
    RootContext.Provider,
    { value: context },
    createElement(
      'section',
      {
        ...props,
        ref,
        role: 'region',
        'aria-roledescription': props['aria-roledescription'] ?? 'carousel',
        'data-vf-carousel-root': '',
      },
      children,
    ),
  );
});

export const CarouselViewport = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function CarouselViewport(
  { children, ...props },
  ref,
) {
  let position = 0;
  return createElement(
    'div',
    { ...props, ref, 'data-vf-carousel-viewport': '' },
    parts(children).map((child) =>
      isValidElement(child) && child.type === CarouselSlide
        ? createElement(SlidePosition.Provider, { key: child.key, value: position++ }, child)
        : child,
    ),
  );
});

export const CarouselSlide = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function CarouselSlide(props, ref) {
    const context = useCarousel();
    const position = useContext(SlidePosition);
    return createElement('div', {
      ...props,
      ref,
      role: 'group',
      'aria-roledescription': props['aria-roledescription'] ?? 'slide',
      'data-vf-carousel-slide': '',
      hidden: position !== context.index,
    });
  },
);

export const CarouselPrevious = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function CarouselPrevious(props, ref) {
    const context = useCarousel();
    const unavailable = context.index === 0 || props['aria-disabled'] === true || props['aria-disabled'] === 'true';
    return createElement('button', {
      ...props,
      ref,
      type: props.type ?? 'button',
      'data-vf-carousel-previous': '',
      'aria-disabled': unavailable || props.disabled || undefined,
      onClick: (event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented && !props.disabled && !unavailable) context.set(context.index - 1);
      },
    });
  },
);

export const CarouselNext = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function CarouselNext(props, ref) {
    const context = useCarousel();
    const unavailable =
      context.index >= context.count - 1 || props['aria-disabled'] === true || props['aria-disabled'] === 'true';
    return createElement('button', {
      ...props,
      ref,
      type: props.type ?? 'button',
      'data-vf-carousel-next': '',
      'aria-disabled': unavailable || props.disabled || undefined,
      onClick: (event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented && !props.disabled && !unavailable) context.set(context.index + 1);
      },
    });
  },
);
