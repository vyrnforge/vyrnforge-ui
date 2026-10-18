import {
  createControllableState,
  type ControllableStateChangeEvent,
  type ControllableStateController,
} from "./controllable-state";
import type { BehaviorChangeReason, BehaviorEventListener } from "./events";

export interface NumericRange {
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly precision?: number;
  readonly alignToStep?: boolean;
}

export interface NumericValueControllerOptions extends NumericRange {
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onValueChange?: BehaviorEventListener<
    ControllableStateChangeEvent<number>
  >;
}

export interface NumericValueController extends ControllableStateController<number> {
  setNumber(value: number, reason?: BehaviorChangeReason): boolean;
  increment(reason?: BehaviorChangeReason): boolean;
  decrement(reason?: BehaviorChangeReason): boolean;
  syncNumber(value: number): boolean;
  setRange(range: NumericRange): void;
  normalize(value: number): number;
}

function decimalPlaces(value: number): number {
  const text = String(value);
  const exponent = text.match(/e-(\d+)$/i)?.[1];
  if (exponent) return Number(exponent);
  return text.includes(".") ? text.length - text.indexOf(".") - 1 : 0;
}

export function normalizeNumericValue(
  value: number,
  range: NumericRange = {},
): number {
  const min = Number.isFinite(range.min) ? (range.min as number) : -Infinity;
  const maxCandidate = Number.isFinite(range.max)
    ? (range.max as number)
    : Infinity;
  const max = Math.max(min, maxCandidate);
  const finiteValue = Number.isFinite(value)
    ? value
    : min === -Infinity
      ? 0
      : min;
  const step =
    Number.isFinite(range.step) && (range.step as number) > 0
      ? (range.step as number)
      : undefined;
  let normalized = Math.min(max, Math.max(min, finiteValue));

  if (
    range.alignToStep === true &&
    step !== undefined &&
    Number.isFinite(min)
  ) {
    normalized = min + Math.round((normalized - min) / step) * step;
    normalized = Math.min(max, Math.max(min, normalized));
  }

  const precision = Math.max(
    0,
    range.precision ?? (step === undefined ? 12 : decimalPlaces(step)),
  );
  return roundToPrecision(normalized, Math.min(precision, 12));
}

export function createNumericValueController(
  options: NumericValueControllerOptions = {},
): NumericValueController {
  let range: NumericRange = {
    min: options.min,
    max: options.max,
    step: options.step,
    precision: options.precision,
    alignToStep: options.alignToStep,
  };
  const normalize = (value: number) => normalizeNumericValue(value, range);
  const defaultValue = normalize(options.defaultValue ?? options.min ?? 0);
  const state = createControllableState<number>({
    defaultValue,
    ...(Object.prototype.hasOwnProperty.call(options, "value")
      ? { value: normalize(options.value as number) }
      : {}),
    onChange: options.onValueChange,
  });
  function resolveStep(): number {
    return Number.isFinite(range.step) && (range.step as number) > 0
      ? (range.step as number)
      : 1;
  }

  return Object.assign(state, {
    normalize,
    setNumber(value: number, reason: BehaviorChangeReason = "programmatic") {
      return state.setValue(normalize(value), reason);
    },
    increment(reason: BehaviorChangeReason = "keyboard") {
      return state.setValue(
        (value) => normalize(value + resolveStep()),
        reason,
      );
    },
    decrement(reason: BehaviorChangeReason = "keyboard") {
      return state.setValue(
        (value) => normalize(value - resolveStep()),
        reason,
      );
    },
    syncNumber(value: number) {
      return state.syncValue(normalize(value));
    },
    setRange(nextRange: NumericRange) {
      range = { ...nextRange };
    },
  });
}

function roundToPrecision(value: number, precision: number): number {
  if (value === 0) {
    return 0;
  }

  const factor = 10 ** precision;
  const scaled = value * factor;

  /*
   * Decimal values such as 1.2345 may be represented just below their
   * mathematical midpoint. Apply a magnitude-aware tolerance before
   * rounding so decimal half values remain deterministic.
   *
   * Round the absolute value so negative midpoint values use the same
   * half-away-from-zero contract as positive values.
   */
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(scaled));

  return (
    (Math.sign(scaled) * Math.round(Math.abs(scaled) + tolerance)) / factor
  );
}
