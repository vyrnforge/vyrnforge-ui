import { VfPresenceElement, definePresenceElement, type PresenceExitEventDetail, type PresenceState } from '@vyrnforge/elements/presence';
const element: typeof VfPresenceElement = VfPresenceElement;
const define: typeof definePresenceElement = definePresenceElement;
const state: PresenceState = 'entered';
const detail: PresenceExitEventDetail = { state: 'exiting' };
void [element, define, state, detail];
