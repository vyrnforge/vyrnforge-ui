export const vyrnForgeUiBehaviorsVersion = "0.1.0-alpha.1";

export type BehaviorChangeReason =
  "user" | "programmatic" | "reset" | "restore";

export interface BehaviorEvent<
  TType extends string = string,
  TDetail = unknown,
  TReason extends string = BehaviorChangeReason,
> {
  readonly type: TType;
  readonly detail: TDetail;
  readonly reason: TReason;
}

export type BehaviorListener<TSnapshot> = (snapshot: TSnapshot) => void;
export type BehaviorUnsubscribe = () => void;

export interface BehaviorController<TSnapshot, TCommand = never> {
  getSnapshot(): TSnapshot;
  subscribe(listener: BehaviorListener<TSnapshot>): BehaviorUnsubscribe;
  dispatch(command: TCommand): void;
}

export function createBehaviorEvent<
  TType extends string,
  TDetail,
  TReason extends string = BehaviorChangeReason,
>(
  type: TType,
  detail: TDetail,
  reason: TReason,
): BehaviorEvent<TType, TDetail, TReason> {
  return Object.freeze({ type, detail, reason });
}
