import type {
  CanonicalEventHandler,
  CanonicalEventHandlers,
  CanonicalProperties,
} from "./react-native-bridge";

export interface ReactPropertyMapping<TProps extends object> {
  reactProp: keyof TProps;
  canonicalProperty: string;
  defaultValue?: unknown;
}

export interface ReactEventMapping<TProps extends object, TDetail = unknown> {
  reactCallback: keyof TProps;
  canonicalEvent: string;
  mapDetail?: (detail: TDetail) => unknown;
}

export interface ReactCanonicalMapping<TProps extends object> {
  properties?: ReadonlyArray<ReactPropertyMapping<TProps>>;
  events?: ReadonlyArray<ReactEventMapping<TProps>>;
}

export interface ReactCanonicalBindings {
  properties: CanonicalProperties;
  events: CanonicalEventHandlers;
}

export function mapReactPropsToCanonical<TProps extends object>(
  props: TProps,
  mapping: ReactCanonicalMapping<TProps>,
): ReactCanonicalBindings {
  const properties: Record<string, unknown> = {};
  const events: Record<string, CanonicalEventHandler | undefined> = {};

  for (const property of mapping.properties ?? []) {
    const value = props[property.reactProp];
    properties[property.canonicalProperty] =
      value === undefined ? property.defaultValue : value;
  }

  for (const event of mapping.events ?? []) {
    const callback = props[event.reactCallback];
    if (typeof callback !== "function") continue;

    events[event.canonicalEvent] = (detail, customEvent) => {
      const mappedDetail = event.mapDetail ? event.mapDetail(detail) : detail;
      (callback as (value: unknown, event?: CustomEvent) => void)(
        mappedDetail,
        customEvent,
      );
    };
  }

  return { properties, events };
}
