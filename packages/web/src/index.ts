/**
 * Preferred anchor side and alignment for component-owned native popup placement.
 * The browser and CSS own actual positioning and collision fallback.
 */
export type AnchorPlacement = 'top' | 'bottom' | 'left' | 'right' | `${'top' | 'bottom' | 'left' | 'right'}-${'start' | 'end'}`;
