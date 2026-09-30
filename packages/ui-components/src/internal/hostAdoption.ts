import {
  findVyrnForgeNamedRegion,
  resolveVyrnForgeHostClasses,
  resolveVyrnForgeHostTag,
  vyrnForgeHostAdoptionContracts,
  type VyrnForgeHostAdoptionId,
} from "@vyrnforge/ui-elements";
import { joinClassNames } from "../utils/classNames";

export function resolveAdoptedHostClassName(
  id: VyrnForgeHostAdoptionId,
  values: Readonly<Record<string, unknown>>,
  className?: string,
): string {
  return joinClassNames(
    ...resolveVyrnForgeHostClasses(
      vyrnForgeHostAdoptionContracts[id],
      values,
    ),
    className,
  );
}

export function resolveAdoptedHostTag(
  id: VyrnForgeHostAdoptionId,
  requestedTag?: string,
): string {
  return resolveVyrnForgeHostTag(
    vyrnForgeHostAdoptionContracts[id],
    requestedTag,
  );
}

export function adoptedRegionClassName(
  id: VyrnForgeHostAdoptionId,
  region: string,
): string {
  const resolved = findVyrnForgeNamedRegion(
    vyrnForgeHostAdoptionContracts[id],
    region,
  );
  if (!resolved) {
    throw new Error(`Unknown ${id} adoption region ${region}.`);
  }
  return resolved.className;
}
