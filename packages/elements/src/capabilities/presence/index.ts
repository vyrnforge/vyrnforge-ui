export type PresenceState = 'entered' | 'exiting' | 'exited';

export interface PresenceExitEventDetail {
  state: 'exiting' | 'exited';
}

const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export class VfPresenceElement extends HTMLElementBase {
  static readonly observedAttributes = ['present'];
  #state: PresenceState = 'exited';

  connectedCallback(): void {
    if (typeof HTMLElement === 'undefined') return;
    this.#sync(this.hasAttribute('present'));
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#sync(this.hasAttribute('present'));
  }

  get present(): boolean {
    return this.hasAttribute('present');
  }

  set present(value: boolean) {
    this.toggleAttribute('present', value);
  }

  get state(): PresenceState {
    return this.#state;
  }

  completeExit(): void {
    if (this.present || this.#state !== 'exiting') return;
    this.#state = 'exited';
    this.hidden = true;
    this.dataset.vfPresence = this.#state;
    this.dispatchEvent(new CustomEvent<PresenceExitEventDetail>('vf-exit-complete', {
      detail: { state: 'exited' },
      bubbles: true,
      composed: true,
    }));
  }

  #sync(present: boolean): void {
    if (present) {
      this.hidden = false;
      this.#state = 'entered';
      this.dataset.vfPresence = this.#state;
      return;
    }
    if (this.#state === 'entered') {
      this.#state = 'exiting';
      this.dataset.vfPresence = this.#state;
      this.dispatchEvent(new CustomEvent<PresenceExitEventDetail>('vf-exit-start', {
        detail: { state: 'exiting' },
        bubbles: true,
        composed: true,
      }));
    } else if (this.#state === 'exited') {
      this.hidden = true;
      this.dataset.vfPresence = this.#state;
    }
  }
}

export function definePresenceElement(registry: CustomElementRegistry | undefined = globalThis.customElements): void {
  if (!registry) throw new Error('VyrnForge Elements Presence registration requires a CustomElementRegistry.');
  if (!registry.get('vf-presence')) registry.define('vf-presence', VfPresenceElement);
}
