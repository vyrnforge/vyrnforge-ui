export type VyrnForgeEventName = `vf-${string}`;
export type VyrnForgeEventReason = string;

export interface VyrnForgeValueChangeDetail<TValue = unknown> {
  readonly value: TValue;
  readonly previousValue?: TValue;
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeOpenChangeDetail {
  readonly open: boolean;
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeSelectionChangeDetail<TKey = string> {
  readonly selectedKeys: readonly TKey[];
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeCheckedChangeDetail {
  readonly checked: boolean | "mixed";
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgePressedChangeDetail {
  readonly pressed: boolean;
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeActionDetail<TValue = unknown> {
  readonly action?: string;
  readonly value?: TValue;
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeDismissDetail {
  readonly reason: VyrnForgeEventReason;
}

export interface VyrnForgeInvalidDetail {
  readonly message: string;
  readonly reason: VyrnForgeEventReason;
  readonly validity: Readonly<Record<string, boolean>>;
}

export interface VyrnForgeResetDetail {
  readonly reason: "form-reset";
}

export interface VyrnForgeCanonicalEventDetailMap {
  readonly "vf-action": VyrnForgeActionDetail;
  readonly "vf-checked-change": VyrnForgeCheckedChangeDetail;
  readonly "vf-dismiss": VyrnForgeDismissDetail;
  readonly "vf-invalid": VyrnForgeInvalidDetail;
  readonly "vf-open-change": VyrnForgeOpenChangeDetail;
  readonly "vf-pressed-change": VyrnForgePressedChangeDetail;
  readonly "vf-reset": VyrnForgeResetDetail;
  readonly "vf-selection-change": VyrnForgeSelectionChangeDetail;
  readonly "vf-value-change": VyrnForgeValueChangeDetail;
}

export interface VyrnForgeEventOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export type VyrnForgeEventMapName<TEvents extends object> = Extract<
  keyof TEvents,
  VyrnForgeEventName
>;

export interface VyrnForgeTypedEventDispatcher<TEvents extends object> {
  create<TName extends VyrnForgeEventMapName<TEvents>>(
    name: TName,
    detail: TEvents[TName],
    options?: VyrnForgeEventOptions,
  ): CustomEvent<TEvents[TName]>;
  dispatch<TName extends VyrnForgeEventMapName<TEvents>>(
    target: EventTarget,
    name: TName,
    detail: TEvents[TName],
    options?: VyrnForgeEventOptions,
  ): boolean;
}

const EVENT_NAME_PATTERN = /^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertVyrnForgeEventName(
  name: string,
): asserts name is VyrnForgeEventName {
  if (!EVENT_NAME_PATTERN.test(name)) {
    throw new TypeError(`Invalid VyrnForge event name: ${name}`);
  }
}

export function createVyrnForgeEvent<TDetail>(
  name: VyrnForgeEventName,
  detail: TDetail,
  options: VyrnForgeEventOptions = {},
): CustomEvent<TDetail> {
  assertVyrnForgeEventName(name);
  return new CustomEvent(name, {
    bubbles: options.bubbles ?? true,
    composed: options.composed ?? true,
    cancelable: options.cancelable ?? false,
    detail,
  });
}

export function dispatchVyrnForgeEvent<TDetail>(
  target: EventTarget,
  name: VyrnForgeEventName,
  detail: TDetail,
  options?: VyrnForgeEventOptions,
): boolean {
  return target.dispatchEvent(createVyrnForgeEvent(name, detail, options));
}

export function createVyrnForgeEventDispatcher<
  TEvents extends object,
>(): VyrnForgeTypedEventDispatcher<TEvents> {
  return Object.freeze({
    create<TName extends VyrnForgeEventMapName<TEvents>>(
      name: TName,
      detail: TEvents[TName],
      options?: VyrnForgeEventOptions,
    ) {
      return createVyrnForgeEvent(name, detail, options);
    },
    dispatch<TName extends VyrnForgeEventMapName<TEvents>>(
      target: EventTarget,
      name: TName,
      detail: TEvents[TName],
      options?: VyrnForgeEventOptions,
    ) {
      return dispatchVyrnForgeEvent(target, name, detail, options);
    },
  });
}

export const vyrnForgeEventDispatcher =
  createVyrnForgeEventDispatcher<VyrnForgeCanonicalEventDetailMap>();
