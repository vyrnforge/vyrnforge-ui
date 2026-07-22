export type VyrnForgeEventName = `vf-${string}`;

export interface VyrnForgeEventOptions {
  cancelable?: boolean;
}

export function createVyrnForgeEvent<TDetail>(
  name: VyrnForgeEventName,
  detail: TDetail,
  options: VyrnForgeEventOptions = {},
): CustomEvent<TDetail> {
  return new CustomEvent(name, {
    bubbles: true,
    composed: true,
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
