import { usePresence, type PresenceResult, type PresenceState } from '@vyrnforge/vue/presence';
const hook: typeof usePresence = usePresence;
const state: PresenceState = 'exited';
const result = null as unknown as PresenceResult;
void [hook, state, result];
