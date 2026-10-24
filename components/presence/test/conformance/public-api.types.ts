import type { PresenceState as ReactPresenceState } from '@vyrnforge/react/presence';
import type { PresenceState as AngularPresenceState } from '@vyrnforge/angular/presence';
import type { PresenceState as VuePresenceState } from '@vyrnforge/vue/presence';
import type { PresenceState as ElementsPresenceState } from '@vyrnforge/elements/presence';

type ReactPresence = typeof import('@vyrnforge/react/presence').usePresence;
type AngularPresence = typeof import('@vyrnforge/angular/presence').VfPresenceDirective;
type VuePresence = typeof import('@vyrnforge/vue/presence').usePresence;
type ElementsPresence = typeof import('@vyrnforge/elements/presence').VfPresenceElement;

const states: [ReactPresenceState, AngularPresenceState, VuePresenceState, ElementsPresenceState] = ['entered', 'exiting', 'exited', 'entered'];
declare const reactPresence: ReactPresence;
declare const angularPresence: AngularPresence;
declare const vuePresence: VuePresence;
declare const elementsPresence: ElementsPresence;
void [reactPresence, angularPresence, vuePresence, elementsPresence, states];
