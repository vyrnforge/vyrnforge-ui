import { usePresence as useReactPresence, type PresenceState as ReactPresenceState } from '@vyrnforge/react/presence';
import { VfPresenceDirective, type PresenceState as AngularPresenceState } from '@vyrnforge/angular/presence';
import { usePresence as useVuePresence, type PresenceState as VuePresenceState } from '@vyrnforge/vue/presence';
import { VfPresenceElement, type PresenceState as ElementsPresenceState } from '@vyrnforge/elements/presence';
const states: [ReactPresenceState, AngularPresenceState, VuePresenceState, ElementsPresenceState] = ['entered','exiting','exited','entered'];
void [useReactPresence, VfPresenceDirective, useVuePresence, VfPresenceElement, states];
