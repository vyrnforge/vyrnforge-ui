import { readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

export type PresenceState = 'entered' | 'exiting' | 'exited';
export interface PresenceResult {
  mounted: Readonly<Ref<boolean>>;
  state: Readonly<Ref<PresenceState>>;
  completeExit(): void;
}

export function usePresence(present: MaybeRefOrGetter<boolean>): PresenceResult {
  const initial = toValue(present);
  const mounted = ref(initial);
  const state = ref<PresenceState>(initial ? 'entered' : 'exited');
  watch(() => toValue(present), (value) => {
    if (value) {
      mounted.value = true;
      state.value = 'entered';
    } else if (mounted.value) state.value = 'exiting';
  });
  function completeExit(): void {
    if (toValue(present)) return;
    mounted.value = false;
    state.value = 'exited';
  }
  return { mounted: readonly(mounted), state: readonly(state), completeExit };
}
