export type TemporalInputType = 'date' | 'time' | 'datetime-local' | 'month' | 'week';

export interface ToggleButtonConnectOptions {
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean, event: MouseEvent) => void;
}

export interface ToggleButtonConnection {
  disconnect(): void;
  getPressed(): boolean;
  setPressed(pressed: boolean): void;
}

export function connectToggleButton(
  button: HTMLButtonElement,
  options: ToggleButtonConnectOptions = {}
): ToggleButtonConnection {
  let pressed = button.getAttribute('aria-pressed') === 'true' || options.defaultPressed === true;

  const render = () => {
    button.setAttribute('aria-pressed', String(pressed));
    button.toggleAttribute('data-vf-pressed', pressed);
  };

  const onClick = (event: MouseEvent) => {
    if (button.disabled || event.defaultPrevented) return;
    pressed = !pressed;
    render();
    options.onPressedChange?.(pressed, event);
  };

  render();
  button.addEventListener('click', onClick);

  return {
    disconnect() {
      button.removeEventListener('click', onClick);
    },
    getPressed() {
      return pressed;
    },
    setPressed(nextPressed: boolean) {
      pressed = nextPressed;
      render();
    },
  };
}
