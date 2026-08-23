import {
  type ForwardedRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type CanonicalEventHandler<TDetail = unknown> = (
  detail: TDetail,
  event: CustomEvent<TDetail>,
) => void;

export type CanonicalEventHandlers = Readonly<
  Record<string, CanonicalEventHandler | undefined>
>;

export type CanonicalProperties = Readonly<Record<string, unknown>>;

export interface CanonicalElementBridgeOptions {
  tagName: string;
  register?: () => void;
  properties?: CanonicalProperties;
  events?: CanonicalEventHandlers;
}

export function assignCanonicalProperties(
  element: HTMLElement,
  properties: CanonicalProperties,
): void {
  const target = element as unknown as Record<string, unknown>;
  for (const [name, value] of Object.entries(properties)) {
    target[name] = value;
  }
}

export function subscribeCanonicalEvents(
  element: HTMLElement,
  handlers: CanonicalEventHandlers,
): () => void {
  const subscriptions: Array<readonly [string, EventListener]> = [];

  for (const [eventName, handler] of Object.entries(handlers)) {
    if (!handler) continue;

    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<unknown>;
      handler(customEvent.detail, customEvent);
    };
    element.addEventListener(eventName, listener);
    subscriptions.push([eventName, listener]);
  }

  return () => {
    for (const [eventName, listener] of subscriptions) {
      element.removeEventListener(eventName, listener);
    }
  };
}

export function ensureCanonicalElementRegistered(
  tagName: string,
  register?: () => void,
): boolean {
  const registry = globalThis.customElements;
  if (!registry) return false;
  if (registry.get(tagName)) return true;
  if (!register) return false;

  register();
  return Boolean(registry.get(tagName));
}

export function useCanonicalElementBridge<TElement extends HTMLElement>(
  forwardedRef: ForwardedRef<TElement>,
  {
    tagName,
    register,
    properties = {},
    events = {},
  }: CanonicalElementBridgeOptions,
): RefObject<TElement | null> {
  const elementRef = useRef<TElement>(null);

  useImperativeHandle(
    forwardedRef,
    () => elementRef.current as TElement,
    [],
  );

  useEffect(() => {
    ensureCanonicalElementRegistered(tagName, register);
  }, [tagName, register]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    assignCanonicalProperties(element, properties);
  }, [properties]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    return subscribeCanonicalEvents(element, events);
  }, [events]);

  return elementRef;
}
