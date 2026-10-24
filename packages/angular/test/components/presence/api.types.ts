import { VfPresenceDirective, type PresenceState, type VfPresenceContext } from '@vyrnforge/angular/presence';
const directive: typeof VfPresenceDirective = VfPresenceDirective;
const state: PresenceState = 'entered';
const context = null as unknown as VfPresenceContext;
void [directive, state, context];
