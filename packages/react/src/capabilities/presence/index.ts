import { useCallback, useEffect, useState } from 'react';

export type PresenceState = 'entered' | 'exiting' | 'exited';

export interface PresenceResult {
  mounted: boolean;
  state: PresenceState;
  completeExit(): void;
}

export function usePresence(present: boolean): PresenceResult {
  const [mounted, setMounted] = useState(present);
  const [state, setState] = useState<PresenceState>(present ? 'entered' : 'exited');

  useEffect(() => {
    if (present) {
      setMounted(true);
      setState('entered');
    } else if (mounted) {
      setState('exiting');
    }
  }, [mounted, present]);

  const completeExit = useCallback(() => {
    if (present) return;
    setMounted(false);
    setState('exited');
  }, [present]);

  return { mounted, state, completeExit };
}
