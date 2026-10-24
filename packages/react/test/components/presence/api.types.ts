import { usePresence, type PresenceResult, type PresenceState } from '@vyrnforge/react/presence';
const hook: typeof usePresence = usePresence;
const state: PresenceState = 'exiting';
const result = null as unknown as PresenceResult;
void [hook, state, result];
